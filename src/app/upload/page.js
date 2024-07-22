import UploadPaper from "./clientPage"

export const metadata = {
    title: 'Upload solved IStructE exam papers - Structural Papers',
    description: 'Upload your solved and scanned IStructE exam papers to gain points and access a repository of other papers to guide your exam preparation.',
    alternates: {
      canonical: process.env.NEXT_PUBLIC_HOST + '/uploads',
    },
    openGraph: {
      title: 'Upload solved IStructE exam papers - Structural Papers',
      description: 'Upload your solved and scanned IStructE exam papers to gain points and access a repository of other papers to guide your exam preparation.',
      url: process.env.NEXT_PUBLIC_HOST + '/uploads',
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
        <UploadPaper />
    )
}