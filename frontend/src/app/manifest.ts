import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Flash Pay Business",
    short_name: "Flash Pay",
    description: "Zero fee payments",
    start_url: "/",
    display: "standalone",
    icons: [
      {
        src: "/logonotextPNG.png",
        sizes: "any",
        type: "image/png",
      },
      {
        src: "/logonotext.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
