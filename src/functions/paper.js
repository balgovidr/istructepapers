import { db } from "@/firebase/config";
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";

export function updateUserRating(ownerId) {
    const fetchPaperData = async () => {
        try {
            const q = query(collection(db, "solvedPapers"), where("owner", "==", ownerId));

            var totalSum = 0;

            const querySnapshot = await getDocs(q);
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

            const docRef = doc(db, "users", ownerId);
            updateDoc(docRef, {rating: finalAverageRating })

        } catch (error) {
          console.error("Error fetching paper data:", error);
        }
      };
  
      fetchPaperData();
};

export function getMonthName(monthNumber) {
  const date = new Date();
  date.setMonth(monthNumber - 1);

  return date.toLocaleString('en-US', { month: 'short' });
}