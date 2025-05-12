/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.themealdb.com',
      },
      {
        protocol: 'https',
        hostname: 'github.com',
        pathname: '/GitchenDev25/**',
      },
    ],
  },
};

export default nextConfig;
