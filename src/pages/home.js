import React, {useState, useEffect} from "react";
import '../App.css';
import { auth } from '../firebase';
import {  onAuthStateChanged  } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

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
            <h2 className="font-size-50"><span className="d-inline">Resources that </span><span className="text-gradient d-inline">improve your chances</span></h2>
            <div className="font-size-20">The <span className="text-gradient">IStructE</span> membership exam is notoriously difficult. Use the community to help you.</div>
            <div className="row mg-t-100 justify-content-center button-container">
                <a className="btn btn-primary" href="/content">Solved papers</a>
                <a className="btn btn-primary-outline mg-l-50" href="/upload">Upload a paper</a>
            </div>
        </header>
    );
}