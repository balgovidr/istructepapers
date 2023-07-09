import React, { useEffect, useState } from "react";
import { getDoc, doc, setDoc, updateDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import { onAuthStateChanged } from 'firebase/auth';
import Rating from '@mui/material/Rating';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';


const RatePaper = ({ id }) => {
  const [rating, setRating] = useState(null);
  const [ratingMap, setRatingMap] = useState(null);
  const [currentUserRating, setCurrentUserRating] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const docRef = doc(db, "solvedPapers", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setRatingMap(data.rating);
        } else {
          console.log("Paper document does not exist");
        }
      } catch (error) {
        console.error("Error fetching paper data:", error);
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
      const currentUserUid = user.uid; // Replace with your own logic to get the current user's UID
      const currentUserRating = ratingMap[currentUserUid];
      setCurrentUserRating(currentUserRating);
    }
  }, [ratingMap, user]);

  const renderStarRating = () => {
    console.log(currentUserRating)
    console.log(ratingMap)
      if (currentUserRating) {
        const starRating = Math.round(currentUserRating);

        return (
          <div class="star-rating-primary">
            <span>Rate this paper</span>
            <Rating
              name="simple-controlled"
              value={starRating}
              onChange={(event, newValue) => {
                handleStarClick(newValue);
              }}
              icon={<StarIcon fontSize="inherit"/>}
              emptyIcon={<StarIcon fontSize="inherit"
              />}
            />
          </div>
        )
      } else if (ratingMap) {
        // Retrieve the values from the map and store them in an array
        const valuesArray = Object.values(ratingMap);
        console.log(valuesArray)

        // Calculate the sum of all values
        const sum = valuesArray.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
        console.log(sum)

        // Calculate the average
        const averageRating = sum / valuesArray.length;
        console.log(averageRating)

        const starRating = Math.round(averageRating);
        
        if (user) {
          return (
            <div class="star-rating-dark column">
              <span>Rate this paper</span>
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
            <div class="star-rating-dark column">
              <span>Rating:</span>
              <Rating className="star-rating" name="read-only" value={starRating} icon={<StarIcon fontSize="inherit"/>}
              emptyIcon={<StarIcon fontSize="inherit" />} readOnly />
            </div>
          )
        }

      } else {
        if (user) {
          return (
            <div class="star-rating-dark column">
              <span>Rate this paper</span>
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
            <div class="column">
              <span>Rate this paper</span>
              <Rating name="no-value" value={null} readOnly />
            </div>
          )
        }
      }
  };

  const handleStarClick = (newValue) => {
    if (user) {
      const currentUserUid = user.uid; // Replace with your own logic to get the current user's UID
      const newRating = Math.round(newValue);
      const newRatingMap = {[currentUserUid]: newRating };

      setRatingMap(newRatingMap);

      // Update the rating map in Firebase Firestore
      const docRef = doc(db, "solvedPapers", id);
      const updateField = "rating." + currentUserUid;
      updateDoc(docRef, {[updateField]: newRating })
        .then(() => {
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
