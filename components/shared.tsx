import { preload } from "react-dom";
import manifest from "@/data/media-manifest.json";
import {
  getDictionary,
  href,
  interpolate,
  type Locale,
  type Slug,
} from "@/lib/i18n";
import { restaurant } from "@/lib/restaurant";
export function Photo({
  name,
  locale,
  className = "",
  priority = false,
  sizes = "(max-width: 700px) 100vw, 50vw",
}: {
  name: string;
  locale: Locale;
  className?: string;
  priority?: boolean;
  sizes?: string;
}) {
  const image = manifest.find((m) => m.file === `${name}.webp`)!;
  const d = getDictionary(locale);
  if (name === "facade-monceau") {
    const srcset = (format: string) =>
      [480, 768, 1280, 1620]
        .map((w) => `/images/hero/facade-${w}.${format} ${w}w`)
        .join(", ");
    if (priority)
      preload("/images/hero/facade-768.avif", {
        as: "image",
        type: "image/avif",
        imageSrcSet: srcset("avif"),
        imageSizes: sizes,
        fetchPriority: "high",
      });
    return (
      <picture className={`photo ${className}`}>
        <source type="image/avif" srcSet={srcset("avif")} sizes={sizes} />
        <img
          className="photo"
          src="/images/hero/facade-768.webp"
          srcSet={srcset("webp")}
          sizes={sizes}
          width={image.width}
          height={image.height}
          alt={d.images[name]}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : undefined}
          decoding="async"
        />
      </picture>
    );
  }
  const widths = [
    ...new Set(
      [320, 640, 960, 1440, 1920]
        .filter((w) => w < image.width)
        .concat(Math.min(image.width, 1920)),
    ),
  ];
  const srcset = (format: string) =>
    widths
      .map((w) => `/images/responsive/${name}-${w}.${format} ${w}w`)
      .join(", ");
  return (
    <picture className={`photo ${className}`}>
      <source type="image/avif" srcSet={srcset("avif")} sizes={sizes} />
      <img
        className="photo"
        src={`/images/responsive/${name}-${widths[0]}.webp`}
        srcSet={srcset("webp")}
        sizes={sizes}
        width={image.width}
        height={image.height}
        alt={d.images[name as keyof typeof d.images] || ""}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : undefined}
        decoding="async"
      />
    </picture>
  );
}

export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
export function ArrowLink({
  children,
  href: target,
  light = false,
}: {
  children: React.ReactNode;
  href: string;
  light?: boolean;
}) {
  return (
    <a className={`text-link${light ? " light" : ""}`} href={target}>
      {children}
      <span aria-hidden="true">↗</span>
    </a>
  );
}
export function OpeningHours({ locale }: { locale: Locale }) {
  const d = getDictionary(locale);
  const days = restaurant.opening.days;
  const names = d.ui.dayNames;
  return (
    <div className="opening">
      <p>
        {interpolate(d.ui.dayRange, {
          first: names[days[0]],
          last: names[days[days.length - 1]],
        })}
      </p>
      {restaurant.opening.services.map((s, i) => (
        <p className="service" key={s.opens}>
          <span>{i === 0 ? d.ui.serviceLunch : d.ui.serviceDinner}</span>
          <span>
            {locale === "fr" ? s.opens.replace(":", " h ") : s.opens} –{" "}
            {locale === "fr" ? s.closes.replace(":", " h ") : s.closes}
          </span>
        </p>
      ))}
    </div>
  );
}
export function Footer({ locale }: { locale: Locale }) {
  const d = getDictionary(locale);
  return (
    <>
      <footer className="site-footer">
        <div className="footer-main">
          <div>
            <a href={href(locale)} className="footer-wordmark">
              Le Phalsbourg<span>Paris · Monceau</span>
            </a>
            <p>{d.seo.restaurantDescription}</p>
            <ArrowLink href={restaurant.instagram}>Instagram</ArrowLink>
          </div>
          <div>
            <h2 className="eyebrow">{d.ui.address}</h2>
            <address>
              {restaurant.address.street}
              <br />
              {restaurant.address.postalCode} {restaurant.address.city}
              <br />
              <a href={restaurant.phoneHref}>{restaurant.phone}</a>
            </address>
            <a className="email-link" href={`mailto:${restaurant.email}`}>
              {restaurant.email}
            </a>
          </div>
          <div>
            <h2 className="eyebrow">{d.ui.hours}</h2>
            <OpeningHours locale={locale} />
          </div>
          <nav aria-label={d.ui.footerNav}>
            {(
              [
                "la-maison",
                "privatisation",
                "presse",
                "recrutement",
                "contact",
              ] as const
            ).map((s) => (
              <a key={s} href={href(locale, s)}>
                {d.nav[s]}
              </a>
            ))}
          </nav>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Le Phalsbourg</span>
          <div>
            {(["mentions-legales", "confidentialite"] as const).map((s) => (
              <a key={s} href={href(locale, s)}>
                {d.nav[s]}
              </a>
            ))}
          </div>
          <span>{d.ui.sinceLabel}</span>
        </div>
      </footer>
      <nav className="mobile-action-bar" aria-label={d.ui.mobileActions}>
        <a className="reserve" href={restaurant.reservation}>
          <span aria-hidden="true">↗</span>
          {d.ui.reserveShort}
        </a>
        <a href={href(locale, "carte")}>
          <span aria-hidden="true">≡</span>
          {d.ui.menu}
        </a>
        <a href={restaurant.phoneHref}>
          <span aria-hidden="true">↗</span>
          {d.ui.call}
        </a>
      </nav>
    </>
  );
}
export function PageIntro({ locale, slug }: { locale: Locale; slug: Slug }) {
  const d = getDictionary(locale);
  const p = d.pages[slug];
  const italic = p.titleItalic;
  const at = p.title.indexOf(italic);
  return (
    <section className={`page-intro container page-intro-${slug}`}>
      <p className="eyebrow">
        {p.eyebrow}
        <span className="intro-edition">Le Phalsbourg · Paris XVII</span>
      </p>
      <div className="intro-layout">
        <h1>
          {at >= 0 ? (
            <>
              {p.title.slice(0, at)}
              <em>{italic}</em>
              {p.title.slice(at + italic.length)}
            </>
          ) : (
            p.title
          )}
        </h1>
        <p className="intro-copy">{p.intro}</p>
      </div>
    </section>
  );
}

export function Visit({ locale }: { locale: Locale }) {
  const d = getDictionary(locale);
  return (
    <section className="visit-section container">
      <div>
        <p className="eyebrow">{d.edition.serviceLabel}</p>
        <h2>
          {d.edition.visitTitle}
          <br />
          <em>{d.edition.visitItalic}</em>
        </h2>
        <p>{d.home.visitText}</p>
        <a className="button" href={restaurant.reservation}>
          {d.ui.reserve}
          <span aria-hidden="true">↗</span>
        </a>
      </div>
      <div className="visit-details">
        <div>
          <h3 className="eyebrow">{d.ui.hours}</h3>
          <OpeningHours locale={locale} />
        </div>
        <div>
          <h3 className="eyebrow">{d.ui.address}</h3>
          <p>
            {restaurant.address.street}
            <br />
            {restaurant.address.postalCode} {restaurant.address.city}
          </p>
          <ArrowLink href={restaurant.maps}>{d.ui.directions}</ArrowLink>
        </div>
      </div>
    </section>
  );
}
