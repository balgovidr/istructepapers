import React, {useState, useEffect} from "react";
import logo from "../assets/Logo.svg";
import { auth } from '../firebase';
import {  onAuthStateChanged  } from 'firebase/auth';
import { signOut } from "firebase/auth";
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';

export default function Navbar() {
    const [user, setUser] = useState(null);
    const [showMenu, setShowMenu] = useState(null);
    const [windowSize, setWindowSize] = useState([
        window.innerWidth,
        window.innerHeight,
      ]);
    
    useEffect(() => {
    const handleWindowResize = () => {
        setWindowSize([window.innerWidth, window.innerHeight]);
    };

    window.addEventListener('resize', handleWindowResize);

    if (windowSize[0] < 601) {
        setShowMenu(false)
    } else {
        setShowMenu(true)
    }

    return () => {
        window.removeEventListener('resize', handleWindowResize);
    };
    }, [windowSize]);

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

    function toggleShowMenu () {
        if (showMenu) {
            setShowMenu(false)
        } else {
            setShowMenu(true)
        }
    }
    
    return(
        <nav>
            <div className="row space-between align-items-center flex-wrap nav">
                <div className="flex header-container">
                    <a href="/" className="row align-items-center">
                        <img src={logo} alt="Paper trail logo" height={windowSize[0] > 601 ? "50" : "40"}/>
                        <span className="h1 mg-l-10 heading">PAPER TRAIL</span>
                    </a>
                    <IconButton aria-label="close" size="small" onClick={() => {toggleShowMenu();}} style={{display: windowSize[0] > 601 ? "none" : "flex"}}>
                        <MenuIcon fontSize="inherit" sx={{ color: "#FFFFFF" }}/>
                    </IconButton>
                </div>
                <div className="row align-items-center button-container" style={{display: showMenu ? "flex" : "none", marginTop: windowSize[0] > 601 ? "0px" : "10px"}}>
                    {user ?
                        <div className="flex button-container">
                            <button className="btn btn-white-outline" onClick={submitSignOut}>Logout</button>
                        </div>
                    :
                        <div className="flex button-container">
                            <a className="btn btn-white-outline" href="/signup">Sign up</a>
                            <a className="btn btn-white mg-l-10" href="/login">Login</a>
                        </div>
                    }
                </div>
            </div>
        </nav>
    )
}