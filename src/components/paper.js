'use client'

import { updateDoc, doc, getDoc, increment, getDocs } from 'firebase/firestore';
import { auth, db } from '@/firebase/config';
import React, {useState, useEffect} from 'react';
import { Document, Page, pdfjs } from "react-pdf";
import { onAuthStateChanged  } from 'firebase/auth';
import { fetchSettings } from '@/functions/settings';
import { getStorage, ref, deleteObject } from "firebase/storage";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;
//If facing CORS issues: https://stackoverflow.com/questions/37760695/firebase-storage-and-access-control-allow-origin

export default function PaperComponent({paper, pageLimit = null}) {
    const [displayedPages, setDisplayedPages] = useState(0);
	const [pointSettings, setPointSettings] = useState(undefined);
	const [user, setUser] = useState(undefined);
	const [userData, setUserData] = useState(undefined);
	const [maxPages, setMaxPages] = useState(undefined);
	const [paperAccessible, setPaperAccessible] = useState(false);

	useEffect(() => {
		onAuthStateChanged(auth, async (user) => {
			setUser(user);
		});
	});

	useEffect(() => {
		async function fetchUserData() {
			if (user) {
				try {
					const userDocRef = doc(db, "users", user.uid);
					const userDocSnap = await getDoc(userDocRef);
				
					if (userDocSnap.exists) {
						setUserData(userDocSnap.data())
					}
				} catch (error) {
					throw new Error("Could not fetch user's information")
				}
			}
		}

		fetchUserData()
	}, [user]);

	useEffect(() => {
	  async function fetchData() {
		const pointSettings1 = await fetchSettings('points');
		setPointSettings(pointSettings1)
	  }

	  fetchData();
	}, []);

	// If the user is logged in, check if they have prior access to this specific paper by looping through all papers they have access to
	const checkUserAccessToPaper = async () => {
		const date = new Date()
		if (userData.papersAllowed.length > 0) {
			// The papers allowed list already contains something
			if (typeof(userData.papersAllowed[0]) == "string") {
				// For the old system, the list would have strings instead of objects. If that is the case, delete it.
				await updateDoc(doc(db, "users", user.uid), {
					papersAllowed: [],
				})
			} else {
				// Array is in the new format
				const hasAccess = userData.papersAllowed.some((allowedPaper) => {
					let maxAllowedDate = allowedPaper.startDate.toDate()
					maxAllowedDate.setDate(maxAllowedDate.getDate() + 60);
					// If the paper is in the allowed list and if the paper was bought within the last 60 days then allow access
					return (allowedPaper.paperId == paper.id && maxAllowedDate >= date)
				})

				setPaperAccessible(hasAccess);
    			return hasAccess;
			}
		}

		setPaperAccessible(false)
		return false
	}

	const onDocumentLoadSuccess = async ({ numPages }) => {
		if (userData && user && pointSettings) {
			// If the user does not have access to the paper then show them the preview of 2 pages
			if ((await checkUserAccessToPaper())) {
				setDisplayedPages(numPages)
			} else {
				setDisplayedPages(2)
			}
		} else {
			// For all external visitors show 2 pages
			setDisplayedPages(2)
		}
		setMaxPages(numPages)
	}

	async function viewFullPaper() {
		// User has opted to redeem credits and view the rest of the paper
		if (user !== undefined && userData !== undefined && pointSettings !== undefined) {
			if (userData.points > pointSettings.paperView && !paperAccessible) {
				// Redact credits from the user and append this paper to the user's papers allowed list
				await updateDoc(doc(db, "users", user.uid), {
					papersAllowed: [...userData.papersAllowed, {paperId: paper.id, startDate: new Date()}],
					points: increment(-1 * pointSettings.paperView)
				})

				// Change the number of pages visible to all of the pages
				setDisplayedPages(maxPages)
			} else {
				// User does not have enough credits
				throw Error("User does not have enough credits or already has access to this page. Refresh page.")
			}
		} else {
			throw Error("User is not logged in.")
		}
	}

	async function removePaper() {
		if (userData.hasOwnProperty("access") && userData.access == "admin") {
			// Remove the file from storage first
			const storage = getStorage();

			const fileRef = ref(storage, paper.filePath);

			// Delete the file
			deleteObject(fileRef).then(async () => {
				// File deleted successfully
				const batch = db.batch();

				// Remove all comments for this paper
				const commentsQuery = query(collection(db, "comments"), where("paperId", "==", paper.id));
				const commentsQuerySnapshot = await getDocs(commentsQuery);

				if (commentsQuerySnapshot.length > 0) {
					commentsQuerySnapshot.forEach((doc) => {
						batch.delete(doc.ref);
					});
				}

				//Remove all ratings for this paper
				const paperReviewsQuery = query(collection(db, "paperReviews"), where("paperId", "==", paper.id));
				const paperReviewsQuerySnapshot = await getDocs(paperReviewsQuery);
				
				if (paperReviewsQuerySnapshot.length > 0) {
					paperReviewsQuerySnapshot.forEach((doc) => {
						batch.delete(doc.ref);
					});
				}

				// Remove the firestore entry for the solved paper itself
				batch.delete(doc(db, "solvedPapers", paper.id));

				//Execute all deletes
				await batch.commit();
			}).catch((error) => {
				// Uh-oh, an error occurred!
				console.log(error)
			});

		}
	}

	async function verifyPaper() {
		if (userData.hasOwnProperty("access") && userData.access == "admin") {
			await updateDoc(doc(db, "solvedPapers", paper.id), {
				verified: true
			})
		}
	}

	function LimitReached() {
		if (user !== undefined && userData !== undefined && pointSettings !== undefined) {
		  if (userData.points < pointSettings.paperView && !paperAccessible) {
			// User is logged in but does not have enough credits to view the paper.
			return (
			  <div className="background-color-light pd-a-10p full-width flex flex-col">
				<span className="text-gradient">You do not have enough credits.</span>
				<span>View the rest of this solved paper for 2 months for £2.</span>
				<a className="transition-all px-4 py-1 rounded-md border-primary border text-primary hover:text-white hover:bg-primary flex flex-col items-center self-center mt-4" href="/checkout">
					<span>Go to checkout</span>
				</a>
			  </div>
			)
		  }
		  if (userData.points >= pointSettings.paperView && !paperAccessible) {
			// Provide user with the option to unlock the rest of the paper.
			return (
			  <div className="background-color-light pd-a-10p full-width flex-col flex">
				<span className="text-gradient">View the rest of the paper.</span>
				<span>View the rest of this solved paper for 2 months by redeeming {pointSettings.paperView} credits.</span>
				<button className="transition-all px-4 py-1 rounded-md border-primary border text-primary hover:text-white hover:bg-primary flex flex-col items-center self-center mt-4" onClick={() => viewFullPaper()}>
					<span>Accept</span>
				</button>
			  </div>
			)
		  }
		} else {
		  // User is not logged in. View the rest of the paper by creating an account or logging in.
		  return (
			<div className="background-color-light pd-a-10p full-width">
			  <h2 className="text-gradient">This is just the preview.</h2>
			  <h2>View the rest of this paper by signing up or logging in.</h2>
			  <div className="row mg-t-50 justify-content-center button-container">
				<a className="btn btn-primary-outline" href="/auth/signup">Sign Up</a>
				<a className="btn btn-primary-outline mg-l-50" href="/auth/login">Login</a>
			  </div>
			</div>
		  )
		}
		//Todo - Don't show anything while the user, userData and pointSettings variables are being loaded.
	  }
    
    function PageLoadDiv() {
      return (
        <div className='w-full md:max-w-[800px] md:min-w-[600px] min-h-[1.4vw] md:min-h-[850px] my-3 p-4 overflow-hidden bg-white'>
          <div className="flex flex-col animate-pulse gap-4">
            <div className='h-8 w-2/5 bg-slate-200 rounded'>&nbsp;</div>
            <div className='h-4 w-2/3 bg-slate-200 rounded'>&nbsp;</div>
            <div className='h-[40vh] w-2/3 bg-slate-200 rounded self-center'>&nbsp;</div>
            <div className='h-4 w-3/5 bg-slate-200 rounded self-center'>&nbsp;</div>
            <div className='h-4 w-3/5 rounded'>&nbsp;</div>
            <div className='h-4 w-full bg-slate-200 rounded'>&nbsp;</div>
            <div className='h-4 w-full bg-slate-200 rounded'>&nbsp;</div>
            <div className='h-4 w-full bg-slate-200 rounded'>&nbsp;</div>
            <div className='h-4 w-full bg-slate-200 rounded'>&nbsp;</div>
            <div className='h-4 w-4/5 bg-slate-200 rounded'>&nbsp;</div>
          </div>
        </div>
      )
    }

    return (
        <div className="pdf-container pdf-container-viewer align-items-center column">
			{userData ?
				(userData.hasOwnProperty("access") && userData.access == "admin") ?
					<div className='flex flex-row'>
						<button className='border border-primary p-3' onClick={() => removePaper()}>Remove paper</button>
						<button className='border border-primary p-3' onClick={() => verifyPaper()}>Verify paper</button>
					</div>
				:
					null
			:
				null
			}
			<Document file={paper.downloadUrl} options={{ workerSrc: "/pdf.worker.js" }} onLoadSuccess={onDocumentLoadSuccess} onLoadError={console.error} loading={<PageLoadDiv />}>
				{displayedPages === 0 ?
				<PageLoadDiv /> :
				Array.from({ length: displayedPages }, (_, index) => (
					<div key={index} className='flex flex-col max-w-[100vw] items-center'>
						<Page key={index} pageNumber={index + 1} renderTextLayer={false} renderAnnotationLayer={false} className="!w-full md:max-w-[600px]" loading={<PageLoadDiv />} canvasBackground="#FFFFFF"/>
						<span className="font-size-12 w-full text-center">Page {index+1}</span>
						<br />
					</div>
				))}
			</Document>
			<LimitReached />
		</div>
    )
}