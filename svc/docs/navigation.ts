export const navigation: {
  title: string;
  links: {
    title: string;
    href: string;
  }[];
}[] = [
  {
    title: "Planetfall",
    links: [
      { title: "Getting started", href: "/" },
      { title: "Regions", href: "/regions" },
    ],
  },

  {
    title: "API reference",
    links: [
      { title: "API Basics", href: "/rest-api" },
      { title: "Endpoints", href: "/rest-api/endpoints" },
    ],
  },
];
