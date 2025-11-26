/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Optimize images
  images: {
    formats: ['image/webp', 'image/avif'],
    domains: [],
  },
  distDir: '.next',
  outputFileTracing: false,
}

module.exports = nextConfig
