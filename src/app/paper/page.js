import { doc, increment, updateDoc, getDoc } from "firebase/firestore";
import UserProfile from "@/components/userProfile";
import RatePaper from "@/components/ratePaper";
import Comments from "@/components/comments";
import PaperComponent from '@/components/paper';
import { db } from "@/firebase/config";

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

function getMonthName(monthNumber) {
  const date = new Date();
  date.setMonth(monthNumber - 1);

  return date.toLocaleString('en-US', { month: 'short' });
}

export async function generateMetadata(context) {
  const paper = await getPaper(context);
  //Todo - improve metadata for each paper
 
  return {
	title: ("IStructE " + getMonthName(paper.month) + " " + paper.year + " Question " + paper.questionNumber + "solution - Structural Papers"),
	description: ("View a solution for the IStructE exam of " + paper.year + " " + getMonthName(paper.month) + " Question " + paper.questionNumber + ". Be inspired by new solutions, rank them and comment your thoughts."),
	alternates: {
	  canonical: process.env.NEXT_PUBLIC_HOST + '/paper?id=' + context.searchParams.id,
	},
	openGraph: {
	  title: ("IStructE " + getMonthName(paper.month) + " " + paper.year + " Question " + paper.questionNumber + "solution - Structural Papers"),
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
  const paper = await getPaper(context);
  const paperId = context.searchParams.id

  if (paper) {
	return (
	  <div className="column viewer">
		<PaperComponent paper={paper} />
		<div className="tail-container mt-2.5 mb-5">
		  <h1 className="text-3xl self-center font-extralight flex flex-row align-middle gap-2">
			  <p className="d-inline h2">IStructE {paper.year + ' ' + getMonthName(paper.month)} solution</p>
			  <p className="d-inline h2">|</p>
			  <p className="d-inline">Question number: {paper.questionNumber}</p>
		  </h1>
		  <div className="row justify-content-space-between info">
			  <UserProfile uid={paper.owner} />
			  <RatePaper id={paper.id} />
		  </div>
		  {/* <Comments paperId={paper.id} user={user} userData={userData}/> */}
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