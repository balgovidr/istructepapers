import React, {useState} from 'react';
import '../App.css';
import logo from "../assets/Logo.svg";
import { useNavigate } from 'react-router-dom';
import {  createUserWithEmailAndPassword  } from 'firebase/auth';
import { setDoc, doc } from "firebase/firestore"; 
import { auth, db } from '../firebase';
import Alert from '@mui/material/Alert';
import Stack from "@mui/material/Stack";
import IconButton from '@mui/material/IconButton';
import Collapse from '@mui/material/Collapse';
import CloseIcon from '@mui/icons-material/Close';


export default function SignUp() {
    const navigate = useNavigate();
    
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [alert, setAlert] = useState(false);
    const [alertContent, setAlertContent] = useState('');
    const [alertSeverity, setAlertSeverity] = useState('error');
    const [alertCollapse, setAlertCollapse] = React.useState(false);
 
    const onSubmit = async (e) => {
      e.preventDefault()
     
      await createUserWithEmailAndPassword(auth, email, password)
        .then(async (userCredential) => {
            // Signed in
            const user = userCredential.user;
            console.log(user);
            try {
                const docRef = await setDoc(doc(db, "users", user.uid), {
                  firstName: firstName,
                  lastName: lastName,
                  uid: user.uid,
                  papersViewable: 3,
                  papersAllowed: [],
                  monthsAllowed: []
                });
                console.log("Document written with ID: ", docRef.id);

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
            
            // ...
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.log(errorCode, errorMessage);

            setAlertContent(errorMessage);
            setAlertSeverity('error')
            setAlert(true);
            setAlertCollapse(true);
            setTimeout(() => {
                setAlertCollapse(false);
              }, 3000);

            // ..
        });
 
   
    }

  return (
    <div class="row full-height">
        <div class="col-1 background-color-primary center">
            <img src={logo} alt="Paper trail logo" height="100"/>
        </div>
        <div class="col-1 column pd-a-10p">
            <h2>Registration</h2>
            <form class="column">
                <label for="first-name">First Name</label>
                <input type="text" class="form-control" id="first-name" placeholder="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)}   required/>
                <label for="last-name">Last Name</label>
                <input type="text" class="form-control" id="last-name" placeholder="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} required/>
                <label for="email">Email</label>
                <input type="email" class="form-control" id="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required/>
                <label for="password">Password</label>
                <input type="password" class="form-control" id="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required/>
                <div class="row justify-content-center align-items-center mg-t-25">
                    <button type="submit" onClick={onSubmit} class="btn btn-primary">Sign Up</button>
                    <a href="/login" class="mg-l-20 font-size-12 text-color-grey underline">I'm already a member</a>
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