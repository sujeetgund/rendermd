import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["mermaid"],
  experimental: {
    optimizePackageImports: ["mermaid", "lucide-react", "prismjs"],
  },
};

export default nextConfig;
