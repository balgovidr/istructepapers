import { doc, updateDoc } from "firebase/firestore";
import { pdfjs } from "react-pdf";
import UserProfile from "@/components/userProfile";
import RatePaper from "@/components/ratePaper";
import Comments from "@/components/comments";
import PaperComponent from '@/components/paper';
import { InitializeFirestore } from "@/firebase/firebaseAdmin";
import { cookies } from "next/headers";

async function getUserData(user) {
  const db = InitializeFirestore()
  let userData = null

  //Fetch user information
  if (user !== null) {
    try {
      const userDocRef = db.collection("users").doc(user.uid);
      const userDocSnap = await userDocRef.get();

      if (userDocSnap.exists) {
        userData = userDocSnap.data()
      } else {
        // docSnap.data() will be undefined in this case
        console.log("No such user!");
      }
    } catch (error) {
      console.error('1Error fetching user data:', error);
    }
  }
  
  return userData
}

async function getPaper(context) {
  const db = InitializeFirestore()
  const id = context.searchParams.id
  let paper = null

  //Fetch paper data
  try {
    const docRef = db.collection("solvedPapers").doc(id);
    const docSnap = await docRef.get();

    if (docSnap.exists) {
        paper = docSnap.data();
        paper.id = docSnap.id;
    } else {
      // docSnap.data() will be undefined in this case
      console.log("No such document!");
    }
  } catch (error) {
    console.error('Error fetching data:', error);
  }

  return paper
}

function getMonthName(monthNumber) {
  const date = new Date();
  date.setMonth(monthNumber - 1);

  return date.toLocaleString('en-US', { month: 'short' });
}

export async function generateMetadata(context) {
  const paper = await getPaper(context);
  //Todo - improve metadata for each paper
 
  return {
    title: (paper.year + " " + getMonthName(paper.month) + " Question " + paper.questionNumber + " - Structural Papers"),
    description: ("Solved IStructE exam papers - View a solution for the IStructE exam of " + paper.year + " " + getMonthName(paper.month) + " Question " + paper.questionNumber + ". Be inspired by a new solution, rank the solution and comment your thoughts on it."),
  }
}

export default async function Viewer(context) {
  let user = null
  let userData = null
  const paper = await getPaper(context);
  const id = context.searchParams.id

  try {
    const session = cookies().get("session");
    const encodedResponse = await fetch(process.env.NEXT_PUBLIC_DB_HOST + "/api/login", {method: "GET",
      headers: { Cookie: `session=${session?.value}` }, });
    const response = await encodedResponse.json();

    if (response.isLogged) {
      user = response.user
      userData = await getUserData(user)
    } else {
      if (response.error == "auth/session-cookie-expired") {
        console.log("stuff1")
      }
    }
  } catch (error) {
    //Likely no user found
    console.log(error)
  }

  function limitReached() {
    if (user) {
      if (user.papersViewable < 1 && !userData.papersAllowed.includes(paper.id) && !userData.monthsAllowed.includes(paper.month + '-' + paper.year)) {
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
            <a className="btn btn-primary-outline" href="/auth/signup">Sign Up</a>
            <a className="btn btn-primary-outline mg-l-50" href="/auth/login">Login</a>
          </div>
        </div>
      )
    }
  }
  
  return (
    <div className="column viewer">
      {/* <Head> */}
          {/* Schema.org markup for Solved Paper */}
          {/* <script type="application/ld+json">
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
          </script> */}
      {/* </Head> */}
      <div className="pdf-container pdf-container-viewer align-items-center column">
          <PaperComponent paper={paper} user={userData} />
          {limitReached()}
      </div>
      <div className="tail-container mt-2.5 mb-5">
        <h1 className="text-3xl self-center font-extralight flex flex-row align-middle gap-2">
            <p className="d-inline h2">{paper.year + ' ' + getMonthName(paper.month)}</p>
            <p className="d-inline h2">|</p>
            <p className="d-inline">Question number: {paper.questionNumber}</p>
        </h1>
        <div className="row justify-content-space-between info">
            <UserProfile uid={paper.owner} />
            <RatePaper id={paper.id} />
        </div>
        <Comments paperId={paper.id} user={user} userData={userData}/>
      </div>
    </div>
  )
}

//Todo - Erase field after comment
//Todo - Don't show page allowance until page has loaded. Or show a large page loading page.