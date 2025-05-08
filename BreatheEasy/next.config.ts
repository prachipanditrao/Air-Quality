import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
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
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Optional: If you plan to use Google Maps Cloud-based map styling
  // publicRuntimeConfig: {
  //   googleMapsMapId: process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID,
  // },
};

export default nextConfig;
