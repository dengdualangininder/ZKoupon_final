/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      crypto: false,
    };
    return config;
  },
  images: {
    domains: ['lh3.googleusercontent.com'],
  },
  transpilePackages: ['@google/generative-ai'],
};

module.exports = nextConfig; 