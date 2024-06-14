/** @type {import('next-sitemap').IConfig} */

module.exports = {
    siteUrl: process.env.NEXT_PUBLIC_HOST || 'https://structuralpapers.com',
    generateRobotsTxt: true,
    robotsTxtOptions: {
        policies: [
            {userAgent: "*", disallow: "/api/*"},
            {userAgent: "*", allow: "/"},
        ],
    },
    exclude: ["/api/*"],
    // additionalPaths: async () => {
    //     //Array of metadata for blog and paper pages
    //     var result = []
    
    //     const solvedPapersArray = await fetchDocumentMetadata('solvedPapers');
    //     const blogArray = await fetchDocumentMetadata('blog');
    //     result = [...result, solvedPapersArray, blogArray]
    
    //     return result
    //   },
}