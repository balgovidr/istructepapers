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
        <header class="full-height column justify-content-center">
            <h2 class="font-size-50"><span class="d-inline">Resources that </span><span class="text-gradient d-inline">improve your chances</span></h2>
            <div class="font-size-20">The <span class="text-gradient">IStructE</span> membership exam is notoriously difficult. Use the community to help you.</div>
            <div class="row mg-t-100 justify-content-center">
                <a class="btn btn-primary" href="resume.html">Solved papers</a>
                <a class="btn btn-primary-outline mg-l-50" href="projects.html">Upload a paper</a>
            </div>
        </header>
    );
}