
let activeEnv =
  process.env.GATSBY_ACTIVE_ENV || process.env.NODE_ENV || "development"

console.log(`Using environment config: '${activeEnv}'`)

require("dotenv").config({
  path: `.env.${activeEnv}`,
})

const firestoreConfig = require(`./config/firebase-config.${process.env.GATSBY_FIREBASE_ENVIRONMENT}.json`)

module.exports = {
  siteMetadata: {
    title: `RISE Cities`,
    description: 'RISE Cities',
    url: 'https://risecities.org'
  },
  pathPrefix: `/`,
  plugins: [
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: "RISE Cities",
        short_name: "RISE Cities",
        start_url: "/",
        background_color: "#000",
        theme_color: "#FCB239", // yellow
        display: "minimal-ui",
        icon: "static/icon.png" // This path is relative to the root of the site.
      },
    },
    `gatsby-plugin-react-helmet`,
    {
      resolve: "gatsby-source-firestore",
      options: {
        credential: firestoreConfig.serviceAccountKey,
        types: [
          {
            type: "Pages",
            collection: "pages",
          },
        ]
      }
    },
    {
      resolve: `gatsby-plugin-sass`,
      options: {
        precision: 8,
      },
    },
    {
      resolve: `gatsby-plugin-s3`,
      options: {
        bucketName: "rise-cities",
        protocol: "https",
        hostname: process.env.GATSBY_HOSTNAME,
      },
    },
  ]
};
