import React, {useEffect, useState} from "react";
import '../App.css';
import { auth, db } from '../firebase';
import {  onAuthStateChanged  } from 'firebase/auth';
import { collection, query, where, getDocs } from "@firebase/firestore";

export default function Content() {
    const [papers, setPapers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        /** Fetching the solvedPapers data from Firestore */
        const fetchData = async () => {
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
        
                setPapers(sortedData);
                
                setLoading(false);
            } catch (error) {
            console.error('Error fetching data:', error);
            setLoading(false);
            }
        };
    
        fetchData();
    }, []);

    function getMonthName(monthNumber) {
        const date = new Date();
        date.setMonth(monthNumber - 1);
      
        return date.toLocaleString('en-US', { month: 'short' });
      }

    return (
        <div class="full-height column content">
            <div class="row mg-t-50 justify-content-center button-container">
                <a class="btn btn-primary-outline" href="/upload">Upload a paper</a>
                <a class="btn btn-primary-outline mg-l-50" href="/surveys">Answer questions</a>
            </div>
            <hr class="solid"/>

            <div class="font-size-20">Pick a year and month from below to view solved papers.</div>

            {loading ? (
                <p>Loading...</p>
            ) : (
                <div class="grid mg-l-10p mg-r-10p center">
                    {papers.map((item, index) => (
                        <a key={index} class="cell" href={'./filter?year='+item.year+'&month='+item.month}>
                            <h2 class="mg-b-10">{item.year}</h2>&nbsp;
                            <h3 class="mg-t-10">{getMonthName(item.month)}</h3>
                        </a>
                    ))}
                </div>
            )}
        </div>
    )
}