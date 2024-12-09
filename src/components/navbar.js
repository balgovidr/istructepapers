"use client"

import React, {useState, useEffect} from "react";
import logo from "@/app/assets/Logo.svg";
import { auth } from '@/firebase/config';
import { signOut, onAuthStateChanged } from "firebase/auth";
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { fetchUserData } from "@/functions/user";
import { Tooltip } from "@mui/material";

export default function Navbar() {
    const [showMenu, setShowMenu] = useState(null);
    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState(null);
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

    //Fetch the user's information
    useEffect(() => {
        async function fetchData() {
            if (user) {
                const userData = await fetchUserData(user.uid);
                
                setUserData(userData)
            }
        }
        
        fetchData()
      }, [user]);
    
    const submitSignOut = async (e) => {
        signOut(auth).then(() => {
            // Client side sign-out successful.
            fetch("/api/logout", {
                method: "POST",
              })
        }).catch((error) => {
            // An error happened.
        });
        setShowMenu(false)
        router.push("/")

    }
    
    return(
        <nav>
            <div className="flex flex-col sm:flex-row space-between align-items-center nav">
                <div className="flex header-container">
                    <Link href="/" className="row align-items-center">
                        <Image src={logo} alt="Structural Papers logo" height={"40"} className="mx-2.5"/>
                        <span className="h1 heading">STRUCTURAL PAPERS</span>
                    </Link>
                    <div onClick={() => {setShowMenu(!showMenu)}} className="mx-4 sm:hidden flex">
                        <IconButton aria-label="close" size="small">
                            <MenuIcon fontSize="inherit" sx={{ color: "#FFFFFF" }}/>
                        </IconButton>
                    </div>
                </div>
                <div className={"flex-row align-middle w-full sm:w-min sm:mr-2.5 sm:flex-shrink-0 justify-center sm:flex " + (showMenu ? "flex" : "hidden")}>
                    <a className="ease-in-out py-1.5 md:py-2 px-4 md:px-6 text-center text-sm md:text-base text-white hover:bg-white/20 mr-3 transition rounded-md items-center md:flex hidden" href="/blog">Blog</a>
                    {user ?
                        <div className="flex flex-row button-container gap-3">
                            {userData?
                                <Tooltip title="Points are used to view papers">
                                    <div className="flex flex-col items-center text-white">
                                        <span className="text-md">{userData.points}</span>
                                        <span className="text-sm">Credits</span>
                                    </div>
                                </Tooltip>
                            :
                                null    
                            }
                            <button className="ease-in-out py-1.5 md:py-2 px-4 md:px-6 text-center text-sm md:text-base rounded-md btn-white-outline" onClick={() => submitSignOut()}>Logout</button>
                        </div>
                    :
                        <div className="flex button-container">
                            <Link className="ease-in-out py-1.5 md:py-2 px-4 md:px-6 text-center text-sm md:text-base rounded-md btn-white-outline min-w-[85px] md:min-w-[110px]" href="/auth/signup">Sign up</Link>
                            <Link className="ease-in-out py-1.5 md:py-2 px-4 md:px-6 text-center text-sm md:text-base rounded-md btn-white mg-l-10" href="/auth/login">Login</Link>
                        </div>
                    }
                </div>
            </div>
        </nav>
    )
}