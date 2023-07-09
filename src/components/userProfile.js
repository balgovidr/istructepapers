import React, { useEffect, useState } from "react";
import { getDoc, doc } from "firebase/firestore";
import { db } from "../firebase";
import { faStar } from '@fortawesome/free-solid-svg-icons'
import { faStar as faStarO} from '@fortawesome/free-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Rating from '@mui/material/Rating';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';

const UserProfile = ({ uid }) => {
  const [userData, setUserData] = useState(null);
  const [photoUrl, setPhotoUrl] = useState(null);
  const [initials, setInitials] = useState("");

  useEffect(() => {
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
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [uid]);

  const renderProfilePicture = () => {
    if (photoUrl) {
      return <img src={photoUrl} alt="Profile" />;
    } else if (initials) {
      return <div className="initials-icon">{initials}</div>;
    }
    return null;
  };

  const renderStarRating = () => {
    if (userData) {
      if (userData.rating === undefined) {
        return(
          <div class="column">
            <Rating name="no-value" value={null} size="small" readOnly />
          </div>
        )
      } else {
        const starRating = Math.round(userData.rating);
  
        return (
          <div class="star-rating-dark column">
            <Rating className="star-rating" name="read-only" value={starRating} icon={<StarIcon fontSize="inherit"/>}
            emptyIcon={<StarIcon fontSize="inherit" />} size="small" readOnly />
          </div>
        )
      }
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
            <span>{userData.firstName} {userData.lastName}</span>
            {renderStarRating()}
          </>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
