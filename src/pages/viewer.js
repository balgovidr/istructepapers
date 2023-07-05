import React, { useEffect, useState } from "react";
import '../App.css';
import { db, auth } from '../firebase';
import { getDoc, doc } from "firebase/firestore";
import { useLocation } from 'react-router-dom';
import file1 from '../assets/Balgovind Ranjith CV.pdf'
import { Document, Page, pdfjs } from "react-pdf";
import { onAuthStateChanged } from 'firebase/auth';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

export default function Viewer() {
  const [paper, setPaper] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const id = params.get('id') || 'N/A';
  const [displayedPages, setDisplayedPages] = useState(0);
  const [numPages, setNumPages] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    /** Fetching the solvedPapers data from Firestore */
    const fetchData = async () => {
      console.log('fetching paper data')
      try {
        const docRef = doc(db, "solvedPapers", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            console.log('Setting paper data')
            setPaper(docSnap.data());
            console.log('Set paper data')
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
    console.log('Triggered fetch paper data')
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      console.log('Fetching user data')
      try {
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          var tempUser = user;
          tempUser.papersViewable = userDocSnap.data().papersViewable
          console.log('Setting user data')
          setUser(tempUser);
          console.log('Set user data')
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
      console.log('Triggered fetch user data')
    }
  }, [user]);

//   useEffect(() => {
//     console.log('User or paper has changed')
//     if (user !== null && paper !== null) {
//       console.log('Loading stopped')
//       setLoading(false)
//     }
//   }, [user, paper])

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

  const onDocumentLoadSuccess = ({ numPages }) => {
    console.log('Pdf loaded')
    if (user) {
      if (user.papersViewable >= 1) {
        setDisplayedPages(numPages);
        console.log('Pages set to many')
      } else {
        setDisplayedPages(1)
        console.log('pages set to 1')
      }
    } else {
      setDisplayedPages(3)
      console.log('pages set to 3')
    }
  };

  function limitReached() {
    console.log('Rendering the add on')
    if (user) {
      if (user.papersViewable >= 1) {
        // User is logged in and has enough credits to view the paper
        console.log('Rendering user logged in and can view full paper')
        return null;
      } else {
        // User is logged in but does not have enough credits to view the paper. Ask to upload or answer questions
        console.log('Rendering user logged in but no credit')
        return (
          <div class="background-color-light pd-a-10p full-width">
            <h2 class="text-gradient">You've already seen one paper.</h2>
            <br />
            <h2>View the rest of the solved papers of {paper.year + ' ' + getMonthName(paper.month)} by uploading a solved paper of your own or view this paper by answering a few questions.</h2>
            <div class="row mg-t-50 justify-content-center">
              <a class="btn btn-primary-outline mg-l-50" href="/upload">Upload a paper</a>
              <a class="btn btn-primary-outline mg-l-50" href="/surveys">Answer questions</a>
            </div>
          </div>
        )
      }
    } else {
      // User is not logged in. View the rest of the paper by creating an account or logging in.
      console.log('Rendering user logged out')
      return (
        <div class="background-color-light pd-a-10p full-width">
          <h2 class="text-gradient">This is just the preview.</h2>
          <h2>View the rest of this paper by signing up or logging in.</h2>
          <div class="row mg-t-50 justify-content-center">
            <a class="btn btn-primary-outline mg-l-50" href="/signup">Sign Up</a>
            <a class="btn btn-primary-outline mg-l-50" href="/login">Login</a>
          </div>
        </div>
      )
    }
  }

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div class="column">
      <div class="pdf-container align-items-center column">
        <Document file={paper.downloadUrl} options={{ workerSrc: "/pdf.worker.js" }} onLoadSuccess={onDocumentLoadSuccess} onLoadError={console.error}>
          {displayedPages === 0 ?
            <p>Loading...</p> :
            Array.from({ length: displayedPages }, (_, index) => (
              <Page key={index} pageNumber={index + 1} renderTextLayer={false} renderAnnotationLayer={false} />
            ))}
        </Document>
        {limitReached()}
      </div>
      <div class="tail-container mg-t-10">
        <h2 class="d-inline">{paper.year + ' ' + getMonthName(paper.month)}</h2>
        <p class="d-inline"> | Question number: {paper.questionNumber}</p>
      </div>
    </div>
  )
}
