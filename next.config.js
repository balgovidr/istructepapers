/** @type {import('next').NextConfig} */
var webpack = require('webpack');

const nextConfig = {
    images: {
        formats: ['image/avif', 'image/webp'],
        remotePatterns: [
          {
            protocol: 'https',
            hostname: 'firebasestorage.googleapis.com',
            port: '',
            pathname: '/**',
          },
        ],
      },
      webpack: (config) => {
        config.experiments = {
            ...config.experiments,
            topLevelAwait: true,
        }
        config.resolve.fallback = {
            process: require.resolve('process/browser'),
            zlib: require.resolve('browserify-zlib'),
            stream: require.resolve('stream-browserify'),
            util: require.resolve('util'),
            buffer: require.resolve('buffer'),
            asset: require.resolve('assert'),
        }
        config.resolve.alias.canvas = false;
        config.externals.push({ sharp: 'commonjs sharp', canvas: 'commonjs canvas' })
        config.plugins.push(
            new webpack.ProvidePlugin({
              Buffer: ['buffer', 'Buffer'],
              process: 'process/browser',
            })
        )
        return config
    },
    async redirects(){
      return [
        {
          source: '/:path*',
          has: [{ type: 'host', value: 'www.structuralpapers.com' }],
          destination: 'https://structuralpapers.com/:path*',
          permanent: true
        }
    ]},
  generateRobotsTxt: true,
  robotsTxtOptions: {
    policies: [
        {userAgent: "*", disallow: "/api/*"},
        {userAgent: "*", disallow: "/auth/*"},
        {userAgent: "*", allow: "/"},
    ],
  },
  exclude: ["/api/*", "/auth/*"]
}

module.exports = nextConfig
