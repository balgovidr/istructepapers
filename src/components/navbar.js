"use client"

import React, {useState, useEffect} from "react";
import logo from "../../public/Logo.svg";
import { auth } from '../firebase';
import { signOut, onAuthStateChanged } from "@firebase/auth";
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Image from "next/image";
import Link from "next/link";
import nookies from 'nookies';
import { useRouter } from "next/navigation";

export default function Navbar() {
    const [showMenu, setShowMenu] = useState(null);
    const [windowSize, setWindowSize] = useState([
        undefined,
        undefined,
      ]);
    const [user, setUser] = useState(null);
    const router = useRouter()

    /** Listen for auth state changes */
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (result) => {
            setUser(result);
        });

        return () => {
            unsubscribe();
        };
    }, []);
    
    useEffect(() => {
        if (typeof window !== "undefined") {
            const handleWindowResize = () => {
                setWindowSize([window.innerWidth, window.innerHeight]);
                console
            };

            window.addEventListener('resize', handleWindowResize);

            if (window.innerWidth < 700) {
                setShowMenu(false)
            } else {
                setShowMenu(true)
            }

            return () => {
                window.removeEventListener('resize', handleWindowResize);
            };
        }
    }, [windowSize]);
    
    const submitSignOut = async (e) => {
        
        signOut(auth).then(() => {
            // Sign-out successful.
            nookies.destroy(null, 'token')
            router.push('/')
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
            <div className="flex flex-col sm:flex-row space-between align-items-center nav">
                <div className="flex header-container">
                    <Link href="/" className="row align-items-center">
                        <Image src={logo} alt="Paper trail logo" height={"40"} className="mx-2.5"/>
                        <span className="h1 heading">STRUCTURAL PAPERS</span>
                    </Link>
                    <IconButton aria-label="close" size="small" onClick={() => {toggleShowMenu();}} className="mx-4 sm:hidden">
                        <MenuIcon fontSize="inherit" sx={{ color: "#FFFFFF" }}/>
                    </IconButton>
                </div>
                <div className={"flex-row align-middle w-full sm:w-min sm:mr-2.5 sm:flex-shrink-0 justify-center sm:flex " + (showMenu ? "flex" : "hidden")}>
                    {user ?
                        <div className="flex button-container">
                            <button className="ease-in-out py-1.5 md:py-2 px-4 md:px-6 text-center text-sm md:text-base rounded-md btn-white-outline" onClick={() => submitSignOut()}>Logout</button>
                        </div>
                    :
                        <div className="flex button-container">
                            <Link className="ease-in-out py-1.5 md:py-2 px-4 md:px-6 text-center text-sm md:text-base rounded-md btn-white-outline min-w-[85px] md:min-w-[110px]" href="/signup">Sign up</Link>
                            <Link className="ease-in-out py-1.5 md:py-2 px-4 md:px-6 text-center text-sm md:text-base rounded-md btn-white mg-l-10" href="/login">Login</Link>
                        </div>
                    }
                </div>
            </div>
        </nav>
    )
}