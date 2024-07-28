import { db } from "@/firebase/config";
import { collection, query, where, getDocs } from "firebase/firestore";

/**
 * Creates the sitemap for each document found in a collection
 * @param {string} collectionName 
 */
export default async function fetchDocumentMetadata(collectionName) {
    const documentSnap = await getDocs(query(collection(db, collectionName)));
    const documentData = documentSnap.data();
    var additionalPathsArray = []

    var locationPrefix = ''
    switch(collectionName) {
        case 'solvedPapers':
            locationPrefix = '/paper?id='
        case 'blog':
            locationPrefix = '/blog/'
    }

    documentData.map((document, documentId) => {
        additionalPathsArray.push({
            loc: (locationPrefix + documentId),
            changefreq: 'monthly',
            priority: 0.7,
            lastmod: new Date().toISOString(),
          });
    })

    return additionalPathsArray;
}