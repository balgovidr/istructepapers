'use client'

import { updateDoc, doc, getDoc, increment } from 'firebase/firestore';
import { auth, db } from '@/firebase/config';
import React, {useState, useEffect} from 'react';
import { Document, Page, pdfjs } from "react-pdf";
import { onAuthStateChanged  } from 'firebase/auth';
import { fetchSettings } from '@/functions/settings';
import { ButtonsWithPoints } from "@/components/buttons";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;
//If facing CORS issues: https://stackoverflow.com/questions/37760695/firebase-storage-and-access-control-allow-origin

export default function PaperComponent({paper, pageLimit = null}) {
    const [displayedPages, setDisplayedPages] = useState(0);
	const [pointSettings, setPointSettings] = useState(undefined);
	const [user, setUser] = useState(undefined);
	const [userData, setUserData] = useState(undefined);
	const [maxPages, setMaxPages] = useState(undefined);

	useEffect(() => {
		onAuthStateChanged(auth, async (user) => {
			console.log(1)
			setUser(user);
		});
	});

	useEffect(() => {
		console.log(4)
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
		console.log(2)
		const pointSettings1 = await fetchSettings('points');
		console.log(pointSettings1)
		setPointSettings(pointSettings1)
	  }

	  fetchData();
	}, []);

	const onDocumentLoadSuccess = async ({ numPages }) => {
		console.log(3)
		console.log(paper)
		if (userData && user && pointSettings) {
			console.log(userData)
			console.log(user)
			console.log(pointSettings)
			console.log(numPages)
			// If the user is logged in, check if they have prior access to this specific paper or this months paper
			if (userData.papersAllowed.includes(paper.id) || userData.monthsAllowed.includes(paper.month + '-' + paper.year)) {
				setDisplayedPages(numPages)
			} else if (userData.points >= pointSettings.paperView) {
				// If they don't have access to this paper, then deduct from their credits and show the paper
				await updateDoc(doc(db, "users", user.uid), {
					papersAllowed: [...userData.papersAllowed, paper.id],
					points: increment(-1 * pointSettings.paperView)
				})
				//Todo - Update costs of viewing a paper to be a variable that's fetched

				setDisplayedPages(numPages)
			} else {
				setDisplayedPages(1)
			}
		} else {
		setDisplayedPages(2)
		}
	}

	function LimitReached() {
		if (user !== undefined && userData !== undefined && pointSettings !== undefined) {
		  if (user.points < pointSettings.paperView && !userData.papersAllowed.includes(paper.id) && !userData.monthsAllowed.includes(paper.month + '-' + paper.year)) {
			// User is logged in but does not have enough credits to view the paper. Ask to upload or answer questions
			return (
			  <div className="background-color-light pd-a-10p full-width">
				<span className="text-gradient">You&#39;ve already used up your allowance.</span>
				<br />
				<span>View the rest of the solved papers of {paper.year + ' ' + getMonthName(paper.month)} by uploading a solved paper of your own or view this paper by answering a few questions.</span>
				<ButtonsWithPoints />
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