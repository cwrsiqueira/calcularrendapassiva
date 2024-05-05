/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "play.google.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "static-media.hotmart.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

module.exports = nextConfig;
