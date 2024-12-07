import { ButtonsWithPoints } from "@/components/buttons";
import { db } from "@/firebase/config";
import { collection, query, where, getDocs } from "firebase/firestore";

async function getData(context) {
    //Fetch papers
    const month = context.searchParams.month
    const year = context.searchParams.year
    let papers = null
  
    try {
        const collectionRef = collection(db, 'solvedPapers');
        let baseQuery = query(collectionRef, where("verified", '==', true));

        if (year !== 'N/A') {
            baseQuery = query(baseQuery, where('year', '==', year));
        }
        if (month !== 'N/A') {
            baseQuery = query(baseQuery, where('month', '==', month));
        }
        
        const querySnapshot = await getDocs(baseQuery);
        const documents = querySnapshot.docs.map((doc) => {
            const value = doc.data();
            value.id = doc.id;
            return value
        });

        papers = documents
    } catch (error) {
        console.error('Error fetching data:', error);
    }
  
    // Pass data to the page via props
    return {
        year, month, papers,
    };
}

function getMonthName(monthNumber) {
    const date = new Date();
    date.setMonth(monthNumber - 1);
  
    return date.toLocaleString('en-US', { month: 'short' });
  }

export async function generateMetadata(context) {
    const data = await getData(context);
    const month = context.searchParams.month
    const year = context.searchParams.year
   
    return {
      title: ("IStructE " + getMonthName(data.month) + " " + data.year + " exam papers - Structural Papers"),
      description: ("View all available IStructE solved past papers from " + getMonthName(data.month) + " " + data.year + ". Pick a solutions and view the solved exam paper's pdf."),
      alternates: {
        canonical: process.env.NEXT_PUBLIC_HOST + '/filter?year=' + year + '&month=' + month,
      },
      openGraph: {
        title: ("IStructE " + getMonthName(data.month) + " " + data.year + " exam papers - Structural Papers"),
        description: ("View all available IStructE solved past papers from " + getMonthName(data.month) + " " + data.year + ". Pick a solutions and view the solved exam paper's pdf."),
        url: process.env.NEXT_PUBLIC_HOST + '/filter?year=' + year + '&month=' + month,
        siteName: 'Structural Papers',
        images: [
          {
            url: process.env.NEXT_PUBLIC_HOST + '/opengraph-image.webp',
            width: 1200,
            height: 628,
            alt: 'Image describing Structural Papers',
          },
        ],
        type: 'website',
      },
    }
  }

export default async function Filter(context) {
    const data = await getData(context);

    return (
        <div className="full-height column content text-center">
            <ButtonsWithPoints />
            <hr className="solid"/>
            <h1 className="text-2xl mb-5">Solved <span className="text-gradient d-inline">IStructE</span> {getMonthName(data.month) + " " + data.year} papers</h1>
            <div className="font-size-20">Pick a solved paper to view.</div>
            <div className="grid mg-l-10p mg-r-10p center h-full">
                {data ? data.papers.map((doc, index) => (
                    <a key={index} className="cell" href={'./paper?id='+doc.id}>
                        <h2 className="mg-t-10">{doc.year + ' ' + getMonthName(doc.month)}</h2>
                        <div className="info">
                            <span>Question number: {doc.questionNumber}</span>
                            <br />
                            <span>Parts attempted: {doc.attempted.map((each, index) => (
                                index === 0 ? each : ', ' + each
                            ))}</span>
                        </div>
                    </a>
                ))
                :
                <div className="text-md">Papers could not be loaded. Please refresh the page or go back to the <a href="/content">contents page</a>.</div>}
            </div>
        </div>
    )
}