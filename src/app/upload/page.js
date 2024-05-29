'use client'

import React, {useState, useEffect} from "react";
import logo from "@/app/assets/Logo.svg";
import { collection, addDoc, updateDoc, doc, arrayUnion, getDoc, increment } from "firebase/firestore"; 
import { auth, db, storage } from '@/firebase/firebaseClient';
import Alert from '@mui/material/Alert';
import Stack from "@mui/material/Stack";
import IconButton from '@mui/material/IconButton';
import Collapse from '@mui/material/Collapse';
import CloseIcon from '@mui/icons-material/Close';
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { format } from 'date-fns';
import { onAuthStateChanged } from 'firebase/auth';
import Image from "next/image";
import Head from "next/head";
import { TailSpin } from 'react-loading-icons';

export default function UploadPaper() {
    const [date, setDate] = useState(undefined);
    const [questionNumber, setQuestionNumber] = useState(undefined);
    const [attempted, setAttempted] = useState([]);
    const [file, setFile] = useState(undefined);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [alert, setAlert] = useState(false);
    const [alertContent, setAlertContent] = useState('');
    const [alertSeverity, setAlertSeverity] = useState('error');
    const [alertCollapse, setAlertCollapse] = React.useState(false);
    const [user, setUser] = useState(null);
    const [schemeDiagram, setSchemeDiagram] = useState(undefined);
    const [userAllowedToUpload, setUserAllowedToUpload] = useState(false);
    const [loading, setLoading] = useState(false);

    //Todo - The papers that the viewer can watch is added to a waiting list and is only appended to the final list after their papers have been verified.

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
        //Checks if the user is reliable enough to carry out surveys and then fetches a paper
        checkUser();
      }, [user]);

    function appendToAttempted(value) {
        if (attempted.includes(value)) {
            const newList = attempted.filter((item) => item !== value)

            setAttempted(newList);
        } else {
            const newList = attempted.concat(value)

            setAttempted(newList);
        }
    }

    const checkUser = async () => {
        if (user) {
            const userRef = doc(db, "users", user.uid);
            const userSnap = await getDoc(userRef);
            const userData = userSnap.data();

            if (userData.points > 0) {
                setUserAllowedToUpload(true);
            }
        }
    }

    const onSubmit = async (e) => {
        e.preventDefault()

        setLoading(true)

        const month = date.substring(5, 7)
        const year = date.substring(0, 4)
        const today = format(new Date(), 'yyyy-MM-dd-kk-mm-ss');
        const filePath = 'solvedPapers/'+year+'-'+month+'-'+questionNumber+'-'+user.uid+'-'+today+'.pdf';
        const storageRef = ref(storage, filePath);

        const uploadTask = uploadBytesResumable(storageRef, file);
        
        uploadTask.on('state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                setAlertContent('Uploading... ' + progress + "%");
                setAlertSeverity('info')
                setAlert(true);
                setAlertCollapse(true);

                setUploadProgress(progress)
            },
            (error) => {
                setAlertContent(error.message);
                setAlertSeverity('error')
                setAlert(true);
                setAlertCollapse(true);
                setTimeout(() => {
                    setAlertCollapse(false);
                }, 3000);
            },
            () => {
                getDownloadURL(uploadTask.snapshot.ref).then((downloadUrl) => {
                    addDoc(collection(db, "solvedPapers"), {
                        year: year,
                        month: month,
                        questionNumber: questionNumber,
                        attempted: attempted,
                        diagram: schemeDiagram,
                        filePath: filePath,
                        downloadUrl: downloadUrl,
                        owner: user.uid,
                        uploadDate: today,
                        reviews: 0,
                        verified: false,
                    })
                    
                    updateDoc(doc(db, "users", user.uid), {
                        monthsAllowed: arrayUnion(month + '-' + year),
                        points: increment(1),
                    })

                    setAlertContent('Upload completed.');
                    setAlertSeverity('success')
                    setAlert(true);
                    setAlertCollapse(true);
                    setTimeout(() => {
                        setAlertCollapse(false);
                    }, 3000);
                });
            })
        
        setLoading(false);
      }

      if (userAllowedToUpload) {
        return (
            <div className="row full-height-navbar-discount">
                <Head>
                    <title>Upload solutions - Structural Papers - Solved IStructE exam papers</title>
                    <meta name="description" content="View more IStructE exam solutions by uploading your own solution. Receive commments and feedback from other candidates."/>
                </Head>
                <div className="col-1 background-color-primary center hidden md:flex">
                    <Image src={logo} alt="Paper trail logo" height="100"/>
                </div>
                <div className="col-1 column pd-a-10p sm:overflow-y-auto">
                    <h1>Upload a solved paper</h1>
                    <br />
                    <span className="font-size-15 text-align-left">Once you&#39;ve solved an IStructE Chartered Membership Exam&#39;s past paper, upload it so others can learn using it!</span>
                    <br />
                    <span className="font-size-15 text-align-left">If you choose it, make your paper commentable and recieve feedback.</span>
                    <hr className="solid"/>
                    <form className="column">
                        <label htmlFor="month">Month and Year</label>
                        <input type="month" className="form-control mg-b-20" id="month" value={date} onChange={(e) => setDate(e.target.value)}   required/>
                        <label htmlFor="last-name">Question number</label>
                        <input type="number" className="form-control mg-b-20" id="question-number" placeholder="1" value={questionNumber} onChange={(e) => setQuestionNumber(e.target.value)} min="1" max="8" required/>
                        <label htmlFor="attempted" className="mg-b-5">Parts attempted</label>
                        <div className="row mg-b-20 button-container">
                            <button type="button" onClick={(e) => appendToAttempted("1a")} className={"btn mg-r-10 " + (attempted.includes("1a") ? "btn-primary" : "btn-primary-outline")}>1a</button>
                            <button type="button" onClick={(e) => appendToAttempted("1b")} className={"btn mg-r-10 " + (attempted.includes("1b") ? "btn-primary" : "btn-primary-outline")}>1b</button>
                            <button type="button" onClick={(e) => appendToAttempted("2a")} className={"btn mg-r-10 " + (attempted.includes("2a") ? "btn-primary" : "btn-primary-outline")}>2a</button>
                            <button type="button" onClick={(e) => appendToAttempted("2b")} className={"btn mg-r-10 " + (attempted.includes("2b") ? "btn-primary" : "btn-primary-outline")}>2b</button>
                            <button type="button" onClick={(e) => appendToAttempted("2c")} className={"btn " + (attempted.includes("2c") ? "btn-primary" : "btn-primary-outline")}>2c</button>
                        </div>
                        <label htmlFor="scheme-diagram">What page is a scheme diagram on?</label>
                        <input type="number" className="form-control mg-b-20" id="scheme-diagram" placeholder="1" value={schemeDiagram} onChange={(e) => setSchemeDiagram(e.target.value)} min="1" required/>
                        <label htmlFor="password" className="mg-t-20">Attach pdf file</label>
                        <input type="file" accept="application/pdf" className="form-control" id="file" name="Attach" onChange={(e) => setFile(e.target.files[0])} required/>

                        <div className="row justify-content-center align-items-center mg-t-25 mg-b-20">
                            <button type="submit" onClick={onSubmit} className="btn btn-primary" disabled={loading}>
                                {loading ? <TailSpin stroke="#652cb3" height={20}/> : "Upload"}
                            </button>
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

    if (!user) {
        return (
            <div className="row full-height">
                <Head>
                    <title>Structural Papers - Upload solved exam papers</title>
                    <meta name="description" content="Solved IStructE exam papers - Upload solved exam papers"/>
                </Head>
                <div className="col-1 background-color-primary center mob-hide">
                    <Image src={logo} alt="Paper trail logo" height="100"/>
                </div>
                <div className="col-1 column pd-a-10p justify-content-center">
                    <h2>Upload a solved paper</h2>
                    <br />
                    <span className="font-size-15">Please create an account or login first.</span>
                    <div className="row mg-t-50 justify-content-center button-container">
                        <a className="btn btn-primary-outline" href="/auth/signup">Sign Up</a>
                        <a className="btn btn-primary-outline mg-l-50" href="/auth/login">Login</a>
                    </div>
                </div>
            </div>
        );
    }
    
    return (
        <div className="row full-height">
            <Head>
                <title>Structural Papers - Upload solved IStructE exam papers</title>
                <meta name="description" content="Solved IStructE exam papers - Upload solved exam papers"/>
            </Head>
            <div className="col-1 background-color-primary center mob-hide">
                <Image src={logo} alt="Paper trail logo" height="100"/>
            </div>
            <div className="col-1 column pd-a-10p justify-content-center">
                <h2>Upload a solved paper</h2>
                <span className="font-size-15 text-align-left">You&#39;ve uploaded too many invalid papers, you can not upload any more. Please carry out surveys to be able to view further solved papers.</span>
            </div>
        </div>
    );
}