'use client'

import React, {useState, useEffect, useRef} from "react";
import logo from "@/app/assets/Logo.svg";
import { collection, addDoc, updateDoc, doc, arrayUnion, getDoc, increment, query, where, getDocs } from "firebase/firestore"; 
import { auth, db, storage } from '@/firebase/config';
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
import SparkMD5 from 'spark-md5';
import { useRouter } from 'next/navigation';

export default function UploadPaper() {
    const [date, setDate] = useState(undefined);
    const [questionNumber, setQuestionNumber] = useState(undefined);
    const [attempted, setAttempted] = useState([]);
    const [file, setFile] = useState(undefined);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [alert, setAlert] = useState(false);
    const [alertContent, setAlertContent] = useState('');
    const [alertSeverity, setAlertSeverity] = useState('error');
    const [alertCollapse, setAlertCollapse] = useState(false);
    const [user, setUser] = useState(null);
    const [schemeDiagram, setSchemeDiagram] = useState(undefined);
    const [userAllowedToUpload, setUserAllowedToUpload] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter()

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
        var error = false

        //Check that all required fields have been input
        if (!date || !questionNumber || !attempted || !file) {
            error = true
            setAlertContent('Please ensure that all required fields are complete.');
            setAlertSeverity('error')
            setAlert(true);
            setAlertCollapse(true);
            setTimeout(() => {
                setAlertCollapse(false);
            }, 4000);
        }

        //Check that the file is a pdf
        if (file.name.split('.').pop().toLowerCase() !== "pdf") {
            error = true
            setAlertContent('Please ensure that the file is a pdf.');
            setAlertSeverity('error')
            setAlert(true);
            setAlertCollapse(true);
            setTimeout(() => {
                setAlertCollapse(false);
            }, 3000);
        }

        //Check that the file hasn't already been uploaded
        const fileHash = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                const arrayBuffer = event.target.result;
                const bytes = new Uint8Array(arrayBuffer);
                const hash = SparkMD5.ArrayBuffer.hash(bytes);
                resolve(hash);
            };
            reader.onerror = (event) => {
                reject(event.target.error);
            };
            reader.readAsArrayBuffer(file);
        });
        
        // Create a reference to the solvedPapers collection
        const uploadedFilesRef = collection(db, "solvedPapers");

        // Create a query against the collection.
        const q = query(uploadedFilesRef, where("fileHash", "==", fileHash));

        const querySnapshot = await getDocs(q);
        //File has been found. Don't let the user upload it again.
        if (querySnapshot.size > 0) {
            error = true
            setAlertContent('This file has already been uploaded.');
            setAlertSeverity('error')
            setAlert(true);
            setAlertCollapse(true);
            setTimeout(() => {
                setAlertCollapse(false);
            }, 3000);
        }

        const pointSettings = await fetchSettings("points");
        const timestamp = Date.now();

        if (!error) {
            const month = date.substring(5, 7)
            const year = date.substring(0, 4)
            const today = format(new Date(), 'yyyy-MM-dd-kk-mm-ss');
            const filePath = 'solvedPapers/'+year+'-'+month+'-'+questionNumber+'-'+user.uid+'-'+today+'.pdf';
            const storageRef = ref(storage, filePath);

            const uploadTask = uploadBytesResumable(storageRef, file);
            
            uploadTask.on('state_changed',
                (snapshot) => {
                    const progress = Math.floor((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
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
                        let docContents = {
                            year: year,
                            month: month,
                            questionNumber: questionNumber,
                            attempted: attempted,
                            filePath: filePath,
                            downloadUrl: downloadUrl,
                            owner: user.uid,
                            uploadDate: today,
                            reviews: 0,
                            verified: false,
                            fileHash: fileHash
                        }
                        //Adding in the scheme diagram variable if it exists
                        if (schemeDiagram) {
                            docContents = {...docContents, diagram: schemeDiagram}
                        }

                        addDoc(collection(db, "solvedPapers"), docContents)
                        
                        updateDoc(doc(db, "users", user.uid), {
                            //Todo - Newer papers have better score. Newest paper has the most score.
                            points: increment(pointSettings.paperUpload),
                            auditTrail: arrayUnion({timestamp: timestamp, reason: "You've uploaded a paper'. You've received " + pointSettings.paperUpload + " additional points."}),
                        })

                        setAlertContent('Upload completed.');
                        setAlertSeverity('success')
                        setAlert(true);
                        setAlertCollapse(true);
                        setTimeout(() => {
                            setAlertCollapse(false);
                        }, 3000);
                    });

                    //Reset the form fields
                    router.push('/upload')
                })
        }
        setLoading(false);
      }

      if (userAllowedToUpload) {
        return (
            <div className="row full-height-navbar-discount">
                <Head>
                    <title>Upload solved IStructE exam papers - Structural Papers</title>
                    <meta name="description" content="Upload your solved and scanned IStructE exam papers to gain points and access a repository of other papers to guide your exam preparation."/>
                    <link rel="canonical" href={process.env.NEXT_PUBLIC_HOST + '/uploads'} />
                    <meta property="og:title" content="Upload solved IStructE exam papers - Structural Papers" />
                    <meta property="og:description" content="Upload your solved and scanned IStructE exam papers to gain points and access a repository of other papers to guide your exam preparation." />
                    <meta property="og:type" content="website" />
                    <meta property="og:url" content={process.env.NEXT_PUBLIC_HOST} />
                    <meta property="og:image" content={process.env.NEXT_PUBLIC_HOST + '/opengraph-image.webp'} />
                </Head>
                <div className="col-1 background-color-primary center hidden md:flex">
                    <Image src={logo} alt="Structural Papers logo" height="100"/>
                </div>
                <div className="col-1 column pd-a-10p sm:overflow-y-auto">
                    <h1 className="text-3xl self-center font-extralight">Upload a solved paper</h1>
                    <br />
                    <span className="font-size-15 text-align-left">Once you&#39;ve solved an IStructE Chartered Membership Exam&#39;s past paper, upload it so others can learn using it!</span>
                    <br />
                    {/* <span className="font-size-15 text-align-left">If you choose it, make your paper commentable and recieve feedback.</span> */}
                    <hr className="solid"/>
                    <form className="column">
                        <label htmlFor="month">Month and Year *</label>
                        <input type="month" className="form-control mg-b-20" id="month" value={date} onChange={(e) => setDate(e.target.value)}   required/>
                        <label htmlFor="last-name">Question number *</label>
                        <input type="number" className="form-control mg-b-20" id="question-number" placeholder="1" value={questionNumber} onChange={(e) => setQuestionNumber(e.target.value)} min="1" max="8" required/>
                        <label htmlFor="attempted" className="mg-b-5">Parts attempted *</label>
                        <div className="row mg-b-20 button-container">
                            <button type="button" onClick={(e) => appendToAttempted("1a")} className={"btn mg-r-10 " + (attempted.includes("1a") ? "btn-accent" : "btn-primary-outline")}>1a</button>
                            <button type="button" onClick={(e) => appendToAttempted("1b")} className={"btn mg-r-10 " + (attempted.includes("1b") ? "btn-accent" : "btn-primary-outline")}>1b</button>
                            <button type="button" onClick={(e) => appendToAttempted("2a")} className={"btn mg-r-10 " + (attempted.includes("2a") ? "btn-accent" : "btn-primary-outline")}>2a</button>
                            <button type="button" onClick={(e) => appendToAttempted("2b")} className={"btn mg-r-10 " + (attempted.includes("2b") ? "btn-accent" : "btn-primary-outline")}>2b</button>
                            <button type="button" onClick={(e) => appendToAttempted("2c")} className={"btn " + (attempted.includes("2c") ? "btn-accent" : "btn-primary-outline")}>2c</button>
                        </div>
                        <label htmlFor="scheme-diagram">What page is a scheme diagram on?</label>
                        <input type="number" className="form-control mg-b-20" id="scheme-diagram" placeholder="1" value={schemeDiagram} onChange={(e) => setSchemeDiagram(e.target.value)} min="1" required/>
                        <label htmlFor="password" className="mg-t-20">Attach pdf file *</label>
                        <input type="file" accept="application/pdf" className="form-control" id="file" name="Attach" onChange={(e) => setFile(e.target.files[0])} onClick={e =>  (e.target.value = "")} required/>

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
                    <title>Upload solved IStructE exam papers - Structural Papers</title>
                    <meta name="description" content="Upload your solved and scanned IStructE exam papers to gain points and access a repository of other papers to guide your exam preparation."/>
                    <link rel="canonical" href={process.env.NEXT_PUBLIC_HOST + '/uploads'} />
                    <meta property="og:title" content="Upload solved IStructE exam papers - Structural Papers" />
                    <meta property="og:description" content="Upload your solved and scanned IStructE exam papers to gain points and access a repository of other papers to guide your exam preparation." />
                    <meta property="og:type" content="website" />
                    <meta property="og:url" content={process.env.NEXT_PUBLIC_HOST} />
                    <meta property="og:image" content={process.env.NEXT_PUBLIC_HOST + '/opengraph-image.webp'} />
                </Head>
                <div className="col-1 background-color-primary center mob-hide">
                    <Image src={logo} alt="Structural Papers logo" height="100"/>
                </div>
                <div className="col-1 column pd-a-10p justify-content-center">
                    <h1 className="text-3xl self-center font-extralight">Upload a solved paper</h1>
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
                <title>Upload solved IStructE exam papers - Structural Papers</title>
                <meta name="description" content="Upload your solved and scanned IStructE exam papers to gain points and access a repository of other papers to guide your exam preparation."/>
                <link rel="canonical" href={process.env.NEXT_PUBLIC_HOST + '/uploads'} />
                <meta property="og:title" content="Upload solved IStructE exam papers - Structural Papers" />
                <meta property="og:description" content="Upload your solved and scanned IStructE exam papers to gain points and access a repository of other papers to guide your exam preparation." />
                <meta property="og:type" content="website" />
                <meta property="og:url" content={process.env.NEXT_PUBLIC_HOST} />
                <meta property="og:image" content={process.env.NEXT_PUBLIC_HOST + '/opengraph-image.webp'} />
            </Head>
            <div className="col-1 background-color-primary center mob-hide">
                <Image src={logo} alt="Structural Papers logo" height="100"/>
            </div>
            <div className="col-1 column pd-a-10p justify-content-center">
                <h1 className="text-3xl self-center font-extralight">Upload a solved paper</h1>
                <span className="font-size-15 text-align-left">You&#39;ve uploaded too many invalid papers, you can not upload any more. Please carry out surveys to be able to view further solved papers.</span>
            </div>
        </div>
    );
}