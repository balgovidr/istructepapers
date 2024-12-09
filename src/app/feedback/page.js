import Feedback from "./clientPage"

export const metadata = {
    title: 'Feedback form - Structural Papers',
    description: "Send your thoughts on our site, tell us how we can help you with your IStructE exam preparation better. Let us know what resources you really want, or don't want.",
    alternates: {
      canonical: process.env.NEXT_PUBLIC_HOST + '/feedback',
    },
    openGraph: {
      title: 'Feedback form - Structural Papers',
      description: "Send your thoughts on our site, tell us how we can help you with your IStructE exam preparation better. Let us know what resources you really want, or don't want.",
      url: process.env.NEXT_PUBLIC_HOST + '/feedback',
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
        <Feedback />
    )
}