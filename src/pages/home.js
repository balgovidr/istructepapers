import React, {useState, useEffect} from "react";
import '../App.css';
import { auth } from '../firebase';
import {  onAuthStateChanged  } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { Helmet } from "react-helmet";


export default function Home() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    /** Listen for auth state changes */
    useEffect(() => {
        onAuthStateChanged(auth, (result) => {
            setUser(result);
        });
    });

    if (user) {
        return(
            navigate("/content")
        )
    } else {
        return(
            <Welcome />
        )
    }
}

function Welcome() {
    return (
        <header className="full-height column justify-content-center welcome">
            <Helmet>
                <title>Solved IStructE exam papers</title>
                <meta name="Homepage" content="Homepage"/>
            </Helmet>
            <h1 className="font-size-50">Solved <span className="text-gradient d-inline">IStructE</span> papers</h1>
            {/* <h2 className="font-size-50"><span className="d-inline">Resources that </span><span className="text-gradient d-inline">improve your chances</span></h2> */}
            <h3 className="font-size-20">The <span className="text-gradient">IStructE</span> membership exam is notoriously difficult. Use the community and our repository of solutions to help you.</h3>
            <div className="row mg-t-100 justify-content-center button-container">
                <a className="btn btn-primary" href="/content">Solved papers</a>
                <a className="btn btn-primary-outline mg-l-50" href="/upload">Upload a paper</a>
            </div>
        </header>
    );
}