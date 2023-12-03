import { getDocs, getDoc, doc, addDoc, collection, query, where } from "@firebase/firestore";
import { db, auth } from "@/firebase";
import { onAuthStateChanged } from '@firebase/auth';
import { format } from 'date-fns';
import ReplyIcon from '@mui/icons-material/Reply';
import renderProfilePicture from '@/components/profilePicture';
import getUser from '@/functions/login.tsx';
import { revalidateTag } from "next/cache";
import CommentForm from "./commentForm";

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
            {renderProfilePicture(userDoc.photoUrl, userDoc.firstName, userDoc.lastName)}
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
        console.log("User not found for comment:", value);
      }
    }

    return commentsArray
  } catch (error) {
    console.error("Error fetching comments data:", error);
  }
}

export default async function Comments({paperId, user}) {
  console.log(paperId)
  console.log(user)

  const comments = await getComments(paperId, {
    next: {
      tags: ["comments"],
    }
  })

  // const commentSubmit = async (e, user, paperId) => {
  //   "use server";

  //   const comment = e.get("comment")?.toString();

  //   if (!comment || comment === '') return;

  //   try {
  //     const docRef = await addDoc(collection(db, "comments"), {
  //       paperId: paperId,
  //       userId: user.uid,
  //       dateTime: format(new Date(), 'yyyy-MM-dd-kk-mm-ss'),
  //       text: comment,
  //       replies: [],
  //     }).then(() => {
  //       revalidateTag('comments')
  //     });
  //   } catch (e) {
  //     console.error("Error adding document: ", e);
  //   }
  // }
  
  return (
    <div className="comments-section mg-t-25">
      {/* <div className="comment-form row mg-t-20">
            <form className="row full-width align-items-baseline">
              <div className="profile-picture-small">
                  {user && renderProfilePicture(user.photoUrl, user.firstName, user.lastName)}
              </div>
              <span
                  type="text"
                  className="form-control col-1 mg-r-10 input-comment"
                  id="comment-input"
                  placeholder="Add a comment..."
                  name="comment"
                  contentEditable="true"
                  required
              />
              <button formAction={(e) => commentSubmit(e, user, paperId)} className="btn btn-primary-outline flex align-items-center" style={{height: 2 +'em'}}>
                  Comment
              </button>
            </form>
        </div> */}

        <CommentForm user={user} paperId={paperId} />

      <div className="comments">
        <h3>Comments:</h3>
        <hr className="solid" style={{margin: "0px", marginBottom: "10px"}}/>
        {comments}
      </div>
    </div>
  );
};