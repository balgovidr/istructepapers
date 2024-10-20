'use client'

import React, {useState, useEffect} from "react";
import { collection, getDocs, writeBatch, query, where } from "firebase/firestore"; 
import { auth, db } from '@/firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { fetchUserData } from "@/functions/user";
import { CircularProgress } from "@mui/material";
import { getMonthName } from "@/functions/paper";

export default function Dashboard() {
    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [unverifiedPapers, setUnverifiedPapers] = useState(undefined);

    /** Listen for auth state changes */
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (result) => {
            setUser(result);
        });

        return () => {
            unsubscribe();
        };
    }, []);

    //Fetch the user's information
    useEffect(() => {
        async function fetchData() {
            if (user) {
                const userData = await fetchUserData(user.uid);
                
                setUserData(userData)
            }
        }

        async function fetchUnverifiedPapers() {
            const papersRef = collection(db, "solvedPapers");
            const q = query(papersRef, where("verified", "==", false));
            const querySnapshot = await getDocs(q);

            setUnverifiedPapers(querySnapshot.docs)
        }
        
        fetchData()
        fetchUnverifiedPapers()
    }, [user]);

    async function setAllPointsZero() {
        setLoading(true)

        if (userData.access == "admin") {
            const querySnapshot = await getDocs(collection(db, "users"));

            const batch = writeBatch(db);

            querySnapshot.forEach((doc) => {
                batch.update(doc.ref, {
                    points: 0
                });
            });

            await batch.commit();
        }

        setLoading(false);
    }

    if (loading) {
        return <CircularProgress />
    }
    
    if (!userData) {
        return (
            <div className="row full-height">
                <div className="col-1 column pd-a-10p justify-content-center">
                    <h1 className="text-3xl self-center font-extralight">Upload a solved paper</h1>
                    <br />
                    <span className="font-size-15">Please create an account or login first.</span>
                    <div className="row mg-t-50 justify-content-center button-container">
                        <a className="btn btn-primary-outline" href="/auth/signup">Sign Up</a>
                        <a className="btn btn-primary-outline mg-l-50" href="/auth/login">Login</a>
                    </div>
                </div>
            </div>
        );
    } else {
        if (userData.hasOwnProperty("access") && userData.access == "admin") {
            return (
                <div className="h-full">
                    <button onClick={() => {setAllPointsZero()}}>Set all points to zero</button>
                    <br />
                    <span>View all unverified papers:</span>
                    {unverifiedPapers ? unverifiedPapers.map((data, index) => {
                        const doc = data.data()
                    return (
                        <a key={index} className="cell" href={'./paper?id='+data.id}>
                            <h2 className="mg-t-10">{doc.year + ' ' + getMonthName(doc.month)}</h2>
                            <div className="info">
                                <span>Question number: {doc.questionNumber}</span>
                                <br />
                                <span>Parts attempted: {doc.attempted ? doc.attempted.map((each, index) => (
                                    index === 0 ? each : ', ' + each
                                )) : null}</span>
                            </div>
                        </a>
                    )})
                    :
                    null}
                </div>
            )
        } else {
            return null
        }
    }
}