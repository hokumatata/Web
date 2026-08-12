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
  async redirects() {
    return [
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
