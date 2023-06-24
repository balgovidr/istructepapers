import React, {useState} from 'react';
import '../App.css';
import logo from "../assets/Logo.svg";
import { NavLink, useNavigate } from 'react-router-dom';
import {  signInWithEmailAndPassword  } from 'firebase/auth';
import { collection, addDoc, setDoc, doc } from "firebase/firestore";
import { auth, db } from '../firebase';
import Alert from '@mui/material/Alert';
import CheckIcon from '@mui/icons-material/Check';
import Stack from "@mui/material/Stack";
import IconButton from '@mui/material/IconButton';
import Collapse from '@mui/material/Collapse';
import Button from '@mui/material/Button';
import CloseIcon from '@mui/icons-material/Close';


export default function Login() {
    const navigate = useNavigate();
    
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [alert, setAlert] = useState(false);
    const [alertContent, setAlertContent] = useState('');
    const [alertSeverity, setAlertSeverity] = useState('error');
    const [alertCollapse, setAlertCollapse] = React.useState(false);
 
    const onSubmit = async (e) => {
      e.preventDefault()
        
      signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // Signed in
            const user = userCredential.user;
            navigate("/")
            console.log(user);
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
    <div class="row full-height">
        <div class="col-1 background-color-primary center">
            <img src={logo} alt="Paper trail logo" height="100"/>
        </div>
        <div class="col-1 column pd-a-10p">
            <h2>Login</h2>
            <form class="column">
                <label for="email">Email</label>
                <input type="email" class="form-control" id="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required/>
                <label for="password">Password</label>
                <input type="password" class="form-control" id="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required/>
                <div class="row justify-content-center align-items-center mg-t-25">
                    <button type="submit" onClick={onSubmit} class="btn btn-primary">Login</button>
                    <a href="/login" class="mg-l-20 font-size-12 text-color-grey underline">Forgot my password</a>
                    <a href="/signup" class="mg-l-20 font-size-12 text-color-grey underline">Sign up</a>
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