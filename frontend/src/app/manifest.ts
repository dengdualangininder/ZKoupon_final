import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Flash Pay Business",
    short_name: "Flash Pay",
    description: "Zero fee payments",
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
