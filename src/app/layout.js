import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '../components/navbar';
import {  onAuthStateChanged  } from '@firebase/auth';
import { auth } from "../firebase";
import getUser from '@/functions/login.tsx';

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Structural Papers',
  description: 'Solved IStructE chartership exam papers',
}

export default async function RootLayout({ children }) {
  const user = await getUser()

  return (
    <html lang="en">
      <body className={inter.className} suppressHydrationWarning={true}>
        <Navbar />
        {children}
      </body>
    </html>
  )
}
