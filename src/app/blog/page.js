import { db } from "@/firebase/config";
import Image from "next/image";
import { collection, getDocs } from "firebase/firestore";

async function getData() {
    //Fetch paper data
    let blogs = null;

    try {
        const blogsRef = collection(db, "blog");
        const querySnapshot = await getDocs(blogsRef);

        blogs = querySnapshot.docs.map((doc) => {
            const value = doc.data();
            value.id = doc.id;
            return value
        });
    } catch (error) {
        console.error('Error fetching data:', error);
    }
    
    return blogs
  }

export const metadata = {
    title: 'Blog - Structural Papers',
    description: 'Read through our guides and tips on preparation for the IStructE exam',
    alternates: {
      canonical: process.env.NEXT_PUBLIC_HOST + '/blog',
    },
    openGraph: {
        title: 'Blog - Structural Papers',
        description: 'Read through our guides and tips on preparation for the IStructE exam.',
        url: process.env.NEXT_PUBLIC_HOST + '/blog',
        siteName: 'Structural Papers',
        images: [
          {
            url: process.env.NEXT_PUBLIC_HOST + '/opengraph-image.webp', // Must be an absolute URL
            width: 1200,
            height: 628,
            alt: 'Image describing Structural Papers',
          },
        ],
        type: 'website',
      },
}

export default async function Content() {
    const blogs = await getData();

    return (
        <div className="h-full flex-col text-center p-7 w-full">
            <h1 className="text-2xl mb-5">Our blog</h1>
            <div className="text-md md:text-lg">Read through our guides and tips on preparation for the IStructE exam</div>
            <hr className="solid"/>
            <div className="grid center gap-8">
                {blogs ? blogs.map((blogContents) => {
                    return(
                    <a key={blogContents.id} className="blogCell" href={'./blog/' + blogContents.id}>
                        <div className="w-80 h-[200px] rounded-xl overflow-hidden">
                            <Image alt={blogContents.metaTitle + " thumbnail"} src={blogContents.thumbnail ?? '/blog/no-image-thumbnail.webp'} className="object-cover blogThumbnail" width={320} height={200} />
                        </div>
                        <span className="text-xl font-light">{blogContents.heading}</span>
                        <span className="text-md">{blogContents.metaDescription}</span>
                    </a>
                )})
                :
                    (<div>Could not fetch our blogs. Please try again later.</div>)
                }
            </div>
        </div>
    )
}