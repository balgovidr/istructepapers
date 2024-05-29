import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/navbar';
import {  onAuthStateChanged  } from 'firebase/auth';

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  alternates: {
    canonical: process.env.NEXT_PUBLIC_DB_HOST,
  },
}

export default async function RootLayout({ children }) {

  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/x-icon" href="/favicon.png"/>
      </head>
      <body className={inter.className} suppressHydrationWarning={true}>
        <Navbar />
        {children}
      </body>
    </html>
  )
}
