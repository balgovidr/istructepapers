'use client'

import React, {useState, useEffect, useRef} from "react";
import logo from "@/app/assets/Logo.svg";
import { collection, addDoc, updateDoc, doc, query, where, limit, getDocs, getDoc, increment, deleteDoc } from "firebase/firestore"; 
import { auth, db, storage } from '@/firebase/firebaseClient';
import { onAuthStateChanged } from 'firebase/auth';
import Alert from '@mui/material/Alert';
import Stack from "@mui/material/Stack";
import IconButton from '@mui/material/IconButton';
import Collapse from '@mui/material/Collapse';
import CloseIcon from '@mui/icons-material/Close';
import { getDownloadURL, ref, deleteObject, listAll } from "firebase/storage";
import { Document, Page, pdfjs } from "react-pdf";
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
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
    const [paperFetched, setPaperFetched] = useState(null);
    const [displayedPages, setDisplayedPages] = useState(0);
    const [solvedPaper, setSolvedPaper] = useState(null);
    const [schemeDiagram, setSchemeDiagram] = useState(undefined);
    const [page, setPage] = useState(1);
    const [formHeight, setFormHeight] = useState(0)
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

    const fetchPaper = async () => {
        let tempPaper = null
    // Randomly pick a paper from firebase
    // Check if the has had someone check it before. If no then pick paper and check.
    // If yes, then check if more than 5 checks have been carried out, if more than 5 then:
    //     If there is >70% has the same value then pick another paper.
    //     If not, check paper
        for (let i = 0; i < 5; i++) {
            if (tempPaper === null ) {
                try {
                    // Get list of all pdfs uploaded to then find its downloadUrl and then its document on Firebase
                    const listRef = ref(storage, 'solvedPapers');
                    // Find all the prefixes and items.
                    listAll(listRef).then((res) => {
                        getDownloadURL(res.items[(Math.floor(Math.random() * res.items.length))]).then(async(url) => {
                            const q = query(collection(db, "solvedPapers"), where("downloadUrl", "==", url), limit(1));
                            const querySnapshot = await getDocs(q);
                            const document = querySnapshot.docs[0];

                            const value = document.data();
                            value.id = document.id;
                            if (value.reviews < 5) {
                                tempPaper = value
                                setPaper(value)
                            } else {
                                const q2 = query(collection(db, "paperReviews"), where("paperId", "==", value.id));
                                const querySnapshot2 = await getDocs(q2);
                                const documents2 = querySnapshot2.docs;

                                const fieldCountMaps = {};
                                const totalDocuments = documents2.length;

                                // Iterate over the documents and collect field values
                                documents2.forEach((doc) => {
                                const data = doc.data();
                                Object.keys(data).forEach((field) => {
                                    if (!fieldCountMaps[field]) {
                                    fieldCountMaps[field] = {};
                                    }
                                
                                    const value = data[field];
                                    if (value) {
                                    if (fieldCountMaps[field][value]) {
                                        fieldCountMaps[field][value]++;
                                    } else {
                                        fieldCountMaps[field][value] = 1;
                                    }
                                    }
                                });
                                });
                                
                                Object.keys(fieldCountMaps).forEach((field) => {
                                let mostCommonValue = null;
                                let maxCount = 0;
                                const countMap = fieldCountMaps[field];
                                
                                    Object.keys(countMap).forEach((value) => {
                                        const count = countMap[value];
                                        if (count > maxCount) {
                                            mostCommonValue = value;
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
                        })
                    })
                } catch (error) {
                    console.error("Error fetching comments data:", error);
                }
            }
        }
    };

    function appendToAttempted(value) {
        if (attempted.includes(value)) {
            const newList = attempted.filter((item) => item !== value)

            setAttempted(newList);
        } else {
            const newList = attempted.concat(value)

            setAttempted(newList);
        }
    }

    const onDocumentLoadSuccess = async ({ numPages }) => {
        setDisplayedPages(numPages);
      };

    const onSubmit = async (e) => {
        e.preventDefault()

        const inputs = [solvedPaper, date, questionNumber, attempted, schemeDiagram]

        // Check if any input is empty
            //Prompt user to fill in
            //If one input is empty - do nothing
            //If more than one input is empty - reduce user rating by 0.1
            //If all inputs are empty - reduce user rating by 0.5
        const count = inputs.reduce((accumulator, currentValue) => {
            if (currentValue === null || (Array.isArray(currentValue) && currentValue.length === 0)) {
              return accumulator + 1;
            }
            return accumulator;
          }, 0);

        if (count > 0) {
            //Show error
            setAlertContent('Please fill in all fields');
            setAlertSeverity('error')
            setAlert(true);
            setAlertCollapse(true);
            setTimeout(() => {
                setAlertCollapse(false);
            }, 3000);

            const userRatingRef = doc(db, "users", user.uid);

            if (count === inputs.length) {
                await updateDoc(userRatingRef, {
                    points: increment(-0.5)
                });
            } else if (count > 1) {
                await updateDoc(userRatingRef, {
                    points: increment(-0.1)
                });
            }
        } else {
            //Upload information to firebase
                //If more than 5 users have checked the paper
                    //For each field
                        //If the field has more than 70% agreement on different value then change the value
            
            const month = date.substring(5, 7)
            const year = date.substring(0, 4)

            addDoc(collection(db, "paperReviews"), {
                userId: user.uid,
                paperId: paper.id,
                isSolvedPaper: solvedPaper,
                year: year,
                month: month,
                questionNumber: questionNumber,
                attempted: attempted,
                diagram: schemeDiagram,
            }).then(async ()=> {
                const paperRef = doc(db, "solvedPapers", paper.id);

                await updateDoc(paperRef, {
                    reviews: increment(1)
                }).then(async ()=> {
                    const paperSnap = await getDoc(paperRef);
                    const paperData = paperSnap.data();

                    if (paperData.reviews > 5) {
                        const q3 = query(collection(db, "paperReviews"), where("paperId", "==", paper.id));
                        const querySnapshot3 = await getDocs(q3);
                        const documents3 = querySnapshot3.docs;

                        const fieldCountMaps = {};
                        const totalDocuments = documents3.length;

                        // Iterate over the documents and collect field values
                        documents3.forEach((doc3) => {
                            const data3 = doc3.data();
                            Object.keys(data3).forEach((field) => {
                                if (!fieldCountMaps[field]) {
                                    fieldCountMaps[field] = {};
                                }
                            
                                const value = data3[field];
                                if (value) {
                                    if (fieldCountMaps[field][value]) {
                                        fieldCountMaps[field][value]++;
                                    } else {
                                        fieldCountMaps[field][value] = 1;
                                    }
                                }
                            });
                        });
                        
                        Object.keys(fieldCountMaps).forEach(async(field) => {
                            let mostCommonValue = null;
                            let maxCount = 0;
                            const countMap = fieldCountMaps[field];
                        
                            Object.keys(countMap).forEach((value) => {
                                const count = countMap[value];
                                if (count > maxCount) {
                                    mostCommonValue = value;
                                    maxCount = count;
                                }
                            });
                            
                            const frequencyRatio = maxCount / totalDocuments;
                            
                            if (field === "isSolvedPaper") {
                                if (frequencyRatio > 0.7 && mostCommonValue === false) {
                                    //Decrease the paper's owner's rating by 2. Remove the file. Remove the solvedPaper document.
                                    const ownerRef = doc(db, "users", paperData.owner);
                                    await updateDoc(ownerRef, {
                                        points: increment(-2)
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

                                } else if (frequencyRatio > 0.7 && mostCommonValue === true) {
                                    //Confirm that the paper uploaded is a solved paper.
                                    await updateDoc(paperRef, {
                                        verified: true,
                                    });
                                }
                            } else if (field === "attempted") {
                                if (frequencyRatio > 0.7 && mostCommonValue.length === 1 && mostCommonValue[0] == "None") {
                                    //If none is most common then remove the paper. If not do the below update
                                    const ownerRef = doc(db, "users", paperData.owner);
                                    await updateDoc(ownerRef, {
                                        points: increment(-2)
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
                            } else if (frequencyRatio > 0.7 && mostCommonValue !== null && paperData[field] !== mostCommonValue) {
                                await updateDoc(paperRef, {[field]: mostCommonValue})
                            }
                        });
                    }
                })

                //Adding to the user's points for completing a survey
                const userRatingRef = doc(db, "users", user.uid);
                await updateDoc(userRatingRef, {
                    points: increment(0.34)
                });

                //Creating a score based on how frequently the user agrees with everyone else:
                //Fetch all surveys the user has done
                const q4 = query(collection(db, "paperReviews"), where("userId", "==", user.uid));
                const querySnapshot4 = await getDocs(q4);
                const documents4 = querySnapshot4.docs;

                const documentCountMaps = {};

                // Iterate over the documents and collect field values
                documents4.forEach(async(doc4) => {
                    const data4 = doc4.data();
                    if (!documentCountMaps[data4.paperId]) {
                        documentCountMaps[data4.paperId] = {};
                    }

                    //Fetch all other surveys of the same paper
                    const q5 = query(collection(db, "paperReviews"), where("paperId", "==", data4.paperId));
                    const querySnapshot5 = await getDocs(q5);
                    const documents5 = querySnapshot5.docs;
                    const numberOfSurveys = documents5.length;

                    if (numberOfSurveys > 5) {

                        //For each field or for each question
                        Object.keys(data4).forEach((field) => {
                            if (field !== "userId" && field !== "paperId") {
                                //For each survey that other users have done
                                documents5.forEach((doc5) => {
                                    const data5 = doc5.data();
                                    if (data5[field] !== data4[field]) {
                                        if (documentCountMaps[data4.paperId][field]) {
                                            documentCountMaps[data4.paperId][field] = documentCountMaps[data4.paperId][field] + 1/numberOfSurveys;
                                        } else {
                                            documentCountMaps[data4.paperId][field] = 1/numberOfSurveys;
                                        }
                                    }
                                })
                            }
                        })
                    }
                });

                //Finding the average of all values in the map
                // Step 1: Flatten the map of maps into a single array of values
                const allValues = Array.from(documentCountMaps.values()).flatMap((innerMap) => [...innerMap.values()]);

                // Step 2: Calculate the sum of all values in the array
                const sum = allValues.reduce((acc, val) => acc + val, 0);

                // Step 3: Divide the sum by the total number of values to get the average
                const average = sum / allValues.length;

                const score = 1-average;

                await updateDoc(userRatingRef, {
                    surveyAgreement: score
                });

            }).then(() => {
                setAlertContent('Survey submitted');
                setAlertSeverity('success')
                setAlert(true);
                setAlertCollapse(true);
                setTimeout(() => {
                    setAlertCollapse(false);
                }, 3000);
                router.push("/surveys")
            })
        }
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
                            <span className="font-size-15 text-align-left">Each survey completed below allows access to a new solved paper.</span>
                            <hr className="solid"/>
                            <form className="column">
                                <label htmlFor="attempted" className="mg-b-5">Is this a solved IStructE paper?</label>
                                <div className="row mg-b-20">
                                    <button type="button" onClick={(e) => setSolvedPaper(true)} className={"btn mg-r-10 " + (solvedPaper === true ? "btn-primary" : "btn-primary-outline")}>Yes</button>
                                    <button type="button" onClick={(e) => setSolvedPaper(false)} className={"btn " + (solvedPaper === false ? "btn-primary" : "btn-primary-outline")}>No</button>
                                </div>
                                <label htmlFor="month">Month and Year</label>
                                <input type="month" className="form-control mg-b-20" id="month" value={date} onChange={(e) => setDate(e.target.value)}   required/>
                                <label htmlFor="question-number">Question number</label>
                                <input type="number" className="form-control mg-b-20" id="question-number" placeholder="1" value={questionNumber} onChange={(e) => setQuestionNumber(e.target.value)} min="1" max="8" required/>
                                <label htmlFor="attempted" className="mg-b-5">Parts attempted</label>
                                <div className="row mg-b-20 button-container">
                                    <button type="button" onClick={(e) => appendToAttempted("1a")} className={"btn mg-r-10 " + (attempted.includes("1a") ? "btn-primary" : "btn-primary-outline")}>1a</button>
                                    <button type="button" onClick={(e) => appendToAttempted("1b")} className={"btn mg-r-10 " + (attempted.includes("1b") ? "btn-primary" : "btn-primary-outline")}>1b</button>
                                    <button type="button" onClick={(e) => appendToAttempted("2a")} className={"btn mg-r-10 " + (attempted.includes("2a") ? "btn-primary" : "btn-primary-outline")}>2a</button>
                                    <button type="button" onClick={(e) => appendToAttempted("2b")} className={"btn mg-r-10 " + (attempted.includes("2b") ? "btn-primary" : "btn-primary-outline")}>2b</button>
                                    <button type="button" onClick={(e) => appendToAttempted("2b")} className={"btn mg-r-10 " + (attempted.includes("2c") ? "btn-primary" : "btn-primary-outline")}>2c</button>
                                    <button type="button" onClick={(e) => appendToAttempted("None")} className={"btn " + (attempted.includes("None") ? "btn-primary" : "btn-primary-outline")}>None</button>
                                </div>
                                <label htmlFor="scheme-diagram">What page is a scheme diagram on?</label>
                                <input type="number" className="form-control mg-b-20" id="scheme-diagram" placeholder="1" value={schemeDiagram} onChange={(e) => setSchemeDiagram(e.target.value)} min="1" required/>
                                <div className="row justify-content-center align-items-center mg-t-25 mg-b-20">
                                    <button type="submit" onClick={onSubmit} className="btn btn-primary">Submit</button>
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
                </div>
            </div>
        );
    }

    // if (paper && user && windowSize[0] < 601) {
    //     return (
    //         <Tabs>
    //             <Head>
    //                 <title>Surveys - Solved IStructE exam papers</title>
    //                 <meta name="Surveys" content="Answer questions about solutions"/>
    //             </Head>
    //             <TabList>
    //                 <Tab>Survey</Tab>
    //                 <Tab>Paper</Tab>
    //             </TabList>
    //             <TabPanel>
    //                 <div className="column overflow-y-auto" style={{height: (windowSize[1] - 40)}}>
    //                     <div className="align-items-center column pd-a-5p">
    //                         <h2>Answer questions:</h2>
    //                         <span className="font-size-15 text-align-left">Answer questions about the solved paper in the tab above.</span>
    //                         <br />
    //                         <span className="font-size-15 text-align-left">Each survey completed below allows access to a new solved paper.</span>
    //                         <br />
    //                         <span className="font-size-15 text-align-left">Use the tabs along the top of the screen to move between pages.</span>
    //                         <hr className="solid"/>
    //                         <form className="column">
    //                             <label htmlFor="attempted" className="mg-b-5">Is this a solved IStructE paper?</label>
    //                             <div className="row mg-b-20">
    //                                 <button type="button" onClick={(e) => setSolvedPaper(true)} className={"btn mg-r-10 " + (solvedPaper === true ? "btn-primary" : "btn-primary-outline")}>Yes</button>
    //                                 <button type="button" onClick={(e) => setSolvedPaper(false)} className={"btn " + (solvedPaper === false ? "btn-primary" : "btn-primary-outline")}>No</button>
    //                             </div>
    //                             <label htmlFor="month">Month and Year</label>
    //                             <input type="month" className="form-control mg-b-20" id="month" value={date} onChange={(e) => setDate(e.target.value)}   required/>
    //                             <label htmlFor="question-number">Question number</label>
    //                             <input type="number" className="form-control mg-b-20" id="question-number" placeholder="1" value={questionNumber} onChange={(e) => setQuestionNumber(e.target.value)} min="1" max="8" required/>
    //                             <label htmlFor="attempted" className="mg-b-5">Parts attempted</label>
    //                             <div className="row mg-b-20 button-container">
    //                                 <button type="button" onClick={(e) => appendToAttempted("1a")} className={"btn mg-r-10 " + (attempted.includes("1a") ? "btn-primary" : "btn-primary-outline")}>1a</button>
    //                                 <button type="button" onClick={(e) => appendToAttempted("1b")} className={"btn mg-r-10 " + (attempted.includes("1b") ? "btn-primary" : "btn-primary-outline")}>1b</button>
    //                                 <button type="button" onClick={(e) => appendToAttempted("2a")} className={"btn mg-r-10 " + (attempted.includes("2a") ? "btn-primary" : "btn-primary-outline")}>2a</button>
    //                                 <button type="button" onClick={(e) => appendToAttempted("2b")} className={"btn mg-r-10 " + (attempted.includes("2b") ? "btn-primary" : "btn-primary-outline")}>2b</button>
    //                                 <button type="button" onClick={(e) => appendToAttempted("2b")} className={"btn mg-r-10 " + (attempted.includes("2c") ? "btn-primary" : "btn-primary-outline")}>2c</button>
    //                                 <button type="button" onClick={(e) => appendToAttempted("None")} className={"btn " + (attempted.includes("None") ? "btn-primary" : "btn-primary-outline")}>None</button>
    //                             </div>
    //                             <label htmlFor="scheme-diagram">What page is a scheme diagram on?</label>
    //                             <input type="number" className="form-control mg-b-20" id="scheme-diagram" placeholder="1" value={schemeDiagram} onChange={(e) => setSchemeDiagram(e.target.value)} min="1" required/>
    //                             <div className="row justify-content-center align-items-center mg-t-25 mg-b-20">
    //                                 <button type="submit" onClick={onSubmit} className="btn btn-primary">Submit</button>
    //                             </div>
    //                         </form>
    //                         <Stack sx={{ width: "100%" }} spacing={2}>
    //                             <Collapse in={alertCollapse}>
    //                                 {alert ? <Alert severity={alertSeverity} action={
    //                                     <IconButton aria-label="close" color="inherit" size="small" onClick={() => {setAlertCollapse(false);}}>
    //                                         <CloseIcon fontSize="inherit" />
    //                                     </IconButton>
    //                                 }>{alertContent}</Alert> : <></> }
    //                             </Collapse>
    //                         </Stack>
    //                     </div>
    //                 </div>
    //             </TabPanel>
    //             <TabPanel>
    //                 <div className="background-color-primary pdf-container overflor-y-auto" style={{height: (windowSize[1] - 40)}}>
    //                     <Document file={paper.downloadUrl} options={{ workerSrc: "/pdf.worker.js" }} onLoadSuccess={onDocumentLoadSuccess} onLoadError={console.error}>
    //                         {displayedPages === 0 ?
    //                             <p>Loading...</p> :
    //                             Array.from({ length: displayedPages }, (_, index) => (
    //                                 <div className="pd-b-10" key={index}>
    //                                     <Page key={index} pageNumber={index + 1} renderTextLayer={false} renderAnnotationLayer={false}  width={windowSize[0] > 610 ? windowSize[0]*0.5 : windowSize[0]}/>
    //                                     <span className="font-size-12">Page {index+1}</span>
    //                                     <br />
    //                                 </div>
    //                         ))}
    //                     </Document>
    //                 </div>
    //             </TabPanel>
    //         </Tabs>
    //     );
    // }

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
}