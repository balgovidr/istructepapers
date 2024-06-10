'use client'

import { CircularProgress } from "@mui/material";
import Image from "next/image";

export function RenderProfilePicture({userData}) {
    console.log(userData)
  if (userData) {
      if (userData.photoUrl) {
          return <Image src={userData.photoUrl} alt="Profile" />
      } else {
          const firstNameInitial = userData.firstName.charAt(0).toUpperCase();
          const lastNameInitial = userData.lastName.charAt(0).toUpperCase();
          const initials = firstNameInitial + lastNameInitial;

          return <div className="initials-icon">{initials}</div>;
      }
  } else {
      return <CircularProgress />
  }
}