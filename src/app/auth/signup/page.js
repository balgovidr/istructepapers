'use client'

import React, {useState, useEffect} from 'react';
import logo from "@/app/assets/Logo.svg";
import {  createUserWithEmailAndPassword, onIdTokenChanged  } from 'firebase/auth';
import { setDoc, doc } from "firebase/firestore"; 
import { auth, db } from '@/firebase/firebaseClient';
import Alert from '@mui/material/Alert';
import Stack from "@mui/material/Stack";
import IconButton from '@mui/material/IconButton';
import Collapse from '@mui/material/Collapse';
import CloseIcon from '@mui/icons-material/Close';
import { useRouter } from 'next/navigation'
import Head from 'next/head';
import Image from 'next/image';
import nookies from 'nookies';
import {useCreateUserWithEmailAndPassword} from 'react-firebase-hooks/auth'
import { TailSpin } from 'react-loading-icons'
import {  onAuthStateChanged  } from 'firebase/auth';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import { Typography } from '@mui/material';

export default function SignUp() {
  const router = useRouter();
  const params = new URLSearchParams(router.search);
  const previousLink = params.get('redirectTo') || null;
    
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [privacy, setPrivacy] = useState(false);
    const [emailConsent, setEmailConsent] = useState(false);
    const [alert, setAlert] = useState(false);
    const [alertContent, setAlertContent] = useState('');
    const [alertSeverity, setAlertSeverity] = useState('error');
    const [alertCollapse, setAlertCollapse] = React.useState(false);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);

    const [createUserWithEmailAndPassword] = useCreateUserWithEmailAndPassword(auth);

    const onSubmit = async (e) => {
      e.preventDefault()

      setLoading(true)

      if (firstName !== '' && lastName !== '' && privacy) {
        await createUserWithEmailAndPassword(email, password)
          .then(async (userCredential) => {
              // Signed in
              const user = userCredential.user;

              try {
                  const docRef = await setDoc(doc(db, "users", user.uid), {
                    firstName: firstName,
                    lastName: lastName,
                    uid: user.uid,
                    papersViewable: 3,
                    papersAllowed: [],
                    monthsAllowed: [],
                    auditTrail: [],
                    authenticityScore: 0,
                    points: 10,
                    emailConsent: emailConsent,
                    rating: 0,
                    surveyAgreement: 1,
                  });

                  setAlertContent("Registration complete. Signing in...");
                  setAlertSeverity('success')
                  setAlert(true);
                  setAlertCollapse(true);
                  setTimeout(() => {
                      setAlertCollapse(false);
                    }, 3000);

                  navigate("/")
                } catch (e) {
                  console.error("Error adding document: ", e);
                }
              
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
                    }
                  }
                });
          })
          .catch((error) => {
              const errorCode = error.code;
              const errorMessage = error.message;

              setAlertContent(errorMessage);
              setAlertSeverity('error')
              setAlert(true);
              setAlertCollapse(true);
              setTimeout(() => {
                  setAlertCollapse(false);
                }, 3000);

              // ..
          });
      } else {
        if (!privacy) {
          setAlertContent("Please accept our privacy policy to sign up.");
        } else {
          setAlertContent("Please fill in all fields to sign up.");
        }
        setAlertSeverity('error')
        setAlert(true);
        setAlertCollapse(true);
        setTimeout(() => {
            setAlertCollapse(false);
          }, 3000);
      }
 
      setLoading(false)

    }

    /** Listen for auth state changes */
  useEffect(() => {
    onAuthStateChanged(auth, async (result) => {
        setUser(result);

        try {
          // Sending info to the server
          await fetch("/api/login", {
              method: "POST",
              headers: {
              Authorization: `Bearer ${await result.getIdToken()}`,
              },
          });
          router.push("/")
        } catch(error) {
            const errorCode = error.code;
            const errorMessage = error.message;
        }
    });
});

  return (
    <div className="row full-height">
      <Head>
          <title>Structural Papers - Sign up</title>
          <meta name="description" content="Solved IStructE exam papers - Sign up for a new account"/>
      </Head>
        <div className="col-1 background-color-primary center mob-hide">
            <Image src={logo} alt="Paper trail logo" height="100"/>
        </div>
        <div className="col-1 column pd-a-10p">
            <h1 className="text-3xl self-center font-extralight">Registration</h1>
            <div className="column">
                <label htmlFor="first-name">First Name</label>
                <input type="text" className="form-control" id="first-name" placeholder="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required/>
                <label htmlFor="last-name">Last Name</label>
                <input type="text" className="form-control" id="last-name" placeholder="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} required/>
                <label htmlFor="email">Email</label>
                <input type="email" className="form-control" id="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required/>
                <label htmlFor="password">Password</label>
                <input type="password" className="form-control" id="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required/>
                <FormGroup>
                  <FormControlLabel control={<Checkbox checked={privacy} onChange={() => setPrivacy(!privacy)} size="small" />} label={<Typography className="text-sm">I have read and understood the privacy policy found in the link below.</Typography>} className='text-sm'/>
                  <FormControlLabel control={<Checkbox checked={emailConsent} onChange={() => setEmailConsent(!emailConsent)} size="small" />} label={<Typography className="text-sm">By checking the box, you agree to receive occasional emails from us with helpful exam preparation tips, and updates about our services.</Typography>} size="small" />
                </FormGroup>
                <div className="row justify-content-center align-items-center mg-t-25">
                    <button type="submit" onClick={onSubmit} className="btn btn-primary">{loading ? <TailSpin stroke="#97BCC7" height={25}/> : "Sign Up"}</button>
                    <a href="/auth/login" className="mg-l-20 font-size-12 text-color-grey underline">I&apos;m already a member</a>
                </div>
                <div className='flex flex-row justify-center items-center w-full my-10'>
                <a href="/privacy-policy" className="mg-l-20 font-size-12 text-color-grey underline">Privacy policy</a>
                </div>
            </div>
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