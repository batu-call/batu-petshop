/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      "images.pexels.com",
      "res.cloudinary.com",
      "example.com",
    ],
  },

  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://batu-petshop.onrender.com/api/:path*",
      },
    ];
  },
};

export default nextConfig;