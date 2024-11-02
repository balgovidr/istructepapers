import { redirect } from 'next/navigation'
import { cookies } from "next/headers";
import Footer from '@/components/footer';
import GenerateHomepageBlogs from '@/components/homepageBlog';

export const metadata = {
  title: 'Solved IStructE exam papers - Structural Papers',
  description: 'Access a growing collection of IStructE exam paper solutions and benefit from community wisdom. Your resource for conquering the IStructE exam.',
  alternates: {
    canonical: process.env.NEXT_PUBLIC_HOST,
  },
  openGraph: {
    title: 'Solved IStructE exam papers - Structural Papers',
    description: 'Access a growing collection of IStructE exam paper solutions and benefit from community wisdom. Your resource for conquering the IStructE exam.',
    url: process.env.NEXT_PUBLIC_HOST,
    siteName: 'Structural Papers',
    images: [
      {
        url: process.env.NEXT_PUBLIC_HOST + '/opengraph-image.webp',
        width: 1200,
        height: 628,
        alt: 'Image describing Structural Papers',
      },
    ],
    type: 'website',
  },
}

export default async function Home() {
  let user = null

  try {
    const session = cookies().get("session");
    const encodedResponse = await fetch(process.env.NEXT_PUBLIC_HOST + "/api/login", {method: "GET",
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
        <section className='min-h-[calc(100vh-80px)] md:min-h-[calc(100vh-65px)] flex flex-col justify-center text-center px-[10%]'>
          <h1 className="text-4xl md:text-5xl my-8">Solved <span className="text-gradient d-inline">IStructE</span> past paper solutions</h1>
          <p className="md:text-lg my-5">The <span className="text-gradient">IStructE</span> membership exam is notoriously difficult. Use the community and our repository of IStructE sample answers to help you.</p>
          <div className="row mg-t-100 justify-content-center button-container">
            <a className="btn btn-primary" href="/content">Solved papers</a>
            <a className="btn btn-primary-outline mg-l-50" href="/upload">Upload a paper</a>
          </div>
        </section>
        <section id="about" className="flex flex-col md:flex-row bg-primary py-20 px-10 gap-8 text-white">
            <h2 className="md:w-1/2 self-center text-center">About Us</h2>
            <span className='md:w-1/2'>
              <p>Structural Papers is your dedicated platform for mastering the <a href='https://www.istructe.org/training-and-development/membership-exams/chartered-membership-exam/'>IStructE exam</a>. We understand the challenges and demands of preparing for the <a href='https://www.istructe.org/'>Institution of Structural Engineers (IStructE)</a> exam, and we are here to support you to achieve your goal of becoming a <a href='https://www.istructe.org/membership/chartered-membership/'>Chartered Structural Engineer</a>.</p>
              <br />
              <p>We offer an extensive collection of solved IStructE membership exam papers. By accessing these solutions, you can gain valuable insights into the <b>exam&apos;s format</b>, <b>question types</b>, <b>engineering techniques</b>, <b>clever details</b>, and effective <b>problem-solving strategies</b>.</p>
              <br />
              <p>Beyond providing solved IStructE exam papers, we are committed to fostering a collaborative learning environment using comments to discuss each other&apos;s papers and features to review papers. By engaging with peers who are also going through the IStructE exam preparation, you can <b>gain diverse perspectives and strategies</b> that can enhance your own preparation.</p>
            </span>
        </section>
        <section className="min-h-screen flex flex-col bg-light items-center md:flex-row-reverse py-20">
          <div className="md:w-1/2 w-full md:h-full flex flex-col justify-center gap-4 p-8 items-center md:items-start">
            <h2 className="text-4xl text-center md:text-left">Latest from our blog</h2>
            <a className="btn btn-primary-outline hidden md:flex" href="/blog">View our entire blog</a>
          </div>
          <GenerateHomepageBlogs />
        </section>
        <section className="flex flex-col md:flex-row bg-primary text-white gap-8 py-20">
          <h2 className="text-3xl text-center md:w-1/2 self-center">Ready to get started?</h2>
          <div className="flex flex-col justify-center items-center md:w-1/2 gap-3">
            <div className="text-xl">Start revising</div>
            <a className="border-white border rounded-lg py-2 px-5 self-center hover:bg-white hover:text-primary duration-300" href="/content">
              View sample answers
            </a>
          </div>
        </section>
    </div>
  )
}