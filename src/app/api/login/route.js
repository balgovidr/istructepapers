import { initializeFirebase } from "@/firebase/firebaseAdmin";
import { auth } from "firebase-admin";
import { cookies, headers } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  initializeFirebase()
  const authorization = headers().get("Authorization");
  if (authorization?.startsWith("Bearer ")) {
    const idToken = authorization.split("Bearer ")[1];
    const decodedToken = await auth().verifyIdToken(idToken);

    if (decodedToken) {
      //Generate session cookie
      const expiresIn = 60 * 60 * 24 * 5 * 1000;
      const sessionCookie = await auth().createSessionCookie(idToken, {
        expiresIn,
      });
      const options = {
        name: "session",
        value: sessionCookie,
        maxAge: expiresIn,
        httpOnly: true,
        secure: true,
      };

      //Add the cookie to the browser
      cookies().set(options);
    }
  }

  return NextResponse.json({}, { status: 200 });
}

export async function GET(request) {
  initializeFirebase()
  const session = cookies().get("session")?.value;

  //Validate if the cookie exist in the request
  if (session === "undefined" || session === null || session == "") {
      return NextResponse.json({ isLogged: false}, {status: 401 });
  } else {
    //Use Firebase Admin to validate the session cookie
    try {
      const decodedClaims = await auth().verifySessionCookie(session, true);
  
      if (!decodedClaims) {
          return NextResponse.json({ isLogged: false }, { status: 401 });
      }

      return NextResponse.json({ isLogged: true, user: decodedClaims, status: 200 });
    } catch (error) {
      if (error.code == "auth/session-cookie-expired") {
        return NextResponse.redirect(new URL('/auth/login', request.url))
      }
      return NextResponse.json({ isLogged: false, error: error.code, status: 401 });
    }
  }
}