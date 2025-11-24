/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Optimize images
  images: {
    formats: ['image/webp', 'image/avif'],
    domains: [],
  },
  // Enable standalone output for Docker
  output: 'standalone',
}

module.exports = nextConfig
