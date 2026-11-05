import type { NextConfig } from "next";
const legacy: Record<string, string> = {
  menus: "carte",
  "carte-des-vins": "vins",
  "about-1": "la-maison",
  "projects-8": "presse",
  "contact-10": "recrutement",
  privatisation: "privatisation",
  contact: "contact",
  accueil: "",
};
const config: NextConfig = {
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [320, 480, 640, 768, 1024, 1280, 1600, 1920, 2560],
    qualities: [75, 85],
  },
  async redirects() {
    return [
      { source: "/en/presse", destination: "/en/press", permanent: true },
      { source: "/en/recrutement", destination: "/en/careers", permanent: true },
      { source: "/", destination: "/fr", permanent: true },
      ...Object.entries(legacy).flatMap(([from, to]) => [
        { source: `/${from}`, destination: `/fr/${to}`, permanent: true },
        ...(from !== to
          ? [
              {
                source: `/en/${from}`,
                destination: `/en/${to === "presse" ? "press" : to === "recrutement" ? "careers" : to}`,
                permanent: true,
              },
            ]
          : []),
      ]),
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};
export default config;
