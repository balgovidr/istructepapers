import { doc, getDoc } from "firebase/firestore";
import { db } from '@/firebase/firebaseClient';

export async function fetchSettings(settingName) {
    const docRef = doc(db, "settings", settingName);
    const docSnap = await getDoc(docRef);
    const settings = docSnap.data();

    return settings
}