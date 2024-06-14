import { initializeFirestore } from "@/firebase/firebaseAdmin";

const db = initializeFirestore();

/**
 * Creates the sitemap for each document found in a collection
 * @param {string} collectionName 
 */
export default async function fetchDocumentMetadata(collectionName) {
    const documentSnap = await db.collection(collectionName).get();
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