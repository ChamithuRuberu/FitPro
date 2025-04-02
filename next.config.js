/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    serverActions: {
      allowedOrigins: ["https://fiitproo.netlify.app/", "localhost:4100", "*"],
    },
  },
  async rewrites() {
    if (process.env.NODE_ENV === 'development') {
      return [
        {
          source: '/api/:path*',
          // destination: 'http://localhost:8080/api/:path*'
          destination: '172.20.10.8:8080/api/:path*'
        }
      ];
    }
    return [];
  }
};

module.exports = nextConfig; 