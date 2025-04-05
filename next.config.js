/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  webpack: (config) => {
    // Handle fallbacks
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    
    // Handle WebAssembly files
    config.experiments = {
      asyncWebAssembly: true,
      layers: true,
    };

    // Add path aliases
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': require('path').resolve(__dirname, 'src'),
    };
    
    return config;
  },
  images: {
    unoptimized: true
  },
  // Add path aliases for Next.js
  basePath: '',
  assetPrefix: '',
  // Enable path aliases
  experimental: {
    appDir: true,
  }
};

module.exports = nextConfig; 