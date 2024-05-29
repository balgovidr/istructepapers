import { collection, addDoc, setDoc, doc, query, where, getDocs, updateDoc } from "firebase/firestore";
import { InitializeFirebase, InitializeFirestore } from "@/firebase/firebaseAdmin";

export function updateUserRating(ownerId) {
  const db = InitializeFirestore();
    const fetchPaperData = async () => {
        try {
            const q = db.collection("solvedPapers").where("owner", "==", ownerId);

            var totalSum = 0;

            const querySnapshot = await q.get();
            querySnapshot.forEach((doc) => {
                // Retrieve the values from the map and store them in an array
                const valuesArray = Object.values(doc.data().rating);

                // Calculate the sum of all values
                const sum = valuesArray.reduce((accumulator, currentValue) => accumulator + currentValue, 0);

                // Calculate the average
                const averageRating = sum / valuesArray.length;

                totalSum = totalSum + averageRating

            });

            const finalAverageRating = totalSum / querySnapshot.size

            const docRef = db.collection("users").doc(ownerId);
            docRef.update({rating: finalAverageRating })

        } catch (error) {
          console.error("Error fetching paper data:", error);
        }
      };
  
      fetchPaperData();
};