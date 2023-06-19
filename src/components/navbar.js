import React from "react";
import logo from "../assets/Logo.svg"

export default function Navbar() {
    return(
        <nav>
            <div class="row space-between align-items-center">
                <a href="index.html" class="row align-items-center">
                    <img src={logo} alt="Paper trail logo" height="50"/>
                    <span class="h1 mg-l-10">PAPER TRAIL</span>
                </a>
                
                <div class="row">
                    <div class="align-items-center">
                        <a class="btn btn-white-outline" href="/signup">Sign up</a>
                        <a class="btn btn-white mg-l-10" href="/login">Login</a>
                    </div>
                </div>
            </div>
        </nav>
    )
}