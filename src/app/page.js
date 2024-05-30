import Image from 'next/image'
import { redirect } from 'next/navigation'
import { cookies } from "next/headers";
import Footer from '@/components/footer';

export const metadata = {
  title: 'Solved IStructE exam papers - Structural Papers',
  description: 'Access a growing collection of IStructE exam paper solutions and benefit from community wisdom. Your resource for conquering the IStructE exam.',
}

export default async function Home() {
  let user = null

  try {
    const session = cookies().get("session");
    const encodedResponse = await fetch(process.env.NEXT_PUBLIC_DB_HOST + "/api/login", {method: "GET",
      headers: { Cookie: `session=${session?.value}` }, });
    const response = await encodedResponse.json();

    if (response.isLogged) {
      user = response.user
    } else {
      if (response.error == "auth/session-cookie-expired") {
        redirect('/auth/login')
      }
    }
  } catch (error) {
  }

  if (user !== null) {
    redirect("/content");
  }

  return (
    <div className='flex flex-col justify-between welcome'>
        {/* <Head>
          <title>Solved IStructE exam papers</title>
          <meta name="Homepage" content="Homepage"/>
        </Head> */}
        <section className='min-h-[calc(100vh-80px)] md:min-h-[calc(100vh-65px)] flex flex-col justify-center text-center px-[10%]'>
          <h1 className="text-4xl md:text-5xl my-8">Solved <span className="text-gradient d-inline">IStructE</span> exam papers</h1>
          {/* <h2 className="font-size-50"><span className="d-inline">Resources that </span><span className="text-gradient d-inline">improve your chances</span></h2> */}
          <p className="md:text-lg my-5">The <span className="text-gradient">IStructE</span> membership exam is notoriously difficult. Use the community and our repository of solutions to help you.</p>
          <div className="row mg-t-100 justify-content-center button-container">
            <a className="btn btn-primary" href="/content">Solved papers</a>
            <a className="btn btn-primary-outline mg-l-50" href="/upload">Upload a paper</a>
          </div>
        </section>
        <section id="about" className="flex flex-col md:flex-row bg-primary py-20 px-10 gap-8 text-white">
            <h2 className="md:w-1/2 self-center text-center">About Us</h2>
            <p className="md:w-1/2">Structural Papers is your dedicated platform for mastering the IStructE exam. We provide a wealth of resources, including solved papers, community insights, and valuable tips to guide you on your journey to an IStructE chartership.</p>
        </section>
        <section className="min-h-screen flex flex-col bg-light items-center md:flex-row-reverse py-20">
          <div className="md:w-1/2 w-full md:h-full flex flex-col justify-center gap-4 p-8 items-center md:items-start">
            <h2 className="text-4xl text-center md:text-left">Latest from our blog</h2>
            {/* <a href="/FAQ" className="border-primary border-2 rounded-lg py-1 px-5 mt-5 max-w-[200px] md:hover:border-secondary md:hover:text-secondary duration-300">View all questions</a> */}
          </div>
          <div className="md:w-1/2 w-full h-1/2 md:h-full flex flex-col justify-evenly px-8 gap-5">
            <a className='flex flex-col rounded-md border border-gray-100 shadow-md bg-white w-full p-3 gap-2' href="/blog/cracking-the-istructe-exam">
              <h3 className='flex flex-row justify-between items-center'>Cracking the IStructE exam</h3>
              <hr className='border-gray-300'/>
              <p className='text-sm'>Master the IStructE exam with these proven strategies and tips. From study schedules to practice papers, unlock success with expert insights.</p>
            </a>
            <a className='flex flex-col rounded-md border border-gray-100 shadow-md bg-white w-full p-3 gap-2' href="/blog/importance-of-practice">
              <h3 className='flex flex-row justify-between items-center'>The Importance of Practice</h3>
              <hr className='border-gray-300'/>
              <p className='text-sm'>Explore why and how practicing for the IStructE exam using past papers is vital.</p>
            </a>
          </div>
        </section>
        <section className="flex flex-col md:flex-row bg-primary text-white gap-8 py-20">
          <h2 className="text-3xl text-center md:w-1/2 self-center">Ready to get started?</h2>
          <div className="flex flex-col justify-center items-center md:w-1/2 gap-3">
            <div className="text-xl">Start revising</div>
            <a className="border-white border-2 rounded-lg py-1 px-5 self-center hover:border-secondary hover:text-secondary duration-300" href="/content">
              View sample answers
            </a>
          </div>
        </section>
        <Footer />
    </div>
  )
}