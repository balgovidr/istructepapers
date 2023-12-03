import React, {useState} from 'react';
import {  getAuth, signOut, onAuthStateChanged  } from '@firebase/auth';
import { collection, addDoc, setDoc, doc, query, where, getDocs, updateDoc } from "@firebase/firestore";
import { auth, db } from '@/firebase';

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