'use client'

import React, { useEffect, useState } from 'react';
import { redirect } from 'next/navigation';
import {functions} from '@/firebase/config'
import { httpsCallable } from "firebase/functions";
import { CircularProgress } from '@mui/material';

export default function Return() {
  const [status, setStatus] = useState(null);
  const [customerEmail, setCustomerEmail] = useState('');

  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const sessionId = urlParams.get('session_id');

  useEffect(() => {
    async function checkoutSession() {
      try {
        const getCheckoutSession = httpsCallable(functions,'getCheckoutSession')
        const res = await getCheckoutSession({sessionId: sessionId});

        setStatus(res.data.sessionStatus);
        setCustomerEmail(res.data.customer_email);
      } catch (e) {
        setStatus("invalid")
      }
    }

    if (sessionId) {
      checkoutSession()
    }
  }, [sessionId]);

  if (status === 'open') {
    return (
      redirect('/')
    )
  }

  if (status === 'complete') {
    return (
      <section id="success" className="container px-[10%] h-[calc(100%-65px)] flex flex-col justify-center gap-10 items-center">
        <p className='text-xl'>
          Thank you!
        </p>
        <p className='text-md'>
          Go back to the paper you were viewing and you&apos;ll be able to access it and more now!
        </p>
      </section>
    )
  }

  if (!status) {
    return (
      <section className="container px-[10%] h-[calc(100%-65px)] flex flex-col justify-center gap-10 items-center">
        <CircularProgress />
      </section>
    )
  }

  if (status === 'invalid') {
    return (
      <section id="success" className="container px-[10%] h-[calc(100%-65px)] flex flex-col justify-center gap-10 items-center">
        <p className='text-md'>
          This link is invalid.
        </p>
      </section>
    )
  }

  return null;
}