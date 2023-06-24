import React, {useState, useEffect} from "react";
import '../App.css';
import { auth } from '../firebase';
import {  onAuthStateChanged  } from 'firebase/auth';

export default function Content({ user, setUser }) {
    /** Listen for auth state changes */
    useEffect(() => {
        onAuthStateChanged(auth, (result) => {
            setUser(result);
        });
    });

    return (
        <div class="full-height column">
            <div class="row mg-t-50 justify-content-center">
                <a class="btn btn-primary-outline mg-l-50" href="/upload">Upload a paper</a>
                <a class="btn btn-primary-outline mg-l-50" href="resume.html">Answer questions</a>
            </div>
            <hr class="solid"/>

            <div class="font-size-20">The <span class="text-gradient">IStructE</span> membership exam is notoriously difficult. Use the community to help you.</div>
        </div>
    )
}