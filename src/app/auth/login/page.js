'use client'

import React, {useState} from 'react';
import logo from "@/app/assets/Logo.svg";
import { auth } from '@/firebase/firebaseClient';
import Alert from '@mui/material/Alert';
import Stack from "@mui/material/Stack";
import IconButton from '@mui/material/IconButton';
import Collapse from '@mui/material/Collapse';
import CloseIcon from '@mui/icons-material/Close';
import Image from 'next/image';
import { useRouter } from 'next/navigation'
import Head from 'next/head';
import { TailSpin } from 'react-loading-icons';
import { signInWithEmailAndPassword } from 'firebase/auth';


export default function Login() {
    const router = useRouter();
    const params = new URLSearchParams(router.search);
    const previousLink = params.get('redirectTo') || null;
    
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [alert, setAlert] = useState(false);
    const [alertContent, setAlertContent] = useState('');
    const [alertSeverity, setAlertSeverity] = useState('error');
    const [alertCollapse, setAlertCollapse] = React.useState(false);
    const [loading, setLoading] = useState(false);
 
    const onSubmit = async (e) => {
      e.preventDefault()
      setLoading(true)
      
      signInWithEmailAndPassword(auth, email, password)
        .then(async (userCredential) => {
            // Signed in
            const user = userCredential.user;

            // Sending info to the server
            fetch("/api/login", {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${await user.getIdToken()}`,
                },
              }).then((response) => {
                if (response.status === 200) {
                  if (previousLink) {
                    router.push(previousLink)
                  } else {
                    router.push("/")
                    //Todo - Fix the router. Doesn't work on any of the pages
                  }
                }
              });
        })
        .catch((error) => {
            const errorCode = error.code;
            let errorMessage = error.message;

            if (errorCode === "auth/invalid-email") {
              errorMessage = "Could not find a user with this email"
            } else if (errorCode === "auth/invalid-email") {
              errorMessage = "That doesn't look like a proper email"
            } else if (errorCode === "auth/wrong-password" || errorCode === "auth/invalid-login-credentials") {
              errorMessage = "That's not the right email and password combination"
            } else if (errorCode === "auth/missing-password") {
              errorMessage = "We need a password to go ahead"
            }

            setAlertContent(errorMessage);
            setAlertSeverity('error')
            setAlert(true);
            setAlertCollapse(true)
            setTimeout(() => {
                setAlertCollapse(false);
              }, 3000);
        });

        setLoading(false)
         
    }

  return (
    <div className="row full-height">
        <Head>
            <title>Login - Structural Papers</title>
            <meta name="Login" content="Log in to your account"/>
        </Head>
        <div className="col-1 background-color-primary center mob-hide">
            <Image src={logo} alt="Paper trail logo" height="100"/>
        </div>
        <div className="col-1 column pd-a-10p">
            <h1 className="text-3xl self-center font-extralight">Login</h1>
            <form className="column">
                <label htmlFor="email">Email</label>
                <input type="email" className="form-control" id="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required/>
                <label htmlFor="password">Password</label>
                <input type="password" className="form-control" id="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required/>
                <div className="row justify-content-center align-items-center mg-t-25">
                    <button type="submit" onClick={onSubmit} className="btn btn-primary">{loading ? <TailSpin stroke="#97BCC7" height={25}/> : "Login"}</button>
                    <a href="/auth/forgot-password" className="mg-l-20 font-size-12 text-color-grey underline">Forgot my password</a>
                    <a href="/auth/signup" className="mg-l-20 font-size-12 text-color-grey underline">Sign up</a>
                </div>
            </form>
            <Stack sx={{ width: "100%" }} spacing={2}>
                <Collapse in={alertCollapse}>
                    {alert ? <Alert severity={alertSeverity} action={
                        <IconButton aria-label="close" color="inherit" size="small" onClick={() => {setAlertCollapse(false);}}>
                            <CloseIcon fontSize="inherit" />
                        </IconButton>
                    }>{alertContent}</Alert> : <></> }
                </Collapse>
            </Stack>
        </div>
    </div>
  );
}