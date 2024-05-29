'use client'

import { TailSpin } from 'react-loading-icons';
import { useFormStatus } from 'react-dom'
 
export function CommentSubmitButton() {
  const { pending } = useFormStatus()
 
  return (
    <button className="btn btn-primary-outline flex align-items-center" style={{height: 2 +'em'}} type="submit" aria-disabled={pending}>
        {pending ? <TailSpin stroke="#652cb3" height={20}/> : "Comment"}
    </button>
  )
}