/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  // Optimize images
  images: {
    formats: ['image/webp', 'image/avif'],
    domains: [],
  },
}

module.exports = nextConfig
