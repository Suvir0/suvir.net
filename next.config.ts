import type { NextConfig } from "next";

// The site ships as a static export to GitHub Pages, so there is no server to
// set headers or optimize images at request time.
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
