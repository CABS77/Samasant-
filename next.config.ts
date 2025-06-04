
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: false, // Réactivé pour détecter les erreurs TypeScript
  },
  eslint: {
    ignoreDuringBuilds: false, // Réactivé pour maintenir la qualité du code
  },
  images: {
    domains: ['picsum.photos', 'images.unsplash.com', 'images.pexels.com', 'via.placeholder.com'],
    formats: ['image/avif', 'image/webp'], // Formats modernes pour de meilleures performances
    minimumCacheTTL: 60 * 60 * 24 * 30, // Cache de 30 jours
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  // Optimisations de performance
  poweredByHeader: false,
  compress: true,
  reactStrictMode: true,
  // Optimisation des polyfills
  experimental: {
    optimizeCss: true,
  },
};

export default nextConfig;
