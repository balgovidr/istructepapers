'use client'

import React, { useEffect, useState } from "react";
import { getDoc, doc, query, collection, where, getDocs } from "firebase/firestore";
import { auth, db } from '@/firebase/firebaseClient';
import Rating from '@mui/material/Rating';
import StarIcon from '@mui/icons-material/Star';
import Image from "next/image";

const UserProfile = ({ uid }) => {
  const [userData, setUserData] = useState(null);
  const [photoUrl, setPhotoUrl] = useState(null);
  const [initials, setInitials] = useState("");
  const [rating, setRating] = useState(null);

  const fetchUserData = async () => {
    try {
      const userDocRef = doc(db, "users", uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const data = userDocSnap.data();
        setUserData(data);
        setPhotoUrl(data.photoUrl);
        if (data.photoUrl === undefined) {
          const firstNameInitial = data.firstName.charAt(0).toUpperCase();
          const lastNameInitial = data.lastName.charAt(0).toUpperCase();
          setInitials(firstNameInitial + lastNameInitial);
        }
      } else {
        console.log("User document does not exist");
      }
    } catch (error) {
      console.error("4Error fetching user data:", error);
    }
  };

  const calculateStarRating = async () => {
    //Query all papers where this user is the owner
    const q = query(collection(db, "solvedPapers"), where("owner", "==", uid));
    const querySnapshot = await getDocs(q);

    //If there are no papers that the user's uploaded then the rating remains null
    if (querySnapshot.docs.length > 0) {
      //For each document(paper) received, run through and extract the rating array to create a concatenated userRatingArray
      const userRatingArray = querySnapshot.docs.map((document) => {
        const paperData = document.data();
        if (paperData.rating) {
          //For each paper, run through and capture the ratings provided by each user
          const paperRatingArray = Object.keys(paperData.rating).map((givenUserId) => {
            return paperData.rating[givenUserId]
          })

          return paperRatingArray
        }
        return []
      })

      //Flatten the arrays within the array into one long array
      const finalRatingArray = userRatingArray.flat()
      const average = finalRatingArray.reduce((a, b) => a + b, 0) / finalRatingArray.length;

      //Round it to the nearest whole number so that it can be attributed to a star
      const starRating = Math.round(average);

      setRating(starRating)
    }
  };

  useEffect(() => {
    calculateStarRating();
    fetchUserData();
  }, [uid]);

  const renderProfilePicture = () => {
    if (photoUrl) {
      return <Image src={photoUrl} alt="Profile" />;
    } else if (initials) {
      return <div className="initials-icon">{initials}</div>;
    }
    return null;
  };

  return (
    <div className="user-profile">
      <div className="profile-picture">
        {renderProfilePicture()}
      </div>
      <div className="user-info">
        {userData && (
          <>
            <h2>{userData.firstName} {userData.lastName}</h2>
            {rating ?
              <div className="star-rating-dark column">
                <Rating className="star-rating" name="read-only" value={rating} icon={<StarIcon fontSize="inherit"/>}
                emptyIcon={<StarIcon fontSize="inherit" />} size="small" readOnly />
              </div>
            :
              <div className="column">
                <Rating name="no-value" value={null} size="small" readOnly />
              </div>
            }
          </>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
