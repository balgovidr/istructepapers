'use client'

import React, {useState} from 'react';
import logo from "@/app/assets/Logo.svg";
import {  sendPasswordResetEmail  } from 'firebase/auth';
import {auth} from '@/firebase/config'
import Alert from '@mui/material/Alert';
import Stack from "@mui/material/Stack";
import IconButton from '@mui/material/IconButton';
import Collapse from '@mui/material/Collapse';
import CloseIcon from '@mui/icons-material/Close';
import Image from 'next/image';
import { useRouter } from 'next/navigation'
import Head from 'next/head';

export default function ForgotPassword() {
    const router = useRouter();
    const params = new URLSearchParams(router.search);
    const previousLink = params.get('redirectTo') || null;
    
    const [email, setEmail] = useState('');
    const [alert, setAlert] = useState(false);
    const [alertContent, setAlertContent] = useState('');
    const [alertSeverity, setAlertSeverity] = useState('error');
    const [alertCollapse, setAlertCollapse] = React.useState(false);
 
    const onSubmit = async (e) => {
      e.preventDefault()
        
      sendPasswordResetEmail(auth, email)
        .then(() => {
            // Password reset email sent!
            setAlertContent('Password reset email sent!');
            setAlertSeverity('success')
            setAlert(true);
            setAlertCollapse(true);
            setTimeout(() => {
                setAlertCollapse(false);
              }, 3000);

            if (previousLink) {
                router.push(previousLink)
            } else {
                router.push("/")
                //Todo - Fix the router. Doesn't work on any of the pages
            }
        })
        .catch((error) => {
            const errorMessage = error.message;

            setAlertContent(errorMessage);
            setAlertSeverity('error')
            setAlert(true);
            setAlertCollapse(true);
            setTimeout(() => {
                setAlertCollapse(false);
              }, 3000);
        });
         
    }

  return (
    <div className="row full-height">
        <Head>
            <title>Reset Password - Solved IStructE exam papers</title>
            <meta name="description" content="Reset your password to access Structural Papers." />
            <link rel="canonical" href={process.env.NEXT_PUBLIC_HOST + '/auth/forgot-password'} />
            <meta property="og:title" content="Reset Password - Structural Papers" />
            <meta property="og:description" content="Reset your password to access Structural Papers." />
            <meta property="og:type" content="website" />
            <meta property="og:url" content={process.env.NEXT_PUBLIC_HOST + '/auth/forgot-password'} />
            <meta property="og:image" content={process.env.NEXT_PUBLIC_HOST + '/opengraph-image.webp'} />
        </Head>
        <div className="col-1 background-color-primary center mob-hide">
            <Image src={logo} alt="Structural Papers logo" height="100"/>
        </div>
        <div className="col-1 column pd-a-10p">
            <h1 className="text-3xl self-center font-extralight">Reset Password</h1>
            <form className="column">
                <label htmlFor="email">Email</label>
                <input type="email" className="form-control" id="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required/>
                <div className="row justify-content-center align-items-center mg-t-25">
                    <button type="submit" onClick={onSubmit} className="btn btn-primary">Reset password</button>
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