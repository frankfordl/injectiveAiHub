const isProd = process.env.NODE_ENV === "production";
const isVercel = process.env.VERCEL === "1";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    serverComponentsExternalPackages: ['pg'],
  },
  // Remove static export for Vercel deployment
  // output: "export", 
  reactStrictMode: false,
  transpilePackages: ["wallet-adapter-react", "wallet-adapter-plugin"],
  // Remove assetPrefix and basePath for Vercel deployment
  // assetPrefix: isProd ? "/aptos-wallet-adapter" : "",
  // basePath: isProd ? "/aptos-wallet-adapter" : "",
  webpack: (config) => {
    config.resolve.fallback = { "@solana/web3.js": false };
    config.externals.push('pino-pretty', 'lokijs', 'encoding');
    return config;
  },
  serverExternalPackages: [],
};

export default nextConfig;
