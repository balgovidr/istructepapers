import Login from "./clientPage"

export const metadata = {
    title: 'Login - Structural Papers',
    description: 'Log in and access a repository of solved IStructE exam papers to guide your exam preparation.',
    alternates: {
      canonical: process.env.NEXT_PUBLIC_HOST + '/auth/login',
    },
    openGraph: {
      title: 'Login - Structural Papers',
      description: 'Log in and access a repository of solved IStructE exam papers to guide your exam preparation.',
      url: process.env.NEXT_PUBLIC_HOST + '/auth/login',
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
        <Login />
    )
}