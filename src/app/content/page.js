import { db } from '../../firebase';
import { collection, getDocs } from "@firebase/firestore";

async function getData() {    
    //Fetch paper data
    let papers = null;

    try {
        const querySnapshot = await getDocs(collection(db, "solvedPapers"));

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
    return {
        papers,
    };
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
            {/* <Head>
                <title>Archive browser - Solved IStructE exam papers</title>
                <meta name="Archive browser" content="Browse and select the year and month of the paper you would like to view" />
            </Head> */}
            <div class="flex flex-row flex-wrap mg-t-50 justify-center button-container">
                <a class="btn btn-primary-outline min-w-[150px] mx-[5%]" href="/upload">Upload a paper</a>
                <a class="btn btn-primary-outline min-w-[150px] mx-[5%]" href="/surveys">Answer questions</a>
            </div>
            <hr class="solid"/>

            <h1 className="text-2xl mb-5">Solved <span className="text-gradient d-inline">IStructE</span> paper repository</h1>
            <div class="font-size-20">Pick a year and month from below to view solved papers.</div>
            <div class="grid mg-l-10p mg-r-10p center">
                {data.papers.map((item, index) => (
                    <a key={index} class="cell" href={'./filter?year='+item.year+'&month='+item.month}>
                        <h2 class="mg-b-10">{item.year}</h2>&nbsp;
                        <h3 class="mg-t-10">{getMonthName(item.month)}</h3>
                    </a>
                ))}
            </div>
        </div>
    )
}