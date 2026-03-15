import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "script-src 'self' 'unsafe-eval' 'unsafe-inline' 'wasm-unsafe-eval' https://unpkg.com https://lottiefiles.com blob: data:; worker-src 'self' blob: data:; child-src 'self' blob: data:; connect-src 'self' https://unpkg.com https://lottiefiles.com blob: data: https://cdn.lottiefiles.com"
          }
        ]
      }
    ];
  }
};

export default nextConfig;
