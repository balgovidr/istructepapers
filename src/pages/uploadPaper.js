import React, {useState, useEffect} from "react";
import '../App.css';
import logo from "../assets/Logo.svg";
import {  onAuthStateChanged  } from 'firebase/auth';
import { collection, addDoc, setDoc, doc } from "firebase/firestore"; 
import {auth, db, storage } from '../firebase';
import Alert from '@mui/material/Alert';
import CheckIcon from '@mui/icons-material/Check';
import Stack from "@mui/material/Stack";
import IconButton from '@mui/material/IconButton';
import Collapse from '@mui/material/Collapse';
import Button from '@mui/material/Button';
import CloseIcon from '@mui/icons-material/Close';
import { NavLink, useNavigate } from 'react-router-dom';
import { getDownloadURL, getStorage, ref, uploadBytes, uploadBytesResumable } from "firebase/storage";
import { format } from 'date-fns';


export default function UploadPaper() {
    // const [user, setUser] = useState(null);
    // const [year, setYear] = useState(null);
    const [date, setDate] = useState(null);
    const [questionNumber, setQuestionNumber] = useState(null);
    const [attempted, setAttempted] = useState([]);
    const [file, setFile] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [alert, setAlert] = useState(false);
    const [alertContent, setAlertContent] = useState('');
    const [alertSeverity, setAlertSeverity] = useState('error');
    const [alertCollapse, setAlertCollapse] = React.useState(false);

    const user = auth.currentUser;

    /** Listen for auth state changes */
    useEffect(() => {
        
    });

    function appendToAttempted(value) {
        if (attempted.includes(value)) {
            const newList = attempted.filter((item) => item !== value)

            setAttempted(newList);
        } else {
            const newList = attempted.concat(value)

            setAttempted(newList);
        }
    }

    function getExtension(filename) {
        return filename.split('.').pop()
    }

    const onSubmit = async (e) => {
        e.preventDefault()

        console.log(file)

        if (getExtension(file).toLowerCase() !== "pdf") {
            console.log('not pdf')
            setAlertContent("Please upload a pdf file.");
            setAlertSeverity('error')
            setAlert(true);
            setAlertCollapse(true);
            setTimeout(() => {
                setAlertCollapse(false);
              }, 3000);
        } else {
            console.log('is pdf')
            const month = date.substring(5, 7)
            const year = date.substring(0, 4)
            const today = format(new Date(), 'yyyy-MM-dd-kk-mm-ss');
            const filePath = 'solvedPapers/'+year+'-'+month+'-'+questionNumber+'-'+user.uid+'-'+today+'.pdf';
            const storageRef = ref(storage, filePath);
            const File = File(file)

            const uploadTask = uploadBytesResumable(storageRef, File);
            
            uploadTask.on('state_changed',
                (snapshot) => {
                    setAlertContent('Uploading...');
                    setAlertSeverity('info')
                    setAlert(true);
                    setAlertCollapse(true);

                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
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
                            filePath: filePath,
                            downloadUrl: downloadUrl,
                            owner: user.uid
                        }).then(()=> {
                            setAlertContent('Upload completed.');
                            setAlertSeverity('success')
                            setAlert(true);
                            setAlertCollapse(true);
                            setTimeout(() => {
                                setAlertCollapse(false);
                            }, 3000);
                        });
                    })
                })
        }  
     
      }

    // let dateDropdown = document.getElementById('year-dropdown'); 
       
    // let currentYear = new Date().getFullYear();    
    // let earliestYear = 1990;
    // while (currentYear >= earliestYear) {      
    //     let dateOption = document.createElement('option');          
    //     dateOption.text = currentYear;      
    //     dateOption.value = currentYear;        
    //     dateDropdown.add(dateOption);      
    //     currentYear -= 1;    
    // }

    return (
        <div class="row full-height">
            <div class="col-1 background-color-primary center">
                <img src={logo} alt="Paper trail logo" height="100"/>
            </div>
            <div class="col-1 column pd-a-10p">
                <h2>Upload a solved paper</h2>
                <span class="font-size-15 text-align-left">Once you've solved an IStructE Chartered Membership Exam's past paper, upload it so others can learn using it!</span>
                <br />
                <span class="font-size-15 text-align-left">If you choose it, make your paper commentable and recieve feedback.</span>
                <hr class="solid"/>
                <form class="column">
                    {/* <label for="year">Year</label>
                    <select id='year-dropdown' class="form-control" value={year} onChange={(e) => setYear(e.target.value)}   required>
                    </select> */}
                    <label for="month">Month and Year</label>
                    <input type="month" class="form-control" id="month" value={date} onChange={(e) => setDate(e.target.value)}   required/>
                    <label for="last-name">Question number</label>
                    <input type="number" class="form-control" id="question-number" placeholder="1" value={questionNumber} onChange={(e) => setQuestionNumber(e.target.value)} min="1" max="8" required/>
                    <label for="attempted" class="mg-b-5">Parts attempted</label>
                    <div class="row">
                        <button type="button" onClick={(e) => appendToAttempted("1a")} className={"btn mg-r-10 " + (attempted.includes("1a") ? "btn-primary" : "btn-primary-outline")}>1a</button>
                        <button type="button" onClick={(e) => appendToAttempted("1b")} className={"btn mg-r-10 " + (attempted.includes("1b") ? "btn-primary" : "btn-primary-outline")}>1b</button>
                        <button type="button" onClick={(e) => appendToAttempted("2a")} className={"btn mg-r-10 " + (attempted.includes("2a") ? "btn-primary" : "btn-primary-outline")}>2a</button>
                        <button type="button" onClick={(e) => appendToAttempted("2b")} className={"btn mg-r-10 " + (attempted.includes("2b") ? "btn-primary" : "btn-primary-outline")}>2b</button>
                        <button type="button" onClick={(e) => appendToAttempted("2c")} className={"btn " + (attempted.includes("2c") ? "btn-primary" : "btn-primary-outline")}>2c</button>
                    </div>
                    <label for="password" class="mg-t-20">Attach pdf file</label>
                    <input type="file" class="form-control" id="file" name="Attach" value={file} onChange={(e) => setFile(e.target.value)} required/>

                    <div class="row justify-content-center align-items-center mg-t-25">
                        <button type="submit" onClick={onSubmit} class="btn btn-primary">Upload</button>
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