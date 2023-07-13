import React, { useEffect, useState } from "react";
import '../App.css';
import { db, auth } from '../firebase';
import { getDoc, doc, updateDoc, arrayUnion } from "@firebase/firestore";
import { useLocation } from 'react-router-dom';
import { Document, Page, pdfjs } from "react-pdf";
import { onAuthStateChanged } from 'firebase/auth';
import UserProfile from "../components/userProfile";
import RatePaper from "../components/ratePaper";
import Comments from "../components/comments";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

export default function Viewer() {
  const [paper, setPaper] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const id = params.get('id') || 'N/A';
  const [displayedPages, setDisplayedPages] = useState(0);
  const [user, setUser] = useState(null);

  useEffect(() => {
    /** Fetching the solvedPapers data from Firestore */
    const fetchData = async () => {
      try {
        const docRef = doc(db, "solvedPapers", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            var tempDoc = docSnap.data();
            tempDoc.id = docSnap.id;
            setPaper(tempDoc);
        } else {
          // docSnap.data() will be undefined in this case
          console.log("No such document!");
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          var tempUser = user;
          tempUser.papersViewable = userDocSnap.data().papersViewable;
          tempUser.papersAllowed = userDocSnap.data().papersAllowed;
          tempUser.monthsAllowed = userDocSnap.data().monthsAllowed;
          setUser(tempUser);
        } else {
          // docSnap.data() will be undefined in this case
          console.log("No such user!");
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    }

    if (user !== null) {
      fetchUserData();
    }
  }, [user]);

  /** Listen for auth state changes */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (result) => {
      setUser(result);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  function getMonthName(monthNumber) {
    const date = new Date();
    date.setMonth(monthNumber - 1);

    return date.toLocaleString('en-US', { month: 'short' });
  }

  const onDocumentLoadSuccess = async ({ numPages }) => {
    if (user) {
        // If the user is logged in, check if they have prior access to this specific paper or this months paper
        if (user.papersAllowed.includes(paper.id) || user.monthsAllowed.includes(paper.month + '-' + paper.year)) {
            setDisplayedPages(numPages);
        } else if (user.papersViewable >= 1) {
            // If they don't have access to this paper, then deduct from their credits and show the paper
            await updateDoc(doc(db, "users", user.uid), {
                papersAllowed: [...user.papersAllowed, paper.id],
                papersViewable: user.papersViewable-1
            })
        
            setDisplayedPages(numPages);
        } else {
            setDisplayedPages(1)
        }
    } else {
      setDisplayedPages(2)
    }
  };

  function limitReached() {
    if (user) {
      if (user.papersViewable >= 1) {
        // User is logged in and has enough credits to view the paper
        return null;
      } else {
        // User is logged in but does not have enough credits to view the paper. Ask to upload or answer questions
        return (
          <div className="background-color-light pd-a-10p full-width">
            <h2 className="text-gradient">You've already used up your allowance.</h2>
            <br />
            <h2>View the rest of the solved papers of {paper.year + ' ' + getMonthName(paper.month)} by uploading a solved paper of your own or view this paper by answering a few questions.</h2>
            <div className="row mg-t-50 justify-content-center">
              <a className="btn btn-primary-outline mg-l-50" href="/upload">Upload a paper</a>
              <a className="btn btn-primary-outline mg-l-50" href="/surveys">Answer questions</a>
            </div>
          </div>
        )
      }
    } else {
      // User is not logged in. View the rest of the paper by creating an account or logging in.
      return (
        <div className="background-color-light pd-a-10p full-width">
          <h2 className="text-gradient">This is just the preview.</h2>
          <h2>View the rest of this paper by signing up or logging in.</h2>
          <div className="row mg-t-50 justify-content-center">
            <a className="btn btn-primary-outline mg-l-50" href="/signup">Sign Up</a>
            <a className="btn btn-primary-outline mg-l-50" href="/login">Login</a>
          </div>
        </div>
      )
    }
  }

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="column">
      <div className="pdf-container align-items-center column">
        <Document file={paper.downloadUrl} options={{ workerSrc: "/pdf.worker.js" }} onLoadSuccess={onDocumentLoadSuccess} onLoadError={console.error}>
          {displayedPages === 0 ?
            <p>Loading...</p> :
            Array.from({ length: displayedPages }, (_, index) => (
              <Page key={index} pageNumber={index + 1} renderTextLayer={false} renderAnnotationLayer={false} />
            ))}
        </Document>
        {limitReached()}
      </div>
      <div className="tail-container mg-t-10">
        <div>
            <h2 className="d-inline">{paper.year + ' ' + getMonthName(paper.month)}</h2>
            <p className="d-inline"> | Question number: {paper.questionNumber}</p>
        </div>
        <div className="row justify-content-space-between">
            <UserProfile uid={paper.owner} />
            <RatePaper id={paper.id} />
        </div>
        <Comments paperId={paper.id} />
      </div>
    </div>
  )
}
