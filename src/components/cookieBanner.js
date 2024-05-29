'use client'

import React, { useState, useEffect } from 'react';
import { useCookies } from 'react-cookie';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Typography from '@mui/material/Typography';

const CookieBanner = () => {
    const [cookies, setCookie, removeCookie] = useCookies();
    const [performance, setPerformance] = useState(false);
    const [targeting, setTargeting] = useState(false);
    const [functional, setFunctional] = useState(false);
    const [showOptions, setShowOptions] = useState(false);
    const [consent, setConsent] = useState(true);

    useEffect(() => {
        // Check for existing consent
        const hasConsent = cookies['consent'] === true;
        setConsent(hasConsent);

        // Delete non-essential cookies if no consent
        if (!hasConsent) {
            handleClearCookies()
        } else {
            handleCookies()
        }
    }, [cookies]);

    const handleClearCookies = () => {
        // Get all cookie names
        const cookieNames = Object.keys(cookies);
    
        // Remove each cookie
        cookieNames.forEach(cookieName => {
            if (cookieName !== 'consent') {
                removeCookie(cookieName, { path: '/' });
            }
        });
    };
    
    const handleCookies = () => {    
        // Remove cookies
        if (!cookies.performance) {
            removeCookie('_ga_4QXX33B0FZ', { path: '/' });
            removeCookie('_ga', { path: '/' });
        }
        if (!cookies.targeting) {
            removeCookie('IDE', { path: '/' });
            removeCookie('test_cookie', { path: '/' });
        }
    };

    const handleGiveConsent = () => {
        // Set consent cookie to 'true'
        setCookie('consent', true, { path: '/' });

        // Set non-essential cookies
        setCookie('performance', performance, { path: '/' });
        setCookie('functional', functional, { path: '/' });
        setCookie('targeting', targeting, { path: '/' });

        window.location.reload(false);
    };

    const handleGiveConsentAll = () => {
        // Set consent cookie to 'true'
        setCookie('consent', true, { path: '/' });

        // Set non-essential cookies
        setCookie('performance', true, { path: '/' });
        setCookie('functional', true, { path: '/' });
        setCookie('targeting', true, { path: '/' });

        window.location.reload(false);
    };

    const handleWithdrawConsent = () => {
        // Set consent cookie to 'true'
        setCookie('consent', false, { path: '/' });

        // Set non-essential cookies
        setCookie('performance', false, { path: '/' });
        setCookie('functional', false, { path: '/' });
        setCookie('targeting', false, { path: '/' });

        window.location.reload(false);
    };

    if (!consent) {
        return (
            <div className='w-full relative'>
                <div className="flex flex-col fixed bottom-0 left-0 right-0 bg-white text-center border-solid border-secondary z-40 m-2 shadow-lg text-sm rounded-lg p-3 gap-4">
                    <p>This website uses cookies to enhance your experience. Read our <a href='/statements/cookie-policy' className='underline'>cookie policy</a>.</p>
                    <FormGroup className='flex flex-col gap-4'>
                        <div className={'flex-col ' + (showOptions ? 'flex' : 'hidden')}>
                            <FormControlLabel control={<Checkbox disabled checked />} label={<Typography sx={{ fontSize: 12 }}>Strictly necessary</Typography>} />
                            <FormControlLabel control={<Checkbox />} checked={performance} onChange={() => setPerformance(!performance)} label={<Typography sx={{ fontSize: 12 }}>Performance (remembers your login)</Typography>} />
                            <FormControlLabel control={<Checkbox />} checked={targeting} onChange={() => setTargeting(!targeting)} label={<Typography sx={{ fontSize: 12 }}>Targeting</Typography>} size="small"/>
                            <FormControlLabel control={<Checkbox size="small"/>} checked={functional} onChange={() => setFunctional(!functional)} label={<Typography sx={{ fontSize: 12 }}>Functional</Typography>}/>
                        </div>
                        <div className={"flex flex-row gap-2 justify-between " + (showOptions ? "hidden" : "flex")}>
                            <button className="border-primary border rounded-md py-1 px-5" onClick={() => handleWithdrawConsent()}>Decline</button>
                            <button className="border-primary border rounded-md py-1 px-5" onClick={() => setShowOptions(!showOptions)}>Accept some</button>
                            <button className="border-primary border rounded-md py-1 px-5" onClick={() => handleGiveConsentAll()}>Accept all</button>
                        </div>
                        <div className={"flex flex-row gap-2 justify-between " + (showOptions ? "flex" : "hidden")}>
                            <button className="border-primary border-2 rounded-lg py-1 px-5" onClick={() => handleWithdrawConsent()}>Decline all</button>
                            <button className="border-primary border-2 rounded-lg py-1 px-5" onClick={() => handleGiveConsent()}>Accept selected</button>
                        </div>
                    </FormGroup>
                </div>
            </div>
        )
    }

    return null
};

export default CookieBanner;
