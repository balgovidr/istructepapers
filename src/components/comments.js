import { getDocs, getDoc, doc, collection, query, where } from "firebase/firestore";
import { db } from '@/firebase/firebaseClient';
import { format } from 'date-fns';
import { revalidateTag } from "next/cache";
import { initializeFirestore } from "@/firebase/firebaseAdmin";
import { CommentSubmitButton } from "./buttons";
import { RenderProfilePicture } from "./profilePicture";

async function getComments(paperId) {
  const fetchUserDocument = async (userId) => {
    try {
      const userDocRef = doc(db, "users", userId);
      const userDocSnap = await getDoc(userDocRef);
      return userDocSnap.data();
    } catch (error) {
      console.error("Error fetching user document:", error);
      return null;
    }
  };
  
  const generateCommentComponent = (userDoc, commentData) => {
    if (userDoc && commentData) {
      return (
        <div className="row mg-b-20" key={commentData.id}>
          <div className="profile-picture-small">
            <RenderProfilePicture userData={userDoc} />
          </div>
          <div className="column">
            <span>{userDoc.firstName + ' ' + userDoc.lastName}</span>
            <span className="font-size-13 mg-t-2">{commentData.text}</span>
            {/* <a href="/" className="font-size-13 mg-t-2"><ReplyIcon fontSize="inherit"/>Reply</a> */}
            {/* {replies(commentData.replies)} */}
            {/* When you update the replies, the link to a good preview is here: https://github.com/RiyaNegi/react-comments-section */}
          </div>
        </div>
      );
    }
  
    return (
      <div>Loading...</div>
    )
  };

  try {
    const q = query(collection(db, "comments"), where("paperId", "==", paperId));
    const querySnapshot = await getDocs(q);
    const documents = querySnapshot.docs;

    // Sort documents based on the "dateTime" field
    documents.sort((a, b) => {
      const dateTimeA = a.data().dateTime;
      const dateTimeB = b.data().dateTime;
      return dateTimeB.localeCompare(dateTimeA);
    });

    const commentsArray = [];

    for (const document of documents) {
      const value = document.data();
      value.id = document.id;

      const userDoc = await fetchUserDocument(value.userId);
      if (userDoc) {
        const commentComponent = generateCommentComponent(userDoc, value);
        commentsArray.push(commentComponent);
      } else {
      }
    }

    if (commentsArray.length == 0) {
      commentsArray.push(<div key="comment-1">No comments about this solution yet. Get the ball rolling yourself by posting a comment!</div>)
    }

    return commentsArray
  } catch (error) {
    console.error("Error fetching comments data:", error);
  }
}

export default async function Comments({paperId, user = null, userData = null}) {  
  const comments = await getComments(paperId, {
    next: {
      tags: ["comments"],
    }
  })

  async function commentSubmit(formData) {
    "use server"
    const db = initializeFirestore()
  
    const comment = formData.get("comment");
  
    if (!comment || comment === '') return;
  
    try {
      await db.collection("comments").add({
        paperId: paperId,
        userId: user.uid,
        dateTime: format(new Date(), 'yyyy-MM-dd-kk-mm-ss'),
        text: comment,
        replies: [],
      }).then(() => {
        revalidateTag('comments')
      });
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  }
  
  return (
    <div className="comments-section mg-t-25">
      <div className="comment-form row mg-t-20">
        {userData ?
        <form className="row full-width align-items-baseline" action={commentSubmit}>
          <div className="profile-picture-small">
              <RenderProfilePicture userData={userData} />
          </div>
          <textarea
              className="form-control col-1 mg-r-10 input-comment"
              id="comment-input"
              placeholder="Add a comment..."
              name="comment"
              required
          />
          <CommentSubmitButton />
        </form>
        :
        <span className="text-sm mb-6"><a href="/auth/login" className="underline">Login</a> or <a href="/auth/signup" className="underline">signup</a> to post your own comments.</span>
        }
      </div>
      <div className="comments">
        <h3>Comments:</h3>
        <hr className="solid" style={{margin: "0px", marginBottom: "10px"}}/>
        {comments}
      </div>
    </div>
  );
};