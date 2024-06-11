import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/navbar';
import { Fab, Tooltip } from '@mui/material';
import FeedbackIcon from '@mui/icons-material/Feedback';

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  alternates: {
    canonical: process.env.NEXT_PUBLIC_HOST,
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
        <Tooltip title="Got any feedback for us?">
          <Fab color="#652cb3" className="hidden md:block fixed bottom-6 right-10 bg-primary text-white content-center text-center hover:text-primary" href="/feedback">
            <FeedbackIcon />
          </Fab>
        </Tooltip>
      </body>
    </html>
  )
}
