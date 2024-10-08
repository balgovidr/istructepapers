import Image from "next/image";

export default function RenderProfilePicture(photoUrl, firstName, lastName) {
    if (photoUrl) {
      return <Image src={photoUrl} alt="Profile" />;
    } else {
      const firstNameInitial = firstName.charAt(0).toUpperCase();
      const lastNameInitial = lastName.charAt(0).toUpperCase();
      return <div className="initials-icon">{firstNameInitial + lastNameInitial}</div>;
    }
  };