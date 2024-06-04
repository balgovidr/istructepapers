'use client'

import React, {useState, useEffect, useRef} from "react";
import logo from "@/app/assets/Logo.svg";
import { collection, addDoc, updateDoc, doc, query, where, limit, getDocs, getDoc, increment, deleteDoc, arrayUnion } from "firebase/firestore"; 
import { auth, db, storage } from '@/firebase/firebaseClient';
import { onAuthStateChanged } from 'firebase/auth';
import Alert from '@mui/material/Alert';
import Stack from "@mui/material/Stack";
import IconButton from '@mui/material/IconButton';
import Collapse from '@mui/material/Collapse';
import CloseIcon from '@mui/icons-material/Close';
import { getDownloadURL, ref, deleteObject, listAll } from "firebase/storage";
import 'react-tabs/style/react-tabs.css';
import Image from "next/image";
import Head from "next/head";
import { useRouter } from "next/navigation";
import PaperComponent from "@/components/paper";

export default function Surveys() {
    const [date, setDate] = useState(undefined);
    const [questionNumber, setQuestionNumber] = useState(undefined);
    const [attempted, setAttempted] = useState([]);
    const [alert, setAlert] = useState(false);
    const [alertContent, setAlertContent] = useState('');
    const [alertSeverity, setAlertSeverity] = useState('error');
    const [alertCollapse, setAlertCollapse] = React.useState(false);
    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [paper, setPaper] = useState(null);
    const [solvedPaper, setSolvedPaper] = useState(null);
    const [schemeDiagram, setSchemeDiagram] = useState(undefined);
    const [page, setPage] = useState(1);
    const formRef = useRef(null)

    const router = useRouter();

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
        fetchSurveyAgreement();
      }, [user]);
    
    const fetchSurveyAgreement = async () => {
        if (user) {
            const userRef = doc(db, "users", user.uid);
            const userSnap = await getDoc(userRef);
            const userData = userSnap.data();
            setUserData(userData)

            if (userData.surveyAgreement > 0.5) {
                fetchPaper();
            }
        }
    }

    function getMonthName(monthNumber) {
        const date = new Date();
        date.setMonth(monthNumber - 1);
      
        return date.toLocaleString('en-US', { month: 'short' });
      }

    //Todo - Stop the paper refreshing on every state change of unrelated variables.

    const fetchPaper = async () => {
        let tempPaper = null
    // Randomly pick a paper from firebase
    // Check if it has had someone check it before. If no then pick this paper and check.
    // If yes, then check if more than 5 checks have been carried out, if more than 5 then:
    //     If there is >70% has the same value then pick another paper.
    //     If not, check paper
        for (let i = 0; i < 5; i++) {
            //Todo - implement function that checks the "verified" field of a paper and grabs only those that haven't been verified yet. Stops it from querying absolutely everything. Query all papers in the solvedPapers collection that have verified = false. Then from that list, pick a random one.
            if (tempPaper === null ) {
                try {
                    // Get list of all pdfs uploaded to then find its downloadUrl and then its document on Firebase
                    const allPapersList = ref(storage, 'solvedPapers');
                    // Find all the prefixes and items.
                    listAll(allPapersList).then((paperRef) => {
                        getDownloadURL(paperRef.items[(Math.floor(Math.random() * paperRef.items.length))]).then(async(url) => {
                            const paperQuery = query(collection(db, "solvedPapers"), where("downloadUrl", "==", url), limit(1));
                            const paperQuerySnapshot = await getDocs(paperQuery);
                            const paperDocument = paperQuerySnapshot.docs[0];

                            const paperInfo = paperDocument.data();
                            paperInfo.id = paperDocument.id;
                            //Don't show the paper if the owner is the current user
                            if (paperInfo.owner !== user.uid) {
                                //Check that the user has not already reviewed this paper
                                const userReviewThisPaperQuery = query(collection(db, "paperReviews"), where("paperId", "==", paperInfo.id), where("userId", "==", user.uid));
                                const userReviewThisPaperSnapshot = await getDocs(userReviewThisPaperQuery);

                                //If there's already a document then the user's already reviewed it
                                if (userReviewThisPaperSnapshot.size == 0) {
                                    if (paperInfo.reviews < 5) {
                                        tempPaper = paperInfo
                                        setPaper(paperInfo)
                                    } else {
                                        const paperReviewsQuery = query(collection(db, "paperReviews"), where("paperId", "==", paperInfo.id));
                                        const paperReviewsQuerySnapshot = await getDocs(paperReviewsQuery);
                                        const paperReviewDocuments = paperReviewsQuerySnapshot.docs;

                                        const reviewValueCountMap = {};
                                        const totalDocuments = paperReviewDocuments.length;

                                        // Iterate over the documents and collect field values
                                        paperReviewDocuments.forEach((paperReviewDocument) => {
                                            const paperReview = paperReviewDocument.data();
                                            Object.keys(paperReview).forEach((field) => {
                                                if (!reviewValueCountMap[field]) {
                                                    reviewValueCountMap[field] = {};
                                                }
                                            
                                                const value = paperReview[field];
                                                if (value) {
                                                    if (reviewValueCountMap[field][value]) {
                                                        reviewValueCountMap[field][value]++;
                                                    } else {
                                                        reviewValueCountMap[field][value] = 1;
                                                    }
                                                }
                                            });
                                        });
                                        
                                        Object.keys(reviewValueCountMap).forEach((field) => {
                                            let mostCommonResponse = null;
                                            let maxCount = 0;
                                            const countMap = reviewValueCountMap[field];
                                        
                                            Object.keys(countMap).forEach((value) => {
                                                const count = countMap[value];
                                                if (count > maxCount) {
                                                    mostCommonResponse = value;
                                                    maxCount = count;
                                                }
                                            });
                                            
                                            const frequencyRatio = maxCount / totalDocuments;

                                            if (frequencyRatio < 0.7) {
                                                tempPaper = value
                                                setPaper(value)
                                            }
                                        });
                                    }
                                }
                            }
                        })
                    })
                } catch (error) {
                    console.error("Error fetching comments data:", error);
                }
            }
        }
    };

    /**
     * Function that appends the sub section of a question paper attempted into an array of strings
     * @param {*} value - String of the sub section answered
     */
    function appendToAttempted(value) {
        if (attempted.includes(value)) {
            const newList = attempted.filter((item) => item !== value)

            setAttempted(newList);
        } else {
            const newList = attempted.concat(value)

            setAttempted(newList);
        }
    }
    //Todo - Abstract the function above into a common pool of functions.
    
    const onSubmit = async (e) => {
        e.preventDefault()

        if (solvedPaper === null) {
            //Show error
            setAlertContent('Please answer the first question.');
            setAlertSeverity('error')
            setAlert(true);
            setAlertCollapse(true);
            setTimeout(() => {
                setAlertCollapse(false);
            }, 3000);

            return null
        }

        if (solvedPaper === true) {
            const inputs = [date, questionNumber, attempted]

            // Check if any input is empty
                //Prompt user to fill in
                //If the scheme diagram page input is empty - do nothing
                //If more than one input is empty - reduce user rating by 0.1
                //If all inputs are empty - reduce user rating by 0.5
            const count = inputs.reduce((accumulator, currentValue) => {
                if (currentValue === null || currentValue === "" || currentValue === undefined || (Array.isArray(currentValue) && currentValue.length === 0)) {
                return accumulator + 1;
                }
                return accumulator;
            }, 0);

            //All fields required fields have not been filled in
            if (count > 0) {
                //Show error
                setAlertContent('Please fill in all relevant fields');
                setAlertSeverity('error')
                setAlert(true);
                setAlertCollapse(true);
                setTimeout(() => {
                    setAlertCollapse(false);
                }, 3000);

                const currentUserDocRef = doc(db, "users", user.uid);

                if (count === inputs.length) {
                    await updateDoc(currentUserDocRef, {
                        points: increment(-0.5),
                        auditTrail: arrayUnion("The answer you have provided, while carrying out a survey, is entirely incomplete. You have been docked 0.5 points."),
                        //Todo - Provide date in description
                    });
                } else if (count > 0) {
                    await updateDoc(currentUserDocRef, {
                        points: increment(-0.1),
                        auditTrail: arrayUnion("The answer you have provided, while carrying out a survey, contains incomplete information. You have been docked 0.1 points."),
                        //Todo - Provide date in description
                    });
                }

                return null
            }
        }

        //Upload information to firebase
        let reviewInformation = {
            userId: user.uid,
            paperId: paper.id,
            isSolvedPaper: solvedPaper
        }

        if (solvedPaper) {
            const month = date.substring(5, 7)
            const year = date.substring(0, 4)

            reviewInformation = {...reviewInformation,
                year: year,
                month: month,
                questionNumber: questionNumber,
                attempted: attempted,
            }
        }

        if (schemeDiagram !== undefined) {
            reviewInformation = {...reviewInformation,
                diagram: schemeDiagram,
            }
        }

        addDoc(collection(db, "paperReviews"), reviewInformation).then(async ()=> {
            const paperRef = doc(db, "solvedPapers", paper.id);

            await updateDoc(paperRef, {
                //Todo - Remove this number of reviews data field from the solvedPapers collection and move to stop duplicating data.
                reviews: increment(1)
            }).then(async ()=> {
                const paperSnap = await getDoc(paperRef);
                const paperData = paperSnap.data();

                if (paperData.reviews > 5) {
                    const paperReviewsQuery = query(collection(db, "paperReviews"), where("paperId", "==", paper.id));
                    const paperReviewsQuerySnapshot = await getDocs(paperReviewsQuery);
                    const paperReviews = paperReviewsQuerySnapshot.docs;

                    const reviewValueCountMap = {};
                    const numberOfReviews = paperReviews.length;

                    // Iterate over the documents and collect field values
                    paperReviews.forEach((paperReviewDoc) => {
                        const paperReview = paperReviewDoc.data();
                        Object.keys(paperReview).forEach((fieldName) => {
                            if (!reviewValueCountMap[fieldName]) {
                                reviewValueCountMap[fieldName] = {};
                            }
                        
                            const paperReviewFieldValue = paperReview[fieldName];
                            if (paperReviewFieldValue) {
                                if (reviewValueCountMap[fieldName][paperReviewFieldValue]) {
                                    reviewValueCountMap[fieldName][paperReviewFieldValue]++;
                                } else {
                                    reviewValueCountMap[fieldName][paperReviewFieldValue] = 1;
                                }
                            }
                        });
                    });

                    let agreementReached = true
                    if (reviewValueCountMap == {}) {
                        agreementReached = false
                    }
                    
                    Object.keys(reviewValueCountMap).forEach(async(fieldName) => {
                        let mostCommonResponse = null;
                        let maxCount = 0;
                        const countMap = reviewValueCountMap[fieldName];

                        if (countMap == {}) {
                            agreementReached = false
                        }
                    
                        Object.keys(countMap).forEach((response) => {
                            const count = countMap[response];
                            if (count > maxCount) {
                                mostCommonResponse = response;
                                maxCount = count;
                            }
                        });
                        
                        const frequencyRatio = maxCount / numberOfReviews;

                        if (frequencyRatio < 0.7) {
                            //Agreement not yet reached on the field value
                            agreementReached = false
                        }
                        
                        if (fieldName === "isSolvedPaper") {
                            if (frequencyRatio > 0.7 && mostCommonResponse === false) {
                                //Decrease the paper's owner's rating by 2. Remove the file. Remove the solvedPaper document.
                                const ownerRef = doc(db, "users", paperData.owner);
                                await updateDoc(ownerRef, {
                                    //Todo - Make the numbers for scores a variable that's fetched to have consistency on scores across the platform
                                    points: increment(-4),
                                    auditTrail: arrayUnion("The paper you had uploaded with an answer for Question " + paperData.questionNumber + " of " + getMonthName(paperData.month) + " " + paperData.year + " was found to be illegitimate and removed. You have been docked 4 points."),
                                    authenticityScore: increment(-0.4)
                                    //Todo - Is there a better way to score authenticity. Also create method to increase authenticity score as well.
                                });

                                // Create a reference to the file to delete
                                const desertRef = ref(storage, paperData.filePath);

                                // Delete the file
                                deleteObject(desertRef).then(async() => {
                                    // File deleted successfully
                                    await deleteDoc(paperRef)
                                }).catch((error) => {
                                    // Uh-oh, an error occurred!
                                });
                            }
                        } else if (fieldName === "attempted") {
                            if (frequencyRatio > 0.7 && mostCommonResponse.length === 1 && mostCommonResponse[0] == "None") {
                                //If none is most common then remove the paper. If not do the below update.
                                //Todo - This code is the same as above. Abstract this into a common function.
                                const ownerRef = doc(db, "users", paperData.owner);
                                await updateDoc(ownerRef, {
                                    points: increment(-4),
                                    auditTrail: arrayUnion("The paper you had uploaded with an answer for Question " + paperData.questionNumber + " of " + getMonthName(paperData.month) + " " + paperData.year + " was found to be illegitimate and removed. You have been docked 4 points."),
                                    authenticityScore: increment(-0.4)
                                });

                                // Create a reference to the file to delete
                                const desertRef = ref(storage, paperData.filePath);

                                // Delete the file
                                deleteObject(desertRef).then(async() => {
                                    // File deleted successfully
                                    await deleteDoc(paperRef)
                                }).catch((error) => {
                                    // Uh-oh, an error occurred!
                                });
                            }
                        } else if (frequencyRatio > 0.7 && paperData[fieldName] !== mostCommonResponse) {
                            await updateDoc(paperRef, {[fieldName]: mostCommonResponse})
                        }
                    });

                    //Check if the agreementReached value is still true then an agreement has been reached for all fields
                    if (agreementReached == true) {
                        await updateDoc(paperRef, {
                            verified: true,
                        });
                    }

                }
            })

            //Adding to the user's points for completing a survey
            const currentUserDocRef = doc(db, "users", user.uid);
            await updateDoc(currentUserDocRef, {
                //Todo - Make the numbers for scores a variable that's fetched to have consistency on scores across the platform
                points: increment(1),
                auditTrail: arrayUnion("You completed a survey. You've received an additional point."),
            });

            //Creating a score based on how frequently the user agrees with everyone else:
            //Fetch all surveys the user has done
            const currentUserReviewsQuery = query(collection(db, "paperReviews"), where("userId", "==", user.uid));
            const currentUserReviewsQuerySnapshot = await getDocs(currentUserReviewsQuery);
            const currentUserReviewsDocuments = currentUserReviewsQuerySnapshot.docs;
        
            // Fetch all reviews for the papers the user has reviewed
            const paperIds = currentUserReviewsDocuments.map(doc => doc.data().paperId);
            const paperReviewsQuery = query(collection(db, "paperReviews"), where("paperId", "in", paperIds));
            const paperReviewsQuerySnapshot = await getDocs(paperReviewsQuery);
            const paperReviewDocuments = paperReviewsQuerySnapshot.docs;
        
            let documentCountMaps = {};
        
            // Create a map of paperId to reviews
            let paperReviewsMap = {};
            paperReviewDocuments.forEach(doc => {
                const data = doc.data();
                if (!paperReviewsMap[data.paperId]) {
                    paperReviewsMap[data.paperId] = [];
                }
                paperReviewsMap[data.paperId].push(data);
            });
        
            // Process the reviews
            currentUserReviewsDocuments.forEach(currentUserReviewDocument => {
                const userReview = currentUserReviewDocument.data();
                const paperId = userReview.paperId;
                const otherReviews = paperReviewsMap[paperId];
                const numberOfSurveys = otherReviews.length;
        
                if (numberOfSurveys > 5) {
                    if (!documentCountMaps[paperId]) {
                        documentCountMaps[paperId] = {};
                    }
        
                    Object.keys(userReview).forEach(fieldName => {
                        if (fieldName !== "userId" && fieldName !== "paperId") {
                            otherReviews.forEach((otherReview, index) => {
                                if (otherReview[fieldName] !== userReview[fieldName]) {
                                    const documentCountMapCellValue = documentCountMaps[paperId][fieldName] ?? 0;
                                    documentCountMaps[paperId][fieldName] = documentCountMapCellValue + 1 / numberOfSurveys;
                                }
                            });
                        }
                    });
                }
            });
        
            // If there are enough reviews to make a decision using
            if (Object.keys(documentCountMaps).length > 0) {
                // Finding the average of all values in the map
                // Step 1: Flatten the map of maps into a single array of values
                const allValues = Object.values(documentCountMaps).flatMap(innerMap => Object.values(innerMap));
                
                if (allValues.length > 0) {
                    // Step 2: Calculate the sum of all values in the array
                    const sum = allValues.reduce((acc, val) => acc + val, 0);
            
                    // Step 3: Divide the sum by the total number of values to get the average
                    const average = sum / allValues.length;
            
                    const score = 1 - average;
            
                    await updateDoc(currentUserDocRef, {
                        surveyAgreement: score
                    });
                }
            }
                    


        }).then(() => {
            setAlertContent('Survey submitted');
            setAlertSeverity('success')
            setAlert(true);
            setAlertCollapse(true);
            setTimeout(() => {
                setAlertCollapse(false);
            }, 3000);
            //Reset the form fields
            router.push("/surveys")
        })
      }
    
    if (!user) {
        return (
            <div className="row full-height">
                <Head>
                    <title>Surveys - Structural Papers - Solved IStructE exam papers</title>
                    <meta name="description" content="Access more IStructE exam solutions by answering questions about other solutions."/>
                </Head>
                <div className="col-1 background-color-primary center mob-hide">
                    <Image src={logo} alt="Paper trail logo" height="100"/>
                </div>
                <div className="col-1 column pd-a-10p justify-content-center">
                    <span className="font-size-15">Please log in or sign up to answer these questions and view more solved papers.</span>
                    <div className="row mg-t-50 justify-content-center">
                        <a className="btn btn-primary-outline" href="/auth/signup">Sign Up</a>
                        <a className="btn btn-primary-outline mg-l-50" href="/auth/login">Login</a>
                    </div>
                </div>
            </div>
        );
    }

    if (user && paper) {
        return (
            <div className="flex flex-col h-[calc(100vh-65px)]" >
                <Head>
                    <title>Surveys - Solved IStructE exam papers</title>
                    <meta name="Surveys" content="Answer questions about solutions"/>
                </Head>
                <div className="sticky top-0 flex flex-col lg:hidden background-color-primary text-white">
                    <div className="mx-5 bg-white h-[1px]">&nbsp;</div>
                    <div className="flex flex-row">
                        <button className="py-2 w-1/2" onClick={() => setPage(1)}>View paper</button>
                        <div className="mb-2 bg-white w-[1px]">&nbsp;</div>
                        <button className="py-2 w-1/2" onClick={() => setPage(2)}>View survey</button>
                    </div>
                </div>
                <div className="flex flex-row overflow-x-scroll">
                    <div className={"background-color-primary flex flex-col overflow-y-auto pdf-container w-screen lg:w-1/2"}>
                        <PaperComponent paper={paper} user={userData} />
                    </div>
                    <div className={"flex flex-col w-screen lg:w-1/2 overflow-y-auto"} ref={formRef}>
                        <div className="align-items-center column pd-a-5p">
                            <h2>Answer questions:</h2>
                            <span className="font-size-15 text-align-left">Answer questions about the solved paper to the left.</span>
                            <span className="font-size-15 text-align-left lg:hidden">Click the <q>View paper</q> tab above to view the paper.</span>
                            <br />
                            <span className="font-size-15 text-align-left">Each survey completed gives you a point. Points can be used to access papers.</span>
                            <hr className="solid h-1px w-full mx-10"/>
                            <div className="column w-full">
                                <label htmlFor="attempted" className="mg-b-5">Is this a solved IStructE paper?</label>
                                <div className="row mg-b-20">
                                    <button type="button" onClick={() => setSolvedPaper(true)} className={"btn mg-r-10 " + (solvedPaper === true ? "btn-primary" : "btn-primary-outline")}>Yes</button>
                                    <button type="button" onClick={() => setSolvedPaper(false)} className={"btn " + (solvedPaper === false ? "btn-primary" : "btn-primary-outline")}>No</button>
                                </div>
                                <span className={solvedPaper === false ? "flex" : "hidden"}>Please ensure your answers are complete and accurate. Each submission is verified by the community. Consistently providing incorrect information may affect your future access to this feature. Thank you for your cooperation.</span>
                                <label htmlFor="month" className={solvedPaper ? "flex" : "hidden"}>Month and Year</label>
                                <input type="month" className={"form-control mg-b-20 " + (solvedPaper ? "flex" : "hidden")} id="month" value={date} onChange={(e) => setDate(e.target.value)}   required/>
                                <label htmlFor="question-number" className={solvedPaper ? "flex" : "hidden"}>Question number</label>
                                <input type="number" className={"form-control mg-b-20 " + (solvedPaper ? "flex" : "hidden")} id="question-number" placeholder="1" value={questionNumber} onChange={(e) => setQuestionNumber(e.target.value)} min="1" max="8" required/>
                                <label htmlFor="attempted" className={"mg-b-5 " + (solvedPaper ? "flex" : "hidden")}>Parts attempted</label>
                                <div className={"row mg-b-20 button-container " + (solvedPaper ? "flex" : "hidden")}>
                                    <button type="button" onClick={() => appendToAttempted("1a")} className={"btn mg-r-10 " + (attempted.includes("1a") ? "btn-primary" : "btn-primary-outline")}>1a</button>
                                    <button type="button" onClick={() => appendToAttempted("1b")} className={"btn mg-r-10 " + (attempted.includes("1b") ? "btn-primary" : "btn-primary-outline")}>1b</button>
                                    <button type="button" onClick={() => appendToAttempted("2a")} className={"btn mg-r-10 " + (attempted.includes("2a") ? "btn-primary" : "btn-primary-outline")}>2a</button>
                                    <button type="button" onClick={() => appendToAttempted("2b")} className={"btn mg-r-10 " + (attempted.includes("2b") ? "btn-primary" : "btn-primary-outline")}>2b</button>
                                    <button type="button" onClick={() => appendToAttempted("2c")} className={"btn mg-r-10 " + (attempted.includes("2c") ? "btn-primary" : "btn-primary-outline")}>2c</button>
                                    <button type="button" onClick={() => appendToAttempted("None")} className={"btn " + (attempted.includes("None") ? "btn-primary" : "btn-primary-outline")}>None</button>
                                </div>
                                <label htmlFor="scheme-diagram" className={solvedPaper ? "flex" : "hidden"}>What page is a scheme diagram on?</label>
                                <input type="number" className={"form-control mg-b-20 " + (solvedPaper ? "flex" : "hidden")} id="scheme-diagram" placeholder="1" value={schemeDiagram} onChange={(e) => setSchemeDiagram(e.target.value)} min="1" required/>
                                <div className="row justify-content-center align-items-center mg-t-25 mg-b-20">
                                    <button type="submit" onClick={onSubmit} className="btn btn-primary">Submit</button>
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
                </div>
            </div>
        );
    }

    if (!paper) {
        return (
            <div className="row full-height">
                <Head>
                    <title>Surveys - Solved IStructE exam papers</title>
                    <meta name="Surveys" content="Answer questions about solutions"/>
                </Head>
                <div className="col-1 background-color-primary center mob-hide">
                    <Image src={logo} alt="Paper trail logo" height="100"/>
                </div>
                <div className="col-1 column pd-a-10p justify-content-center">
                    <span className="font-size-15 text-align-left">No surveys remaining. Please check back later.</span>
                </div>
            </div>
          );
    }

    return null;
}