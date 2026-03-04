import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // node:sqlite is a built-in Node module — automatically excluded from
  // browser bundles by Next.js / Turbopack. No extra config needed.
  turbopack: {},
};

export default nextConfig;
