import type { Metadata } from "next";
import { getDictionary, href, type Locale, type Slug } from "./i18n";
import { restaurant } from "./restaurant";
export function metadata(locale: Locale, slug?: Slug): Metadata {
  const d = getDictionary(locale);
  const title = slug
    ? `${d.nav[slug]} — Le Phalsbourg · Paris 17`
    : d.seo.homeTitle;
  const description = slug ? d.pages[slug].intro : d.seo.homeDescription;
  const url = restaurant.url + href(locale, slug);
  return {
    title,
    description,
    keywords: d.seo.keywords,
    metadataBase: new URL(restaurant.url),
    alternates: {
      canonical: url,
      languages: {
        fr: restaurant.url + href("fr", slug),
        en: restaurant.url + href("en", slug),
        "x-default": restaurant.url + href("fr", slug),
      },
    },
    openGraph: {
      type: "website",
      siteName: restaurant.name,
      title,
      description,
      url,
      locale: locale === "fr" ? "fr_FR" : "en_GB",
      alternateLocale: locale === "fr" ? "en_GB" : "fr_FR",
      images: [
        {
          url: "/images/opengraph.jpg",
          width: 1200,
          height: 630,
          alt: restaurant.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/images/opengraph.jpg"],
    },
    robots:
      slug === "mentions-legales"
        ? { index: false, follow: true }
        : { index: true, follow: true },
  };
}
export function restaurantSchema(locale: Locale) {
  const d = getDictionary(locale);
  return {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    "@id": `${restaurant.url}/#restaurant`,
    name: restaurant.name,
    url: restaurant.url + href(locale),
    description: d.seo.restaurantDescription,
    image: [
      `${restaurant.url}/images/facade-monceau.webp`,
      `${restaurant.url}/images/salle-banquettes-rouges.webp`,
    ],
    telephone: restaurant.phone,
    email: restaurant.email,
    priceRange: restaurant.priceRange,
    servesCuisine: d.seo.cuisine,
    address: {
      "@type": "PostalAddress",
      streetAddress: restaurant.address.street,
      addressLocality: restaurant.address.city,
      postalCode: restaurant.address.postalCode,
      addressCountry: restaurant.address.country,
    },
    geo: { "@type": "GeoCoordinates", ...restaurant.geo },
    openingHoursSpecification: restaurant.opening.services.map((service) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: restaurant.opening.days,
      ...service,
    })),
    hasMenu: restaurant.url + href(locale, "carte"),
    acceptsReservations: restaurant.reservation,
    sameAs: [restaurant.instagram],
    currenciesAccepted: "EUR",
    potentialAction: {
      "@type": "ReserveAction",
      target: { "@type": "EntryPoint", urlTemplate: restaurant.reservation },
    },
  };
}
