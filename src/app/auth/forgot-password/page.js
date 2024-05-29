'use client'

import React, {useState} from 'react';
import logo from "@/app/assets/Logo.svg";
import {  sendPasswordResetEmail  } from 'firebase/auth';
import { auth} from '@/firebase/firebaseClient';
import Alert from '@mui/material/Alert';
import CheckIcon from '@mui/icons-material/Check';
import Stack from "@mui/material/Stack";
import IconButton from '@mui/material/IconButton';
import Collapse from '@mui/material/Collapse';
import Button from '@mui/material/Button';
import CloseIcon from '@mui/icons-material/Close';
import Image from 'next/image';
import Head from 'next/head';

export default function ForgotPassword() {
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
        {/* <Head>
            <title>Reset Password - Solved IStructE exam papers</title>
            <meta name="Reset Password" content="Reset a forgotten password" />
        </Head> */}
        <div className="col-1 background-color-primary center mob-hide">
            <Image src={logo} alt="Paper trail logo" height="100"/>
        </div>
        <div className="col-1 column pd-a-10p">
            <h1>Reset Password</h1>
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