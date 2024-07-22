import Surveys from "./clientPage"

export const metadata = {
    title: 'Verify uploaded IStructE exam papers - Structural Papers',
    description: 'Check details of uploaded papers to verify their quality and earn points. Points can be used to view further IStructE exam papers to guide your exam preparation.',
    alternates: {
      canonical: process.env.NEXT_PUBLIC_HOST + '/surveys',
    },
    openGraph: {
      title: 'Verify uploaded IStructE exam papers - Structural Papers',
      description: 'Check details of uploaded papers to verify their quality and earn points. Points can be used to view further IStructE exam papers to guide your exam preparation.',
      url: process.env.NEXT_PUBLIC_HOST + '/surveys',
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
        <Surveys />
    )
}