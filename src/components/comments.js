import React, { useEffect, useState } from "react";
import { getDocs, getDoc, doc, addDoc, collection, query, where, orderBy } from "@firebase/firestore";
import { db, auth } from "../firebase";
import { onAuthStateChanged } from 'firebase/auth';
import { format } from 'date-fns';
import ReplyIcon from '@mui/icons-material/Reply';

export default function Comments({paperId}) {
  const [commentText, setCommentText] = useState("");
  const [user, setUser] = useState(null);
  const [comments, setComments] = useState(null);
  const [userData, setUserData] = useState(null);
  const [commentsFetched, setCommentsFetched] = useState(false);
  const [userDataFetched, setUserDataFetched] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  /** Listen for auth state changes */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (result) => {
      setUser(result);
    });

    return () => {
      unsubscribe();
    };
  }, []);
  

  useEffect(() => {
    fetchComments();
  }, [paperId]);

  const fetchComments = async () => {
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

      setComments(commentsArray);
    } catch (error) {
      console.error("Error fetching comments data:", error);
    } finally {
      setCommentsFetched(true);
    }
  };

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
};
  

  useEffect (() => {
    const fetchUserData = async () => {
      if (user) {
        try {
            const userDocRef = doc(db, "users", user.uid);
            const userDocSnap = await getDoc(userDocRef);
            const data = userDocSnap.data();

            setUserData(data)
        } catch (error) {
          console.error("Error fetching user data:", error);
        } finally {
          setUserDataFetched(true)
        }
      } else {
        console.log('User not logged in')
      }
    };

    fetchUserData();
  }, [user]);

  useEffect (() => {
    if(commentsFetched && userDataFetched) {
      setIsLoading(false)
    }
  }, [commentsFetched, userDataFetched]);


  const renderProfilePicture = (photoUrl, firstName, lastName) => {
    if (photoUrl) {
      return <img src={photoUrl} alt="Profile" />;
    } else {
      const firstNameInitial = firstName.charAt(0).toUpperCase();
      const lastNameInitial = lastName.charAt(0).toUpperCase();
      return <div className="initials-icon">{firstNameInitial + lastNameInitial}</div>;
    }
  };

  const commentSubmit = async (e) => {
    e.preventDefault()

    try {
      const docRef = await addDoc(collection(db, "comments"), {
        paperId: paperId,
        userId: user.uid,
        dateTime: format(new Date(), 'yyyy-MM-dd-kk-mm-ss'),
        text: commentText,
        replies: [],
      }).then(() => {
        setCommentText("");
        fetchComments();
      });
      console.log("Document written with ID: ", docRef.id);
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  }

  const commentForm = () => {
    if (user) {
      return (
        <div className="comment-form row mg-t-20">
          <form className="row full-width align-items-baseline">
            <div className="profile-picture-small">
              {renderProfilePicture(user.photoUrl, userData.firstName, userData.lastName)}
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
            <button type="submit" onClick={commentSubmit} className="btn btn-primary-outline flex align-items-center" style={{height: 2 +'em'}}>
              Comment
            </button>
          </form>
        </div>
      );
    }
  };
  

  const replies = (data) => {
    if (data.replies === []) {
      data.replies.map(async(replyDoc) => {
        const userDocRef = doc(db, "users", replyDoc.data().userId);
        const userDocSnap = await getDoc(userDocRef);
        const reply = userDocSnap.data();
        return (
          <div className="row" key={replyDoc.id}>
            {renderProfilePicture(reply.photoUrl, reply.firstName, reply.lastName)}
            <div className="column">
              <span>{reply.firstName + ' ' + reply.lastName}</span>
              <span>{reply.text}</span>
              <a href="/"><ReplyIcon fontSize="inherit"/>Reply</a>
            </div>
          </div>
        );
      })
    }
  }

  // if (isLoading) {
  //   return (
  //     <p>Loading</p>
  //   )
  // }
  return (
    <div className="comments-section mg-t-25">
      {commentForm()}
      <div className="comments">
        Comments:
        <hr class="solid" style={{margin: "0px", marginBottom: "10px"}}/>
        {commentsFetched ? comments
         : (<p>Loading...</p>)}
      </div>
    </div>
  );
};