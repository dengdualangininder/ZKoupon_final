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
      crypto: false,
    };
    
    // Handle WebAssembly files
    config.experiments = {
      asyncWebAssembly: true,
      layers: true,
    };
    
    return config;
  },
  images: {
    unoptimized: true,
    domains: ['lh3.googleusercontent.com'],
  },
  transpilePackages: ['@google/generative-ai'],
  experimental: {
    serverActions: true,
  },
};

module.exports = nextConfig; 