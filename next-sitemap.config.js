/**
 * Creates the sitemap for each document found in a collection
 * @param {string} collectionName 
 */
async function fetchDocumentMetadata(collectionName) {
    const { initializeApp, getApps, getApp } = await import("firebase/app");
    const { collection, query, where, getDocs } = await import("firebase/firestore");
    const { getFirestore } = await import("firebase/firestore");

    const firebaseConfig = {
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
    };

    const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    const db = getFirestore(app);

    const documentSnap = await getDocs(query(collection(db, collectionName)));
    var additionalPathsArray = []

    var locationPrefix = ''
    switch(collectionName) {
        case 'solvedPapers':
            locationPrefix = '/paper?id=';
            break;
        case 'blog':
            locationPrefix = '/blog/';
            break;
    }

    documentSnap.docs.map((document) => {
        additionalPathsArray.push({
            loc: (locationPrefix + document.id),
            changefreq: 'monthly',
            priority: 0.7,
          });
    })

    return additionalPathsArray;
}

/** @type {import('next-sitemap').IConfig} */
const siteMap = {
    siteUrl: process.env.NEXT_PUBLIC_HOST || 'https://structuralpapers.com',
    generateRobotsTxt: true,
    robotsTxtOptions: {
        policies: [
            {userAgent: "*", disallow: "/api/*"},
            {userAgent: "*", allow: "/"},
        ],
    },
    exclude: ["/api/*"],
    additionalPaths: async () => {
        //Array of metadata for blog and paper pages        
        const promises = ['solvedPapers', 'blog'].map(collection => fetchDocumentMetadata(collection));
        const results = await Promise.all(promises);
        return results.flat();
    },
}

module.exports = siteMap
