'use client'

import React, { useEffect, useState } from "react";
import RenderProfilePicture from '@/components/profilePicture';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '@/firebase/firebaseClient';
import { getDocs, getDoc, doc, addDoc, collection, query, where } from "firebase/firestore";
// import { format } from 'date-fns';
import { revalidateTag } from "next/cache";
const { format } = require("date-fns/format");

export default function CommentForm({user, paperId}) {
    const [commentText, setCommentText] = useState("");

    const commentSubmit = async (e, user, paperId) => {
    
        try {
          const docRef = await addDoc(collection(db, "comments"), {
            paperId: paperId,
            userId: user.uid,
            dateTime: format(new Date(), 'yyyy-MM-dd-kk-mm-ss'),
            text: commentText,
            replies: [],
          }).then(() => {
            setCommentText("");
            revalidateTag('comments')
          });
        } catch (e) {
          console.error("Error adding document: ", e);
        }
      }
    
    if (user) {
      return (
          <div className="comment-form row mg-t-20">
              <form className="row full-width align-items-baseline">
              <div className="profile-picture-small">
                  {RenderProfilePicture(user.photoUrl, user.firstName, user.lastName)}
              </div>
              <span
                  type="text"
                  className="form-control col-1 mg-r-10 input-comment"
                  id="comment-input"
                  placeholder="Add a comment..."
                  value={commentText}
                  onInput={(e) => setCommentText(e.target.textContent)}
                  contentEditable="true"
                  required
              />
              <button formAction={(e) => commentSubmit(e, user, paperId)} className="btn btn-primary-outline flex align-items-center" style={{height: 2 +'em'}}>
                  Comment
              </button>
              </form>
          </div>
      )
    }
    
    return null
  };