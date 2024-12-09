'use client'

import React, { useEffect, useState } from "react";
import { getDoc, doc, setDoc, updateDoc } from "firebase/firestore";
import { auth, db } from '@/firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import Rating from '@mui/material/Rating';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
//Todo - Restrict a user from rating their own paper

const RatePaper = ({ id }) => {
  const [ratingMap, setRatingMap] = useState(null);
  const [currentUserRating, setCurrentUserRating] = useState(null);
  const [user, setUser] = useState(null);
  const [owner, setOwner] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const docRef = doc(db, "solvedPapers", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setRatingMap(data.rating);
          setOwner(data.owner);
        } else {
        }
      } catch (error) {
      }
    };

    fetchData();
  }, [id]);

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
    // Check if the current user has already rated the paper
    if (ratingMap && user) {
      const currentUserUid = user.uid;
      const currentUserRating = ratingMap[currentUserUid];
      setCurrentUserRating(currentUserRating);
    }
  }, [ratingMap, user]);

  const renderStarRating = () => {
      if (currentUserRating) {
        const starRating = Math.round(currentUserRating);

        return (
          <div className="star-rating-primary column">
            <h3 className="mg-b-5 text-align-right">Rate this paper</h3>
            <Rating
              name="simple-controlled"
              value={starRating}
              onChange={(event, newValue) => {
                handleStarClick(newValue);
              }}
              icon={<StarIcon fontSize="inherit"/>}
              emptyIcon={<StarIcon fontSize="inherit"/>}
            />
          </div>
        )
      } else if (ratingMap) {
        // Retrieve the values from the map and store them in an array
        const valuesArray = Object.values(ratingMap);

        // Calculate the sum of all values
        const sum = valuesArray.reduce((accumulator, currentValue) => accumulator + currentValue, 0);

        // Calculate the average
        const averageRating = sum / valuesArray.length;

        const starRating = Math.round(averageRating);
        
        if (user) {
          return (
            <div className="star-rating-dark column">
              <h3 className="mg-b-5 text-align-right mob-hide">Rate this paper</h3>
              <Rating
                name="simple-controlled"
                value={starRating}
                onChange={(event, newValue) => {
                  handleStarClick(newValue);
                }}
                icon={<StarIcon fontSize="inherit"/>}
                emptyIcon={<StarIcon fontSize="inherit" />}
              />
            </div>
          )
        } else {
          return (
            <div className="star-rating-dark column">
              <h3 className="mg-b-5 text-align-right mob-hide">Paper rating</h3>
              <Rating className="star-rating" name="read-only" value={starRating} icon={<StarIcon fontSize="inherit"/>}
              emptyIcon={<StarIcon fontSize="inherit" />} readOnly />
            </div>
          )
        }

      } else {
        if (user) {
          return (
            <div className="star-rating-dark column">
              <h3 className="mg-b-5 text-align-right mob-hide">Rate this paper</h3>
              <Rating className="star-rating"
                name="no-value"
                value={null}
                onChange={(event, newValue) => {
                  handleStarClick(newValue);
                }}
                icon={<StarIcon fontSize="inherit" />}
                emptyIcon={<StarBorderIcon fontSize="inherit" />}
              />
            </div>
          )
        } else {
          return(
            <div className="column">
              <span className="mg-b-5 text-align-right mob-hide">No rating set yet</span>
              <Rating name="no-value" value={null} readOnly />
            </div>
          )
        }
      }
  };

  const handleStarClick = (newValue) => {
    if (user) {
      const currentUserUid = user.uid;
      const newRating = Math.round(newValue);
      const newRatingMap = {[currentUserUid]: newRating };

      setRatingMap(newRatingMap);

      // Update the rating map in Firebase Firestore
      const docRef = doc(db, "solvedPapers", id);
      const updateField = "rating." + currentUserUid;
      updateDoc(docRef, {[updateField]: newRating })
        .then(() => {
          // updateUserRating(owner);
          setCurrentUserRating(newRating);
        })
        .catch((error) => {
          console.error("Error updating rating map:", error);
        });
    }
  };

  return (
    <div className="rating column align-items-end">
      {renderStarRating()}
    </div>
  );
};

export default RatePaper;
