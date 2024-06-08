import { CircularProgress } from "@mui/material";
import Image from "next/image";

export function RenderProfilePicture(userData) {
  if (userData) {
      if (userData.photoUrl) {
          return <Image src={userData.photoUrl} alt="Profile" />
      } else {
          const firstNameInitial = data.firstName.charAt(0).toUpperCase();
          const lastNameInitial = data.lastName.charAt(0).toUpperCase();
          const initials = firstNameInitial + lastNameInitial;

          return <div className="initials-icon">{initials}</div>;
      }
  } else {
      return <CircularProgress />
  }
}