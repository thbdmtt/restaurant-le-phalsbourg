export const restaurant = {
  name: "Le Phalsbourg",
  url: (
    process.env.NEXT_PUBLIC_SITE_URL || "https://www.restaurantlephalsbourg.com"
  ).replace(/\/$/, ""),
  phone: "+33 1 40 57 04 41",
  phoneHref: "tel:+33140570441",
  email: "restaurantlephalsbourg@gmail.com",
  address: {
    street: "3 rue de Phalsbourg",
    city: "Paris",
    postalCode: "75017",
    country: "FR",
  },
  geo: { latitude: 48.88145, longitude: 2.30972 },
  opening: {
    days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    services: [
      { opens: "12:00", closes: "14:30" },
      { opens: "19:00", closes: "22:30" },
    ],
  },
  capacity: 60,
  reservation: "https://bookings.zenchef.com/results?rid=374408&pid=1001",
  instagram: "https://www.instagram.com/restaurant_le_phalsbourg/",
  maps: "https://www.google.com/maps/search/?api=1&query=Le+Phalsbourg+3+rue+de+Phalsbourg+75017+Paris",
  winePdf: "/documents/carte-des-vins-le-phalsbourg.pdf",
  priceRange: "€€–€€€",
} as const;
