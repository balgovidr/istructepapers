import { db } from "@/firebase/config";
import { FieldValue } from 'firebase-admin/firestore';
import Image from "next/image";
import { doc, getDoc, increment, updateDoc } from "firebase/firestore";

async function fetchPost(slug) {
    let content = null
  
    //Fetch paper data
    try {
      const docRef = doc(db, "blog", slug);
      const docSnap = await getDoc(docRef);
  
      if (docSnap.exists) {
          content = docSnap.data();
      } else {
        // docSnap.data() will be undefined in this case
      }
    } catch (error) {
    }
  
    return content
  }

export async function generateMetadata({ params, searchParams }, parent) {
  const post = await fetchPost(params.slug)

  return {
    title: (post.metaTitle + ' - Structural Papers'),
    description: post.metaDescription,
    authors: [{ name: 'Bal Ranjith' }],
    creator: 'Bal Ranjith',
    alternates: {
      canonical: process.env.NEXT_PUBLIC_HOST + '/blog/' + params.slug,
    },
    openGraph: {
      title: (post.metaTitle + ' - Structural Papers'),
      description: post.metaDescription,
      url: process.env.NEXT_PUBLIC_HOST + '/blog/' + params.slug,
      siteName: 'Structural Papers',
      images: [
        {
          url: post.thumbnail, // Must be an absolute URL
          width: 320,
          height: 200,
        },
        {
          url: post.image, // Must be an absolute URL
          width: 2400,
          height: 1600,
          alt: 'Image of the blog',
        },
      ],
      type: 'article',
    },
  }
}

export default async function Page({params}) {
  const post = await fetchPost(params.slug)

  //Increase blog view count
  const blogRef = doc(db, 'blog', params.slug);

  await updateDoc(blogRef, {
    views: increment(1)
  });

    return (
      <div className="justify-center flex flex-col w-full items-center">
        <div className="w-full max-h-[50vh] overflow-hidden">
          <Image alt={post.metaTitle + " background image"} src={post.image ?? '/blog/no-image-full.webp'} width={0} height={0} sizes="100vw" style={{ width: '100%', height: 'auto' }} />
        </div>
        <div className="flex flex-col max-w-screen-lg md:top-[calc(50vh-50px)] md:absolute md:bg-white p-7">
            <h1 className="text-3xl my-5">{post.heading}</h1>
            <hr className="my-5"/>
            <div dangerouslySetInnerHTML={{ __html: post.content }} />
        </div>
      </div>
    )
}