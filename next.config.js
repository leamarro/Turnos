/** @type {import('next').NextConfig} */
const nextConfig = {
  // sin reactCompiler
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
        ],
      },
    ];
  },
}

module.exports = nextConfig
