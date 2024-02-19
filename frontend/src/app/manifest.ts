import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Ling Pay",
    short_name: "Ling Pay",
    description: "Zero fee payments",
    start_url: "/",
    display: "standalone",
    icons: [
      {
        src: "/logoicon.png",
        sizes: "any",
        type: "image/png",
      },
      {
        src: "/logoicon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
