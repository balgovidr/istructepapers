import ForgotPassword from "./clientPage"

export const metadata = {
    title: 'Reset Password - Structural Papers',
    description: 'Reset your password to access Structural Papers.',
    alternates: {
      canonical: process.env.NEXT_PUBLIC_HOST + '/auth/forgot-password',
    },
    openGraph: {
      title: 'Reset Password - Structural Papers',
      description: 'Reset your password to access Structural Papers.',
      url: process.env.NEXT_PUBLIC_HOST + '/auth/forgot-password',
      siteName: 'Structural Papers',
      images: [
        {
          url: process.env.NEXT_PUBLIC_HOST + '/opengraph-image.webp',
          width: 1200,
          height: 628,
          alt: 'Image describing Structural Papers',
        },
      ],
      type: 'website',
    },
}

export default function Page() {
    return (
        <ForgotPassword />
    )
}