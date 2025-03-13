/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: true,
  },
  output: 'standalone',
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    serverActions: true,
  },
  async rewrites() {
    const apiUrl = process.env.NODE_ENV === 'production'
      ? process.env.API_URL || 'https://your-backend-api.com'
      : 'http://localhost:8080';

    return [
      {
        source: '/api/:path*',
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
        destination: `${apiUrl}/api/:path*`,
      },
    ];
  },
  // Add image domains if you're using next/image
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
  },
=======
        destination: 'http://localhost:8080/api/:path*'
      }
    ];
=======
        destination: 'http://localhost:8080/api/:path*'
      }
    ];
>>>>>>> parent of 975cf1a (deploy fixed)
=======
        destination: 'http://localhost:8080/api/:path*'
      }
    ];
>>>>>>> parent of 975cf1a (deploy fixed)
  }
>>>>>>> parent of 975cf1a (deploy fixed)
};

module.exports = nextConfig 