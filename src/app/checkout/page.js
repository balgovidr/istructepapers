'use client'

import React, { useCallback } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout
} from '@stripe/react-stripe-js';
import {functions} from '@/firebase/config'
import { httpsCallable } from "firebase/functions";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

export default function Checkout() {
    const fetchClientSecret = useCallback(async () => {
        // Create a Checkout Session
        const createCheckoutSession = httpsCallable(functions,'createCheckoutSession')
        const res = await createCheckoutSession();
        const clientSecret = res.data.clientSecret
        return clientSecret
    }, []);
    
    const options = {fetchClientSecret};

    return (
        <div className="full-height column content text-center">
            <h1 className="text-2xl my-5">Checkout</h1>
            <div className="px-[10%]">To ensure a smooth payment process, we require a minimum transaction of £10. This minimum charge helps cover processing fees. For this £10 payment, you&apos;ll receive 10 credits, which can be used to access any of our papers at 2 credits each. Enjoy your expanded access to our content!</div>
            <EmbeddedCheckoutProvider
                stripe={stripePromise}
                options={options}
            >
                <EmbeddedCheckout />
            </EmbeddedCheckoutProvider>
        </div>
    )
}