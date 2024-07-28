'use client'

import React, {useState} from "react";
import logo from "@/app/assets/Logo.svg";
import { collection, addDoc, Timestamp } from "firebase/firestore"; 
import { db } from '@/firebase/config';
import Alert from '@mui/material/Alert';
import Stack from "@mui/material/Stack";
import IconButton from '@mui/material/IconButton';
import Collapse from '@mui/material/Collapse';
import CloseIcon from '@mui/icons-material/Close';
import Image from "next/image";
import Head from "next/head";
import { TailSpin } from 'react-loading-icons';
import { useRouter } from 'next/navigation'

export default function Feedback() {
    const [positiveAspects, setPositiveAspects] = useState('');
    const [negativeAspects, setNegativeAspects] = useState('');
    const [featureSuggestions, setFeatureSuggestions] = useState('');
    const [easeOfUse, setEaseOfUse] = useState('');
    const [performanceIssues, setPerformanceIssues] = useState('');
    const [goalsAchieved, setGoalsAchieved] = useState('');
    const [goalsExplanation, setGoalsExplanation] = useState('');
    const [additionalComments, setAdditionalComments] = useState('');
    const [alert, setAlert] = useState(false);
    const [alertContent, setAlertContent] = useState('');
    const [alertSeverity, setAlertSeverity] = useState('error');
    const [alertCollapse, setAlertCollapse] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const onSubmit = async (e) => {
        e.preventDefault()

        setLoading(true)
        var error = false

        //Check that all required fields have been input
        if (positiveAspects !== '' || negativeAspects !== '' || featureSuggestions !== '' || easeOfUse !== '' || performanceIssues !== '' || goalsAchieved !== '' || goalsExplanation !== '' || additionalComments !== '') {
            const timestamp = Timestamp.fromMillis(Date.now())

            addDoc(collection(db, "feedback"), {
                timestamp,
                positiveAspects,
                negativeAspects,
                featureSuggestions,
                easeOfUse,
                performanceIssues,
                goalsAchieved,
                goalsExplanation,
                additionalComments
            })

            setAlertContent('Submitted!');
            setAlertSeverity('success')
            setAlert(true);
            setAlertCollapse(true);
            setTimeout(() => {
                setAlertCollapse(false);
            }, 3000);

            //Reset the form fields
            router.push('/')
        } else {
            setAlertContent('Please fill in at least one of the fields above to submit.');
            setAlertSeverity('error')
            setAlert(true);
            setAlertCollapse(true);
            setTimeout(() => {
                setAlertCollapse(false);
            }, 4000);
        }

        setLoading(false);
    }

    return (
        <div className="row full-height-navbar-discount">
            <Head>
                <title>Feedback form - Structural Papers</title>
                <meta name="description" content="Send your thoughts on our site, tell us how we can help you with your IStructE exam preparation better. Let us know what resources you really want, or don't want."/>
                <link rel="canonical" href={process.env.NEXT_PUBLIC_HOST + '/feedback'} />
                <meta property="og:title" content="Feedback form - Structural Papers" />
                <meta property="og:description" content="Send your thoughts on our site, tell us how we can help you with your IStructE exam preparation better. Let us know what resources you really want, or don't want." />
                <meta property="og:type" content="website" />
                <meta property="og:url" content={process.env.NEXT_PUBLIC_HOST + '/feedback'} />
                <meta property="og:image" content={process.env.NEXT_PUBLIC_HOST + '/opengraph-image.webp'} />
            </Head>
            <div className="col-1 background-color-primary center hidden md:flex">
                <Image src={logo} alt="Structural Papers logo" height="100"/>
            </div>
            <div className="col-1 column pd-a-10p sm:overflow-y-auto">
                <h1 className="text-3xl self-center font-extralight">Feedback</h1>
                <br />
                <span className="font-size-15 text-align-left">What do you like about us? What don&apos;t you like? What do you want to see from us?</span>
                <br />
                <span className="font-size-15 text-align-left">Answer as much or as little of the questions below as you want. None are mandatory.</span>
                <hr className="solid"/>
                <form className="column">
                    {/* Question 2: Positive Aspects */}
                    <label htmlFor="positive-aspects">What do you like the most about our website?</label>
                    <textarea className="form-control mg-b-20 border-primary border-b" id="positive-aspects" placeholder="Your answer" value={positiveAspects} onChange={(e) => setPositiveAspects(e.target.value)}></textarea>

                    {/* Question 3: Negative Aspects */}
                    <label htmlFor="negative-aspects">What do you dislike or find frustrating about our website?</label>
                    <textarea className="form-control mg-b-20 border-primary border-b" id="negative-aspects" placeholder="Your answer" value={negativeAspects} onChange={(e) => setNegativeAspects(e.target.value)}></textarea>

                    {/* Question 4: Feature Suggestions */}
                    <label htmlFor="feature-suggestions">What additional features or functionalities would you like to see on our website?</label>
                    <textarea className="form-control mg-b-20 border-primary border-b" id="feature-suggestions" placeholder="Your answer" value={featureSuggestions} onChange={(e) => setFeatureSuggestions(e.target.value)}></textarea>

                    {/* Question 5: Ease of Use */}
                    <label htmlFor="ease-of-use">How easy is it to navigate and find information on our website?</label>
                    <select className="form-control mg-b-20 border-primary border-b mt-1" id="ease-of-use" value={easeOfUse} onChange={(e) => setEaseOfUse(e.target.value)}>
                        <option value="" disabled>Select ease of use</option>
                        <option value="Very Easy">Very Easy</option>
                        <option value="Easy">Easy</option>
                        <option value="Neutral">Neutral</option>
                        <option value="Difficult">Difficult</option>
                        <option value="Very Difficult">Very Difficult</option>
                    </select>

                    {/* Question 7: Performance */}
                    <label htmlFor="performance-issues">Have you experienced any issues with the website&apos;s performance? If yes, please describe.</label>
                    <textarea className="form-control mg-b-20 border-primary border-b" id="performance-issues" placeholder="Your answer" value={performanceIssues} onChange={(e) => setPerformanceIssues(e.target.value)}></textarea>

                    {/* Question 9: Purpose and Goals */}
                    <label htmlFor="goals-achieved">Did StructuralPapers help you with the exam or find what you were looking for?</label>
                    <select className="form-control mg-b-20 border-primary border-b mt-1" id="goals-achieved" value={goalsAchieved} onChange={(e) => setGoalsAchieved(e.target.value)}>
                        <option value="" disabled>Select response</option>
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                    </select>

                    <label htmlFor="goals-explanation">If no, what were you trying to accomplish?</label>
                    <textarea className="form-control mg-b-20 border-primary border-b" id="goals-explanation" placeholder="Your answer" value={goalsExplanation} onChange={(e) => setGoalsExplanation(e.target.value)}></textarea>

                    {/* Question 11: Additional Comments */}
                    <label htmlFor="additional-comments">Do you have any other comments, suggestions, or feedback for us?</label>
                    <textarea className="form-control mg-b-20 border-primary border-b" id="additional-comments" placeholder="Your answer" value={additionalComments} onChange={(e) => setAdditionalComments(e.target.value)}></textarea>

                    <div className="row justify-content-center align-items-center mg-t-25 mg-b-20">
                        <button type="submit" onClick={onSubmit} className="btn btn-primary" disabled={loading}>
                            {loading ? <TailSpin stroke="#652cb3" height={20}/> : "Submit"}
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