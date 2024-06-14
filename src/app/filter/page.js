import { ButtonsWithPoints } from "@/components/buttons";
import { initializeFirebase, initializeFirestore } from "@/firebase/firebaseAdmin";

async function getData(context) {
    const db = initializeFirestore()
    //Fetch papers
    const month = context.searchParams.month
    const year = context.searchParams.year
    let papers = null
  
    try {
        const collectionRef = db.collection('solvedPapers');
        let baseQuery = collectionRef;

        if (year !== 'N/A') {
            baseQuery = baseQuery.where('year', '==', year);
        }
        if (month !== 'N/A') {
            baseQuery = baseQuery.where('month', '==', month);
        }
        
        const querySnapshot = await baseQuery.get();
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
   
    return {
      title: ("IStructE exam solutions from " + getMonthName(data.month) + " " + data.year + " - Structural Papers"),
      description: ("View all available IStructE solved exam papers from " + getMonthName(data.month) + " " + data.year + ". Pick a solutions and view the pdf."),
    }
  }

export default async function Filter(context) {
    const data = await getData(context);

    return (
        <div className="full-height column content text-center">
            <ButtonsWithPoints />
            <hr className="solid"/>
            <h1 className="text-2xl mb-5">Solved <span className="text-gradient d-inline">IStructE</span> papers - {getMonthName(data.month) + " " + data.year}</h1>
            <div className="font-size-20">Pick a solved paper to view.</div>
            <div className="grid mg-l-10p mg-r-10p center h-full">
                {data.papers.map((doc, index) => (
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
                ))}
            </div>
        </div>
    )
}