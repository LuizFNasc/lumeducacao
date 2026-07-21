import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      // Landing estática "Volta às Aulas" (public/volta-as-aulas) com URL limpa
      {
        source: "/volta-as-aulas",
        destination: "/volta-as-aulas/index.html",
      },
    ];
  },
};

export default nextConfig;
