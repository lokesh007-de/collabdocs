const API_PROXY_TARGET = process.env.API_PROXY_TARGET || "http://localhost:4000";

/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      { source: "/api/:path*", destination: `${API_PROXY_TARGET}/api/:path*` },
    ];
  },
};

export default nextConfig;