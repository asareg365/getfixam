import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  output: "standalone",
  allowedDevOrigins: ["https://6000-firebase-studio-1769561211096.cluster-ikslh4rdsnbqsvu5nw3v4dqjj2.cloudworkstations.dev"],
  experimental: {
  },
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
