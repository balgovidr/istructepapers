'use client'

import React, { useCallback, useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout
} from '@stripe/react-stripe-js';
import {auth, functions} from '@/firebase/config'
import { httpsCallable } from "firebase/functions";
import { onAuthStateChanged } from 'firebase/auth';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

export default function Checkout() {
    const [user, setUser] = useState(null);

    /** Listen for auth state changes */
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (result) => {
            setUser(result);
        });

        return () => {
            unsubscribe();
        };
    }, []);

    const fetchClientSecret = useCallback(async () => {
        if (user) {
            // Create a Checkout Session
            const createCheckoutSession = httpsCallable(functions,'createCheckoutSession')
            const res = await createCheckoutSession({customer_uid: user.uid});
            const clientSecret = res.data.clientSecret
            return clientSecret
        }
    }, [user]);
    
    const options = {fetchClientSecret};

    return (
        <div className="column content text-center min-h-[calc(100%-65px)] flex flex-col justify-center gap-10 items-center">
            <h1 className="text-2xl my-5">Checkout</h1>
            <div className="px-[10%]">To ensure a smooth payment process, we require a minimum transaction of £10. This minimum charge helps spread processing fees. For this £10 payment, you&apos;ll receive 10 credits, which can be used to access any of our papers at 2 credits each. Enjoy your expanded access to our content!</div>
            {user ?
                <EmbeddedCheckoutProvider
                    stripe={stripePromise}
                    options={options}
                >
                    <EmbeddedCheckout />
                </EmbeddedCheckoutProvider>
            :
                <div>Please <a href="/auth/login">login</a> first before you continue.</div>
            }
        </div>
    )
}