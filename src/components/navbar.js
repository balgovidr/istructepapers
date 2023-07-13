import React, {useState, useEffect} from "react";
import logo from "../assets/Logo.svg";
import { auth } from '../firebase';
import {  onAuthStateChanged  } from 'firebase/auth';
import { signOut } from "firebase/auth";

export default function Navbar() {
    const [user, setUser] = useState(null);

    /** Listen for auth state changes */
    useEffect(() => {
        onAuthStateChanged(auth, (result) => {
            setUser(result);
        });
    });

    
    const submitSignOut = async (e) => {
        e.preventDefault()
        
        signOut(auth).then(() => {
            // Sign-out successful.
        }).catch((error) => {
            // An error happened.
            console.log(error.message)
        });
    }
    
    return(
        <nav>
            <div className="row space-between align-items-center">
                <a href="/" className="row align-items-center">
                    <img src={logo} alt="Paper trail logo" height="50"/>
                    <span className="h1 mg-l-10">PAPER TRAIL</span>
                </a>
                
                <div className="row">
                    <div className="align-items-center">
                        {user ?
                            <div>
                                <button className="btn btn-white-outline" onClick={submitSignOut}>Logout</button>
                            </div>
                        :
                            <div>
                                <a className="btn btn-white-outline" href="/signup">Sign up</a>
                                <a className="btn btn-white mg-l-10" href="/login">Login</a>
                            </div>
                        }
                        
                    </div>
                </div>
            </div>
        </nav>
    )
}