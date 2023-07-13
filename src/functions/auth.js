import React, {useState} from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {  getAuth, signOut, onAuthStateChanged  } from 'firebase/auth';
import { collection, addDoc, setDoc, doc } from "@firebase/firestore";
import { auth, db } from '../firebase';