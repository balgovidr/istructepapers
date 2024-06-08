import { ButtonsWithPoints } from "@/components/buttons";
import { initializeFirebase, initializeFirestore } from "@/firebase/firebaseAdmin";
import { collection, get } from "firebase/firestore";

async function getData() {
    const db = initializeFirestore()
    //Fetch paper data
    let papers = null;

    try {
        const papersRef = db.collection("solvedPapers");
        const querySnapshot = await papersRef.get();

        // Filter unique combinations of month and year
        const filteredData = Array.from(
            new Set(querySnapshot.docs.map((item) => `${item.data().month}-${item.data().year}`))
        ).map((key) => {
            const [month, year] = key.split('-');
            return { month, year };
        });

        // Sort the filtered data in descending order of year and month
        const sortedData = filteredData.sort((a, b) => {
            if (a.year === b.year) {
            return b.month - a.month;
            }
            return b.year - a.year;
        });

        papers = sortedData;
    } catch (error) {
        console.error('Error fetching data:', error);
    }
  
    // Pass data to the page via props
    return papers
  }

export const metadata = {
    title: 'IStructE exam sample answers - Structural Papers',
    description: 'Access a number of IStructE exam papers answered by a candidate. Browse and select the year and month of the IStructE exam papers solution pdf you would like to view.',
}

export default async function Content() {
    const data = await getData();

    function getMonthName(monthNumber) {
        const date = new Date();
        date.setMonth(monthNumber - 1);
      
        return date.toLocaleString('en-US', { month: 'short' });
      }

    return (
        <div className="full-height column content text-center">
            <ButtonsWithPoints />
            <hr className="solid"/>

            <h1 className="text-2xl mb-5">Solved <span className="text-gradient d-inline">IStructE</span> paper repository</h1>
            <div className="font-size-20">Pick a year and month from below to view solved papers.</div>
            <div className="grid mg-l-10p mg-r-10p center">
                {data.map((item, index) => (
                    <a key={index} className="cell" href={'./filter?year='+item.year+'&month='+item.month}>
                        <h2 className="mg-b-10">{item.year}</h2>&nbsp;
                        <h3 className="mg-t-10">{getMonthName(item.month)}</h3>
                    </a>
                ))}
            </div>
        </div>
    )
}