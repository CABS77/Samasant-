/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: [
    '1ce9-93-22-34-241.ngrok-free.app',
    '*.ngrok-free.app',
  ],
  // Configuration pour SamaSanté
  experimental: {
    // Optimisation CSS
    optimizeCss: true,
    // Optimisation des images
    optimizePackageImports: ['lucide-react'],
  },
  
  // → Internationalisation
  i18n: {
    locales: ['fr', 'wo'],
    defaultLocale: 'fr',
  },
  // Optimisation des images
  images: {
    domains: [
      'images.unsplash.com',
      'images.pexels.com',
      'res.cloudinary.com'
    ],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 31536000, // 1 an
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  
  // Compression
  compress: true,
  
  // Headers de sécurité
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          }
        ]
      }
    ];
  },
  
  // Configuration PWA
  async rewrites() {
    return [
      {
        source: '/sw.js',
        destination: '/_next/static/sw.js'
      }
    ];
  },
  
  // Optimisation du bundle
  webpack: (config, { dev, isServer }) => {
    // Optimisations de production
    if (!dev && !isServer) {
      config.optimization.splitChunks.cacheGroups = {
        ...config.optimization.splitChunks.cacheGroups,
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          priority: 10,
        }
      };
    }
    
    // Suppression des avertissements Handlebars/Genkit
    config.ignoreWarnings = [
      {
        module: /node_modules\/handlebars\/lib\/index\.js/,
        message: /require\.extensions is not supported by webpack/,
      },
    ];
    
    // Configuration pour les modules externes (côté serveur)
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        'handlebars': 'commonjs handlebars',
      });
    }
    
    return config;
  },
  
  // Variables d'environnement publiques
  env: {
    CUSTOM_KEY: 'SamaSanté Production Build',
  },
  
  // Optimisation du output
  output: 'standalone',
  
  // Typescript strict mode
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // ESLint configuration
  eslint: {
    ignoreDuringBuilds: true,
  }
};

module.exports = nextConfig;
