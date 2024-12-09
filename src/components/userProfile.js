'use client'

import React, { useEffect, useState } from "react";
import Rating from '@mui/material/Rating';
import StarIcon from '@mui/icons-material/Star';
import { calculateUserStarRating, fetchUserData } from "@/functions/user";
import { RenderProfilePicture } from "./profilePicture";

const UserProfile = ({ uid }) => {
  const [userData, setUserData] = useState(null);
  const [rating, setRating] = useState(null);

  useEffect(() => {
    async function fetchData() {
      const userData = await fetchUserData(uid);
      const starRatingNumber = await calculateUserStarRating(uid);

      setUserData(userData)
      setRating(starRatingNumber)
    }
    
    fetchData();
  }, [uid]);

  return (
    <div className="user-profile">
      <div className="profile-picture">
        <RenderProfilePicture userData={userData} />
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
