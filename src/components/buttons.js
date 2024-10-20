'use client'

import { TailSpin } from 'react-loading-icons';
import { useFormStatus } from 'react-dom'
import { useEffect } from 'react';
import { CircularProgress, Tooltip } from '@mui/material';
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
    <div className="flex flex-row flex-wrap mg-t-50 justify-center button-container gap-4">
      <Tooltip title="Earn money by uploading solved papers">
        <a className="btn btn-primary-outline min-w-[150px] mx-[5%] flex flex-col items-center gap-3 justify-center" href="/upload">
          <span>Upload a paper</span>
        </a>
      </Tooltip>
      <div className='flex flex-col max-w-96 gap-2'>
        <span className="text-left">Earn money by uploading a solved paper.</span>
        <span className="text-left">We get about 300 visitors each month viewing papers. Earn £1 for each visitor that chooses to view your entire paper.</span>
      </div>
    </div>
  )
}