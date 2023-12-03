import { db } from '../../firebase';
import { collection, query, where, getDocs } from "@firebase/firestore";

async function getData(context) {
    //Fetch papers
    const month = context.searchParams.month
    const year = context.searchParams.year
    let papers = null
  
    try {
        const collectionRef = collection(db, 'solvedPapers');
        let baseQuery = collectionRef;

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

export default async function Filter(context) {
    const data = await getData(context);

    function getMonthName(monthNumber) {
        const date = new Date();
        date.setMonth(monthNumber - 1);
      
        return date.toLocaleString('en-US', { month: 'short' });
      }

    return (
        <div className="full-height column content text-center">
            {/* <Head>
                <title>Filtered papers - {getMonthName(props.month) + " " + props.year} - Solved IStructE exam papers</title>
                <meta name={"Filtered papers - " + getMonthName(props.month) + " " + props.year} content={"Filtered papers from " + getMonthName(props.month) + " " + props.year}/>
            </Head> */}
            <div className="flex flex-row flex-wrap row mg-t-50 justify-center button-container">
                <a className="btn btn-primary-outline min-w-[150px] mx-[5%]" href="/upload">Upload a paper</a>
                <a className="btn btn-primary-outline min-w-[150px] mx-[5%]" href="resume.html">Answer questions</a>
            </div>
            <hr className="solid"/>
            <h1 className="text-2xl mb-5">Solved <span className="text-gradient d-inline">IStructE</span> papers - {getMonthName(data.month) + " " + data.year}</h1>
            <div className="font-size-20">Pick a solved paper to view.</div>
            <div className="grid mg-l-10p mg-r-10p center h-full">
                {data.papers.map((doc, index) => (
                    <a key={index} className="cell" href={'./paper?id='+doc.id}>
                        <h3 className="mg-t-10">{doc.year + ' ' + getMonthName(doc.month)}</h3>
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