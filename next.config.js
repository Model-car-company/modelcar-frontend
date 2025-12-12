const path = require('path')

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  transpilePackages: ['troika-three-text', 'webgl-sdf-generator', 'bidi-js'],
  // Optimize images
  images: {
    formats: ['image/webp', 'image/avif'],
    domains: ['mwyzvpadlfroamzjxlex.supabase.co'],
  },

  // PostHog reverse proxy - bypasses ad blockers by routing through your domain
  async rewrites() {
    return [
      {
        source: '/ingest/static/:path*',
        destination: 'https://us-assets.i.posthog.com/static/:path*',
      },
      {
        source: '/ingest/:path*',
        destination: 'https://us.i.posthog.com/:path*',
      },
      {
        source: '/ingest/decide',
        destination: 'https://us.i.posthog.com/decide',
      },
    ]
  },

  // Skip PostHog rewrites from middleware
  skipTrailingSlashRedirect: true,

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
