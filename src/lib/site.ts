export const SITE = {
  name: "TruckTracker",
  tagline: "Gestão de frotas",
  repository: "https://github.com/cybermaique/trucktracker",
  author: {
    name: "Maique Moraes",
    github: "https://github.com/cybermaique",
    linkedin: "https://www.linkedin.com/in/maique-moraes",
  },
} as const;

export const ROUTES = {
  overview: "/",
  trucks: "/caminhoes",
  newTruck: "/caminhoes/novo",
} as const;
