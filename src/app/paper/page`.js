import { db, auth } from '@/firebase';
import { getDoc, doc, updateDoc } from "@firebase/firestore";
import { Document, Page, pdfjs } from "react-pdf";
import { onAuthStateChanged } from '@firebase/auth';
import UserProfile from "@/components/userProfile";
import RatePaper from "@/components/ratePaper";
import Comments from "@/components/comments";
import Head from "next/head";
import PaperComponent from "@/components/paper";
import getUser from '@/functions/login.tsx';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.js',
  import.meta.url,
).toString();

async function getUserData() {
  let user = await getUser()

  //Fetch user information
  if (user !== null) {
    try {
      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        user.papersViewable = userDocSnap.data().papersViewable;
        user.papersAllowed = userDocSnap.data().papersAllowed;
        user.monthsAllowed = userDocSnap.data().monthsAllowed;
      } else {
        // docSnap.data() will be undefined in this case
        console.log("No such user!");
      }
    } catch (error) {
      console.error('2Error fetching user data:', error);
    }
  }
}

async function getPaper(context) {
  const id = context.searchParams.id
  let paper = null

  //Fetch paper data
  try {
    const docRef = doc(db, "solvedPapers", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        paper = docSnap.data();
        paper.id = docSnap.id;
        return paper
    } else {
      // docSnap.data() will be undefined in this case
      console.log("No such document!");
    }
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

export default async function Viewer(context) {
  const user = await getUserData();
  const paper = await getPaper(context);
  const id = context.searchParams.id

  function getMonthName(monthNumber) {
    const date = new Date();
    date.setMonth(monthNumber - 1);

    return date.toLocaleString('en-US', { month: 'short' });
  }

  function limitReached() {
    if (user) {
      if (user.papersViewable >= 1) {
        // User is logged in and has enough credits to view the paper
        return null;
      } else {
        // User is logged in but does not have enough credits to view the paper. Ask to upload or answer questions
        return (
          <div className="background-color-light pd-a-10p full-width">
            <h2 className="text-gradient">You&#39;ve already used up your allowance.</h2>
            <br />
            <h2>View the rest of the solved papers of {paper.year + ' ' + getMonthName(paper.month)} by uploading a solved paper of your own or view this paper by answering a few questions.</h2>
            <div className="row mg-t-50 justify-content-center button-container">
              <a className="btn btn-primary-outline" href="/upload">Upload a paper</a>
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
          <div className="row mg-t-50 justify-content-center button-container">
            <a className="btn btn-primary-outline" href="/signup">Sign Up</a>
            <a className="btn btn-primary-outline mg-l-50" href="/login">Login</a>
          </div>
        </div>
      )
    }
  }

  return (
    <div className="column viewer">
      <Head>
          <title>Structural Papers - {paper.year + " " + getMonthName(paper.month) + " Question " + paper.questionNumber}</title>
          <meta name="description" content={"Solved IStructE exam papers - View a solution for the IStructE exam of " + paper.year + " " + getMonthName(paper.month) + " Question " + paper.questionNumber}/>

          {/* Schema.org markup for Solved Paper */}
          <script type="application/ld+json">
            {JSON.stringify({
              "@context": "http://schema.org",
              "@type": "WebPage",
              "name": paper.year + " " + getMonthName(paper.month) + " Question " + paper.questionNumber + " IStructE exam",
              "description": "View a solution for the IStructE exam of " + paper.year + " " + getMonthName(paper.month) + " Question " + paper.questionNumber,
              "url": "https://structuralpapers.com/viewer?id=" + id,
              "mainEntity": {
                "@type": "CreativeWork",
                "name": paper.year + " " + getMonthName(paper.month) + " Question " + paper.questionNumber + " IStructE exam",
                "description": "View a solution for the IStructE exam of " + paper.year + " " + getMonthName(paper.month) + " Question " + paper.questionNumber,
                "url": "https://structuralpapers.com/viewer?id=" + id,
                // "author": {
                //   "@type": "Person",
                //   "name": "John Doe"
                // },
                "datePublished": paper.uploadDate,
                // "image": "https://yourwebsite.com/images/solution-thumbnail.jpg",
                "about": {
                  "@type": "Question",
                  "name": "IStructE Exam Paper " + paper.year + " " + getMonthName(paper.month) + " Question " + paper.questionNumber
                },
                // "interactionStatistic": {
                //   "@type": "InteractionCounter",
                //   "interactionType": "http://schema.org/Comment",
                //   "userInteractionCount": 20
                // },
                // "aggregateRating": {
                //   "@type": "AggregateRating",
                //   "ratingValue": "4.5",
                //   "reviewCount": paper.reviews
                // }
              }
            })}
          </script>
      </Head>
      <div className="pdf-container pdf-container-viewer align-items-center column">
            {paper ?
              <div className="flex flex-col">
                {/* <PaperComponent paper={paper} /> */}
                {limitReached()}
              </div>
            :
              user ?
                <div>This paper doesn&#39;t exist. Try and browse to the right paper again using this <a href="/content">link</a>.</div>
              :
                <div>Please <a href="/login">login</a> first</div>
            }
        {limitReached()}
      </div>
      <div className="tail-container mg-t-10">
        <h1>
            <p className="d-inline h2">{paper.year + ' ' + getMonthName(paper.month)} | </p>
            <p className="d-inline">Question number: {paper.questionNumber}</p>
        </h1>
        <div className="row justify-content-space-between info">
            <UserProfile uid={paper.owner} />
            <RatePaper id={paper.id} />
        </div>
        <Comments paperId={paper.id} />
      </div>
    </div>
  )
}
