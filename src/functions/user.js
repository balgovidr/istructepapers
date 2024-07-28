import { db } from '@/firebase/config';
import { query, collection, where, getDocs, doc, getDoc } from 'firebase/firestore';

export async function fetchUserData(uid) {
    const userDocRef = doc(db, "users", uid);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
        const data = userDocSnap.data();

        return data
    }

    return null
};

export async function calculateUserStarRating(uid) {
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

      return starRating
    }
  };