/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
      { protocol: "https", hostname: "assets.coingecko.com" },
      { protocol: "https", hostname: "coin-images.coingecko.com" },
    ],
  },
  // Bundle Growth's legal markdown into serverless functions.
  webpack(config) {
    config.module.rules.push({
      test: /\.md$/,
      type: "asset/source",
    });
    return config;
  },
  async redirects() {
    return [
      // Production apex → www (host match; does not affect preview deployments).
      {
        source: "/:path*",
        has: [{ type: "host", value: "theforexrepublic.com" }],
        destination: "https://www.theforexrepublic.com/:path*",
        permanent: true,
      },
      // Policy alias paths → canonical routes
      { source: "/privacy-policy", destination: "/privacy", permanent: true },
      { source: "/terms-of-use", destination: "/terms", permanent: true },
      { source: "/terms-of-service", destination: "/terms", permanent: true },
      { source: "/cookie-policy", destination: "/cookies", permanent: true },
      { source: "/legal/disclaimer", destination: "/disclaimer", permanent: true },
      { source: "/admin/articles", destination: "/dashboard/desk", permanent: true },
      { source: "/admin/articles/review", destination: "/dashboard/review", permanent: true },
      { source: "/admin/articles/ai", destination: "/dashboard/compose", permanent: true },
      { source: "/admin/articles/new", destination: "/dashboard/articles/new", permanent: true },
      {
        source: "/admin/articles/:id/edit",
        destination: "/dashboard/articles/:id/edit",
        permanent: true,
      },
      {
        source: "/admin/articles/:id/preview",
        destination: "/dashboard/articles/:id/preview",
        permanent: true,
      },
      // Readers admin surface removed — organic signups only
      { source: "/admin/users", destination: "/admin", permanent: true },
    ];
  },
  async rewrites() {
    return [
      { source: "/favicon.ico", destination: "/icon.png" },
      { source: "/apple-touch-icon.png", destination: "/apple-icon" },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*\\.(?:woff2?|ttf|otf|eot))",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },
};

export default nextConfig;
