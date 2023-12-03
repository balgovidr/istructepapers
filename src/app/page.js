import Image from 'next/image'
import Head from 'next/head';
import {  onAuthStateChanged  } from '@firebase/auth';
import { auth } from "../firebase";
import { redirect } from 'next/navigation'

async function getData() {
  let user = null;

  try {
    const result = await onAuthStateChanged(auth);
    user = result ? result : null;
  } catch (error) {
    console.error("Error fetching user:", error.message);
  }

  // Pass data to the page via props
  return {
    user,
  };
}

export default async function Home() {
  const data = await getData();

  if (data.user !== null) {
    redirect("/content");
  }

  return (
    <div className='h-full flex flex-col justify-between welcome'>
        {/* <Head>
          <title>Solved IStructE exam papers</title>
          <meta name="Homepage" content="Homepage"/>
        </Head> */}
        <div className='h-full flex flex-col justify-center text-center px-[10%]'>
          <h1 className="font-size-50 my-8">Solved <span className="text-gradient d-inline">IStructE</span> papers</h1>
          {/* <h2 className="font-size-50"><span className="d-inline">Resources that </span><span className="text-gradient d-inline">improve your chances</span></h2> */}
          <h3 className="font-size-20 my-5">The <span className="text-gradient">IStructE</span> membership exam is notoriously difficult. Use the community and our repository of solutions to help you.</h3>
          <div className="row mg-t-100 justify-content-center button-container">
            <a className="btn btn-primary" href="/content">Solved papers</a>
            <a className="btn btn-primary-outline mg-l-50" href="/upload">Upload a paper</a>
          </div>
        </div>
    </div>
  )
}