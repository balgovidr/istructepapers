'use client'

import { TailSpin } from 'react-loading-icons';
import { useFormStatus } from 'react-dom'
import { useEffect } from 'react';
import { CircularProgress } from '@mui/material';
import { useState } from 'react';
import { fetchSettings } from '@/functions/settings';

export function CommentSubmitButton() {
  const { pending } = useFormStatus()
 
  return (
    <button className="btn btn-primary-outline flex align-items-center" style={{height: 2 +'em'}} type="submit" aria-disabled={pending}>
        {pending ? <TailSpin stroke="#652cb3" height={20}/> : "Comment"}
    </button>
  )
}

export function ButtonsWithPoints() {
  const [points, setPoints] = useState(null)

  useEffect(() => {
    async function fetchData() {
      const settings = await fetchSettings("points")

      setPoints(settings)
    }
    
    fetchData()
  })

  return (
    <div className="flex flex-row flex-wrap mg-t-50 justify-center button-container">
        <a className="btn btn-primary-outline min-w-[150px] mx-[5%] flex flex-col items-center gap-3" href="/upload">
          <span>Upload a paper</span>
        </a>
        <a className="btn btn-primary-outline min-w-[150px] mx-[5%] flex flex-col items-center gap-3" href="/surveys">
          <span>Review papers</span>
          <div className='flex flex-col items-center'>
            {points ?
              <span className='text-md'>+£{points.paperReview/2}</span>
            :
              <CircularProgress size={24} />
            }
            <span className='text-xs'>Points</span>
          </div>
        </a>
    </div>
  )
}