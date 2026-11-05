import { Icon } from "./icon";
import {
  getDictionary,
  href,
  interpolate,
  price,
  type Locale,
} from "@/lib/i18n";
import { restaurant } from "@/lib/restaurant";
import { getMenu } from "@/lib/menu-sheet";
import { Atmosphere, PressFeature, CareersFeature } from "./editorial-sequences";
import { Photo, ArrowLink, Visit } from "./shared";
export async function Home({ locale }: { locale: Locale }) {
  const d = getDictionary(locale),
    h = d.home,
    e = d.edition;
  const menu = await getMenu();
  const sample = ["entrees", "plats", "desserts"]
    .map((category) => menu.find((i) => i.category_slug === category))
    .filter((i) => !!i);
  return (
    <>
      <section className="hero container">
        <div className="hero-copy">
          <p className="eyebrow">{h.eyebrow}</p>
          <h1>
            {h.title}
            <br />
            <em>{h.titleItalic}</em>
          </h1>
          <p className="hero-intro">{h.intro}</p>
          <div className="hero-ctas">
            <a className="button" href={restaurant.reservation}>
              {d.ui.reserve}
              <Icon name="ArrowUpRight" />
            </a>
            <ArrowLink href={href(locale, "carte")}>{h.foodLink}</ArrowLink>
          </div>
          <p className="hero-location">{e.neighbourhood}</p>
        </div>
        <figure className="hero-picture">
          <div className="hero-image-frame">
          <Photo
            name="facade-monceau"
            locale={locale}
            priority
            sizes="(max-width: 760px) calc(100vw - 40px), 55vw"
          />

          <span className="hero-stamp" aria-hidden="true">
            <span>{e.stampTitle}</span>
            <em>{e.stampItalic}</em>
            <i>PARIS XVII</i>
          </span>
          </div>
          <figcaption>
            <span>01 / Le Phalsbourg</span>
            <span>{e.photoFacade}</span>
          </figcaption>
        </figure>
        <div className="hero-practical">
          <span className="service-dot" aria-hidden="true" />
          <span>
            {interpolate(d.ui.dayRange, {
              first: d.ui.dayNames[restaurant.opening.days[0]],
              last: d.ui.dayNames[
                restaurant.opening.days[restaurant.opening.days.length - 1]
              ],
            })}
          </span>
          <span>
            {restaurant.opening.services
              .map((s) => `${s.opens}–${s.closes}`)
              .join(" & ")}
          </span>
          <a href={href(locale, "contact")}>
            {e.address} <Icon name="ArrowUpRight" />
          </a>
        </div>
      </section>
      <section className="season-section container" data-reveal>
        <div className="section-heading">
          <p className="eyebrow">{e.table}</p>
          <h2>
            {e.tableTitle}
            <br />
            <em>{e.tableItalic}</em>
          </h2>
          <p>{h.foodText}</p>
        </div>
        <div className="season-layout">
          <div className="culinary-mosaic">
            {(["cuisine-dressage", "assiette-saison", "feuillete-service"] as const).map((name) => (
              <figure key={name}>
                <Photo name={name} locale={locale} sizes="(max-width:760px) 90vw, 30vw" />
                <figcaption>{d.enrichment.captions[name]}</figcaption>
              </figure>
            ))}
          </div>
          <div className="season-menu">
            <p className="eyebrow">{e.menuNote}</p>
            {sample.map((item, i) => (
              <article className="preview-dish" key={item.id}>
                <span className="dish-number">0{i + 1}</span>
                <div>
                  <p className="eyebrow">{item[`category_${locale}`]}</p>
                  <h3>{item[`title_${locale}`]}</h3>
                  <p>{item[`description_${locale}`]}</p>
                </div>
                <span className="item-price">{price(item.price, locale)}</span>
              </article>
            ))}
            <ArrowLink href={href(locale, "carte")}>{h.foodLink}</ArrowLink>
            <p className="small-copy">{d.pages.carte.note}</p>
          </div>
        </div>
      </section>
      <section className="cellar-section">
        <div className="container cellar-layout">
          <div className="cellar-copy" data-reveal>
            <p className="eyebrow">{e.cellar}</p>
            <h2>
              {e.cellarTitle}
              <br />
              <em>{e.cellarItalic}</em>
            </h2>
            <p>{h.wineText}</p>
            <ArrowLink href={href(locale, "vins")} light>
              {h.wineLink}
            </ArrowLink>
            <div className="cellar-number">
              <strong>
                350<span>+</span>
              </strong>
              <span>{d.ui.wineCount}</span>
            </div>
          </div>
          <div className="cellar-triptych">
            {[
              ["vin-dagueneau", "Didier Dagueneau · Blanc Etc…"],
              ["vin-jobard", "Claudie Jobard · Montagny"],
              ["vin-montcalmes", "Montcalmès · Terrasses du Larzac"],
            ].map(([name, caption]) => (
              <figure key={name}>
                <Photo name={name} locale={locale} sizes="(max-width:760px) 44vw, 22vw" />
                <figcaption>{caption}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>
      <section className="house-feature container" data-reveal>
        <div className="house-heading">
          <p className="eyebrow">{e.house}</p>
          <h2>
            {e.houseTitle}
            <br />
            <em>{e.houseItalic}</em>
          </h2>
          <p>{e.houseText}</p>
          <ArrowLink href={href(locale, "la-maison")}>
            {d.ui.discover}
          </ArrowLink>
        </div>
        <div className="house-portraits">
          {d.pages["la-maison"].team.map((person) => (
            <figure key={person.image}>
              <Photo name={person.image} locale={locale} sizes="(max-width:760px) 42vw, 23vw" />
              <figcaption>{person.name}<span>{person.role}</span></figcaption>
            </figure>
          ))}
          <figure className="house-panorama">
            <Photo name="salle-banquettes-rouges" locale={locale} sizes="(max-width:760px) 90vw, 64vw" />
            <figcaption>{e.photoHouse}</figcaption>
          </figure>
        </div>
      </section>
      <Atmosphere locale={locale} />
      <PressFeature locale={locale} />
      <section className="private-feature container" data-reveal>
        <figure>
          <Photo name="reception-privee" locale={locale} />
          <figcaption>{e.photoPrivate}</figcaption>
        </figure>
        <div>
          <p className="eyebrow">{e.gather}</p>
          <h2>
            {e.privateTitle}
            <br />
            <em>{e.privateItalic}</em>
          </h2>
          <p>{interpolate(h.privateText, { capacity: restaurant.capacity })}</p>
          <ArrowLink href={href(locale, "privatisation")}>
            {h.privateLink}
          </ArrowLink>
        </div>
      </section>
      <CareersFeature locale={locale} />
      <Visit locale={locale} />
    </>
  );
}
