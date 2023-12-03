'use client'

import React, {useState, useEffect} from 'react';
import logo from "../../../public/Logo.svg";
import {  signInWithEmailAndPassword, onIdTokenChanged, User } from '@firebase/auth';
import { auth } from '../../firebase';
import Alert from '@mui/material/Alert';
import Stack from "@mui/material/Stack";
import IconButton from '@mui/material/IconButton';
import Collapse from '@mui/material/Collapse';
import CloseIcon from '@mui/icons-material/Close';
import Image from 'next/image';
import { useRouter } from 'next/navigation'
import Head from 'next/head';
import nookies from 'nookies';


export default function Login() {
    const router = useRouter();
    
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [alert, setAlert] = useState(false);
    const [alertContent, setAlertContent] = useState('');
    const [alertSeverity, setAlertSeverity] = useState('error');
    const [alertCollapse, setAlertCollapse] = React.useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const unsubscribe = onIdTokenChanged(auth, async (result) => {
            if (result) {
              setUser(result);
              const token = await result.getIdToken();
              nookies.set(undefined, 'token', token, { path: '/' });
              router.push('/')
            } else {
              setUser(null);
              nookies.set(undefined, 'token', '', { path: '/' });
            }
          }, 10 * 60 * 1000);
       
          return unsubscribe;
    }, []);
 
    const onSubmit = async (e) => {
      e.preventDefault()
        
      signInWithEmailAndPassword(auth, email, password)
        .then(async (userCredential) => {
            // Signed in
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.log(errorCode, errorMessage);

            setAlertContent(errorMessage);
            setAlertSeverity('error')
            setAlert(true);
            setAlertCollapse(true)
            setTimeout(() => {
                setAlertCollapse(false);
              }, 3000);
        });
         
    }

  return (
    <div className="row full-height">
        <Head>
            <title>Structural Papers - Login</title>
            <meta name="Login" content="Log in to your account"/>
        </Head>
        <div className="col-1 background-color-primary center mob-hide">
            <Image src={logo} alt="Paper trail logo" height="100"/>
        </div>
        <div className="col-1 column pd-a-10p">
            <h2>Login</h2>
            <form className="column">
                <label htmlFor="email">Email</label>
                <input type="email" className="form-control" id="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required/>
                <label htmlFor="password">Password</label>
                <input type="password" className="form-control" id="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required/>
                <div className="row justify-content-center align-items-center mg-t-25">
                    <button type="submit" onClick={onSubmit} className="btn btn-primary">Login</button>
                    <a href="/forgot-password" className="mg-l-20 font-size-12 text-color-grey underline">Forgot my password</a>
                    <a href="/signup" className="mg-l-20 font-size-12 text-color-grey underline">Sign up</a>
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