const path = require('path')

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  transpilePackages: ['troika-three-text', 'webgl-sdf-generator', 'bidi-js'],
  // Optimize images
  images: {
    formats: ['image/webp', 'image/avif'],
    domains: [],
  },
  webpack: (config) => {
    // Force ESM entrypoints so default imports work in troika-three-text
    config.resolve.alias['webgl-sdf-generator'] = path.join(
      __dirname,
      'node_modules/webgl-sdf-generator/dist/webgl-sdf-generator.mjs'
    )
    config.resolve.alias['bidi-js'] = path.join(
      __dirname,
      'node_modules/bidi-js/dist/bidi.mjs'
    )
    return config
  },
}

module.exports = nextConfig
