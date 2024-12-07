'use client'

import React, {useState, useEffect} from "react";
import { query, orderBy, limit, getDocs, collection } from "firebase/firestore";
import { db } from '@/firebase/config';


export default function GenerateHomepageBlogs() {
    const [BlogDivs, setBlogDivs] = useState([]);

    useEffect(() => {
        const generateBlogDiv = (data) => {
          return (
            <a key={data.id} className='flex flex-col rounded-md border border-gray-100 shadow-md bg-white w-full p-3 gap-2' href={"/blog/" + data.id}>
              <h3 className='flex flex-row justify-between items-center'>
                {data.heading}
              </h3>
              <hr className='border-gray-300'/>
              <p className='text-sm'>
                {data.metaDescription}
              </p>
            </a>
          )
        }
    
        const renderBlogs = async () => {
          var temporaryDivs = []
          const BlogRef = collection(db, "blog");
          const q = query(BlogRef, orderBy("views", "desc"), limit(3));
          const querySnapshot = await getDocs(q);
          querySnapshot.forEach((doc) => {
              // doc.data() is never undefined for query doc snapshots
              const data = doc.data();
              data.id = doc.id
      
              const BlogComponent = generateBlogDiv(data);
              temporaryDivs.push(BlogComponent);
          });
          setBlogDivs(temporaryDivs)
        }
    
        renderBlogs();
      }, [])

    return (
        <div className="md:w-1/2 w-full h-1/2 md:h-full flex flex-col justify-evenly px-8 gap-5 items-center">
            {BlogDivs}
        </div>
    )
}