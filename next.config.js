/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: true,
  },
  output: 'standalone',
  reactStrictMode: true,
  swcMinify: true,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: process.env.NODE_ENV === 'production' 
          ? process.env.API_URL + '/api/:path*' 
          : 'http://localhost:8080/api/:path*'
      }
    ];
  },
  // Add image domains if you're using next/image
  images: {
    domains: ['localhost', 'your-production-domain.com'],
  },
  // Disable server-side rendering for static deployment
  experimental: {
    appDir: true,
  }
};

module.exports = nextConfig 