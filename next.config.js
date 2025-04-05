/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  webpack: (config) => {
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
    
    return config;
  },
  images: {
    unoptimized: true
  },
  // Add path aliases
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': require('path').resolve(__dirname, 'src'),
    };
    return config;
  }
};

module.exports = nextConfig; 