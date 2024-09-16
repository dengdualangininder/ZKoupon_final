import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Flash Payments",
    short_name: "Flash",
    description: "fast global payments with zero fees",
    start_url: "/app",
    display: "standalone",
    icons: [
      {
        src: "/logoBlackBgNoText.png",
        type: "image/png",
        sizes: "any",
      },
      {
        src: "/logoBlackBgNoText.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
