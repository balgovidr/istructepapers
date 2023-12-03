import nookies from 'nookies';
import { adminSDK } from './firebaseAdmin';
import { cookies } from 'next/headers'

export default async function getUser() {
  const cookieStore = cookies()
  const token = cookieStore.get('token');
  if (!token) {
    return null
  }

 try {
   const verification = await adminSDK.auth().verifyIdToken(token.value);
   if (!verification) {
     return null
   }

   // the user is authenticated!
   const { uid } = verification;
   const user = await adminSDK.auth().getUser(uid);
   return user
 } catch (error) {
   return null
 }
}