import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  typescript: {
    // We want to see build errors, so we remove the ignore property.
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
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
  webpackDevMiddleware: (config) => {
    config.watchOptions = {
      poll: 1000,
      aggregateTimeout: 300,
    };
    return config;
  },
  experimental: {
    allowedDevOrigins: [
      'https://6000-firebase-studio-1769561211096.cluster-ikslh4rdsnbqsvu5nw3v4dqjj2.cloudworkstations.dev',
    ],
  },
};

export default nextConfig;
