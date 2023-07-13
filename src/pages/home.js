import React, {useState, useEffect} from "react";
import '../App.css';
import { auth } from '../firebase';
import {  onAuthStateChanged  } from 'firebase/auth';
import Content from "./content";

export default function Home() {
    const [user, setUser] = useState(null);

    /** Listen for auth state changes */
    useEffect(() => {
        onAuthStateChanged(auth, (result) => {
            setUser(result);
        });
    });

    if (user) {
        return(
            <Content user={user} setUser={setUser}/>
        )
    } else {
        return(
            <Welcome />
        )
    }
}

function Welcome() {
    return (
        <header className="full-height column justify-content-center">
            <h2 className="font-size-50"><span className="d-inline">Resources that </span><span className="text-gradient d-inline">improve your chances</span></h2>
            <div className="font-size-20">The <span className="text-gradient">IStructE</span> membership exam is notoriously difficult. Use the community to help you.</div>
            <div className="row mg-t-100 justify-content-center">
                <a className="btn btn-primary" href="resume.html">Solved papers</a>
                <a className="btn btn-primary-outline mg-l-50" href="projects.html">Upload a paper</a>
            </div>
        </header>
    );
}