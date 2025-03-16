import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Nulla Pay",
    theme_color: "#000000",
    short_name: "Nulla",
    description: "Crypto payments with 0% fees",
    start_url: "/app",
    display: "standalone",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
