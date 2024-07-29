import { doc, increment, updateDoc, getDoc } from "firebase/firestore";
import UserProfile from "@/components/userProfile";
import RatePaper from "@/components/ratePaper";
import Comments from "@/components/comments";
import PaperComponent from '@/components/paper';
import { db } from "@/firebase/config";
import { cookies } from "next/headers";
import { ButtonsWithPoints } from "@/components/buttons";
import { fetchSettings } from "@/functions/settings";

var displayedPages = 0
const pointSettings = await fetchSettings("points");

async function getUserData(user) {
  let userData = null

  //Fetch user information
  if (user !== null) {
    try {
      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists) {
        userData = userDocSnap.data()
      } else {
        // docSnap.data() will be undefined in this case
      }
    } catch (error) {
    }
  }
  
  return userData
}

async function getPaper(context) {
  const id = context.searchParams.id
  let paper = null

  //Fetch paper data
  try {
    const docRef = doc(db, "solvedPapers", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists) {
        paper = docSnap.data();
        paper.id = docSnap.id;
    } else {
      // docSnap.data() will be undefined in this case
    }
  } catch (error) {
  }

  return paper
}

async function getDisplayedPages(user, paper) {
  let displayedPages = 0

  if (user) {
    // If the user is logged in, check if they have prior access to this specific paper or this months paper
    if (user.papersAllowed.includes(paper.id) || user.monthsAllowed.includes(paper.month + '-' + paper.year)) {
      displayedPages = "All";
    } else if (user.points >= pointSettings.paperView) {
        // If they don't have access to this paper, then deduct from their credits and show the paper
        await updateDoc(doc(db, "users", user.uid), {
            papersAllowed: [...user.papersAllowed, paper.id],
            points: increment(-1 * pointSettings.paperView)
        })
        //Todo - Update costs of viewing a paper to be a variable that's fetched
        
        displayedPages = "All";
    } else {
      displayedPages = 1
    }
} else {
  displayedPages = 2
}

return displayedPages
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
    description: ("View a solution for the IStructE exam of " + paper.year + " " + getMonthName(paper.month) + " Question " + paper.questionNumber + ". Be inspired by new solutions, rank them and comment your thoughts."),
    alternates: {
      canonical: process.env.NEXT_PUBLIC_HOST + '/paper?id=' + context.searchParams.id,
    },
    openGraph: {
      title: (paper.year + " " + getMonthName(paper.month) + " Question " + paper.questionNumber + " - Structural Papers"),
      description: ("View a solution for the IStructE exam of " + paper.year + " " + getMonthName(paper.month) + " Question " + paper.questionNumber + ". Be inspired by new solutions, rank them and comment your thoughts."),
      url: process.env.NEXT_PUBLIC_HOST + '/paper?id=' + context.searchParams.id,
      siteName: 'Structural Papers',
      images: [
        {
          url: process.env.NEXT_PUBLIC_HOST + '/opengraph-image.webp',
          width: 1200,
          height: 628,
          alt: 'Image describing Structural Papers',
        },
      ],
      type: 'article',
    },
  }
}

export default async function Viewer(context) {
  let user = null
  let userData = null
  const paper = await getPaper(context);
  const id = context.searchParams.id

  try {
    const session = cookies().get("session");
    const encodedResponse = await fetch(process.env.NEXT_PUBLIC_HOST + "/api/login", {method: "GET",
      headers: { Cookie: `session=${session?.value}` }, });
    const response = await encodedResponse.json();

    if (response.isLogged) {
      user = response.user
      userData = await getUserData(user)
    } else {
      if (response.error == "auth/session-cookie-expired") {
      }
    }
  } catch (error) {
    //Likely no user found
  }

  const displayedPages = await getDisplayedPages(userData, paper)

  function limitReached() {
    if (user) {
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
  }
  if (paper) {
    return (
      <div className="column viewer">
        <div className="pdf-container pdf-container-viewer align-items-center column">
            <PaperComponent paper={paper} pageLimit={displayedPages} />
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

  return (
    <div className="flex flex-col">
      <h1 className="text-3xl self-center font-extralight flex flex-row align-middle gap-2">
        <p className="d-inline h2">{paper.year + ' ' + getMonthName(paper.month)}</p>
        <p className="d-inline h2">|</p>
        <p className="d-inline">Question number: {paper.questionNumber}</p>
      </h1>
      <div className="text-md">Paper could not be loaded. Please refresh the page or go back to the <a href="/content">contents page</a>.</div>
    </div>
  )
}

//Todo - Erase field after comment
//Todo - Don't show page allowance until page has loaded. Or show a large page loading page.