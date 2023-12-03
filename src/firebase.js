// Import the functions you need from the SDKs you need
import { initializeApp } from "@firebase/app";
import { getAuth } from "@firebase/auth";
// import { getAnalytics } from "@firebase/analytics";
import { getFirestore } from "@firebase/firestore";
import { getStorage } from "@firebase/storage";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCJTuVp5PURWWkDYQmyB810zXdsHhQSRh0",
  authDomain: "istructepapers.firebaseapp.com",
  projectId: "istructepapers",
  storageBucket: "istructepapers.appspot.com",
  messagingSenderId: "479657269473",
  appId: "1:479657269473:web:730b8d2b614726c5dbbfa0",
  measurementId: "G-4QXX33B0FZ",
  databaseURL: "https://DATABASE_NAME.firebaseio.com",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage();
export default app;