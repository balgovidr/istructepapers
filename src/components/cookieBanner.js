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

    const handleClearCookies = () => {
        // Get all cookie names
        const cookieNames = Object.keys(cookies);
    
        // Remove each cookie
        cookieNames.forEach(cookieName => {
          removeCookie(cookieName, { path: '/' });
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

    useEffect(() => {
        // Check for existing consent
        const hasConsent = cookies['consent'] === true;

        // Delete non-essential cookies if no consent
        if (!hasConsent) {
            handleClearCookies()
        } else {
            handleCookies()
        }
    }, [cookies]);

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
        setCookie('consent', true, { path: '/' });

        // Set non-essential cookies
        setCookie('performance', false, { path: '/' });
        setCookie('functional', false, { path: '/' });
        setCookie('targeting', false, { path: '/' });

        window.location.reload(false);
    };

    return (
        !cookies['consent'] && (
        <div className="flex-column cookie-banner">
            <p>This website uses cookies to enhance your experience. Read our <a href='/cookie-policy'>cookie policy</a>.</p>
            <FormGroup>
                <div className='flex-row space-between'>
                    <div className='flex-row'>
                        <FormControlLabel control={<Checkbox disabled checked />} label={<Typography sx={{ fontSize: 12 }}>Strictly necessary</Typography>} />
                        <FormControlLabel control={<Checkbox />} checked={performance} onChange={() => setPerformance(!performance)} label={<Typography sx={{ fontSize: 12 }}>Performance (remembers your login)</Typography>} />
                        <FormControlLabel control={<Checkbox />} checked={targeting} onChange={() => setTargeting(!targeting)} label={<Typography sx={{ fontSize: 12 }}>Targeting</Typography>} size="small"/>
                        <FormControlLabel control={<Checkbox size="small"/>} checked={functional} onChange={() => setFunctional(!functional)} label={<Typography sx={{ fontSize: 12 }}>Functional</Typography>}/>
                    </div>
                    <div className="flex-row">
                        <button className="btn btn-primary-outline mg-a-10 pd-a-10" onClick={() => handleWithdrawConsent()}>Decline</button>
                        <button className="btn btn-primary-outline mg-a-10 pd-a-10" onClick={() => handleGiveConsent()}>Accept selected</button>
                        <button className="btn btn-success mg-a-10 pd-a-10" onClick={() => handleGiveConsentAll()}>Accept all</button>
                    </div>
                </div>
            </FormGroup>
        </div>
        )
    );
};

export default CookieBanner;
