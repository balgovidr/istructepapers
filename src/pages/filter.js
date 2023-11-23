import React, {useEffect, useState} from "react";
import '../App.css';
import { db } from '../firebase';
import { collection, query, where, getDocs } from "@firebase/firestore";
import { useLocation } from 'react-router-dom';
import { Helmet } from "react-helmet";

export default function Filter() {
    const [papers, setPapers] = useState([]);
    const [loading, setLoading] = useState(true);
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const year = params.get('year') || 'N/A';
    const month = params.get('month') || 'N/A';

    useEffect(() => {
        /** Fetching the solvedPapers data from Firestore */
        const fetchData = async () => {
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
        
                setPapers(documents);
                
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
        <div class="full-height column filter">
            <Helmet>
                <title>Filtered papers - {getMonthName(month) + " " + year} - Solved IStructE exam papers</title>
                <meta name={"Filtered papers - " + getMonthName(month) + " " + year} content={"Filtered papers from " + getMonthName(month) + " " + year}/>
            </Helmet>
            <div class="row mg-t-50 justify-content-center button-container">
                <a class="btn btn-primary-outline mg-l-50" href="/upload">Upload a paper</a>
                <a class="btn btn-primary-outline mg-l-50" href="resume.html">Answer questions</a>
            </div>
            <hr class="solid"/>
            <h1>Solved <span className="text-gradient d-inline">IStructE</span> papers - {getMonthName(month) + " " + year}</h1>
            <div class="font-size-20">Pick a solved paper to view.</div>

            {loading ? (
                <p>Loading...</p>
            ) : (
                <div class="grid mg-l-10p mg-r-10p center">
                    {papers.map((doc, index) => (
                        <a key={index} class="cell" href={'./viewer?id='+doc.id}>
                            <h3 class="mg-t-10">{doc.year + ' ' + getMonthName(doc.month)}</h3>
                            <div className="info">
                                <span>Question number: {doc.questionNumber}</span>
                                <span>Parts attempted: {doc.attempted.map((each, index) => (
                                    index === 0 ? each : ', ' + each
                                ))}</span>
                            </div>
                        </a>
                    ))}
                </div>
            )}
        </div>
    )
}