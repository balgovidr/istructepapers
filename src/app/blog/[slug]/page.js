import { InitializeFirestore } from "@/firebase/firebaseAdmin";
import { FieldValue } from 'firebase-admin/firestore';

const db = InitializeFirestore()

async function fetchPost(slug) {
    let content = null
  
    //Fetch paper data
    try {
      const docRef = db.collection("blog").doc(slug);
      const docSnap = await docRef.get();
  
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
  }
}

export default async function Page({params}) {
  const post = await fetchPost(params.slug)

  //Increase blog view count
  const blogRef = db.collection('blog').doc(params.slug);

  await blogRef.update({
    views: FieldValue.increment(1)
  });

    return (
        <div className="flex flex-col">
            <h1 className="text-3xl my-5">{post.heading}</h1>
            <hr className="my-5"/>
            <div dangerouslySetInnerHTML={{ __html: post.content }} />
        </div>
    )
}