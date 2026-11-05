import { Icon } from "./icon";
import { getDictionary, price, type Locale } from "@/lib/i18n";
import { restaurant } from "@/lib/restaurant";
import { getMenu } from "@/lib/menu-sheet";
import type { CommonItem, MenuItem } from "@/lib/menu-schema";
import { Photo, ArrowLink, JsonLd } from "./shared";
import { CategoryNav } from "./category-nav";
function groups<T extends CommonItem>(items: T[]) {
  const result = new Map<string, T[]>();
  for (const item of items) {
    const list = result.get(item.category_slug) || [];
    list.push(item);
    result.set(item.category_slug, list);
  }
  return [...result.entries()];
}
export async function Menu({ locale }: { locale: Locale }) {
  const d = getDictionary(locale),
    p = d.pages.carte;
  const items = await getMenu();
  const formulas = items.filter((i) => i.category_slug === "formules");
  const sections = groups(items.filter((i) => i.category_slug !== "formules"));
  return (
    <>
      <div className="container">
        {formulas.map((item) => (
          <section className="lunch-panel" key={item.id}>
            <div>
              <p className="eyebrow">{p.lunch}</p>
              <h2>{item[`title_${locale}`]}</h2>
            </div>
            <p>{item[`description_${locale}`] || p.lunchNote}</p>
            <span className="lunch-price">{price(item.price, locale)}</span>
          </section>
        ))}
      </div>
      <div className="menu-layout container">
        <aside className="menu-aside">
          <figure>
            <Photo name="assiette-saison" locale={locale} sizes="30vw" />
            <figcaption>{p.imageCaption}</figcaption>
          </figure>
          <p>{p.note}</p>
          <ArrowLink href={restaurant.instagram}>Instagram</ArrowLink>
        </aside>
        <div className="menu-content">
          <CategoryNav
            label={d.ui.menuNav}
            sections={sections.map(([id, list]) => ({
              id,
              title: list[0][`category_${locale}`],
            }))}
          />
          {items.length === 0 && <p>{d.ui.empty}</p>}
          {sections.map(([slug, list], index) => (
            <section className="menu-section" id={slug} key={slug}>
              <div className="section-label">
                <span>0{index + 1}</span>
                <h2>{list[0][`category_${locale}`]}</h2>
              </div>
              {list.map((item) => (
                <article className="menu-item" key={item.id}>
                  <div className="dish-heading">
                    <h3>{item[`title_${locale}`]}</h3>
                    <span className="dotted-leader" aria-hidden="true" />
                    <p className="item-price">
                      {price(item.price, locale)}
                      {item.price_unit === "100g" && (
                        <small>{d.ui.per100g}</small>
                      )}
                    </p>
                  </div>
                  {item[`description_${locale}`] && (
                    <p className="dish-description">
                      {item[`description_${locale}`]}
                    </p>
                  )}
                  {item.dietary_tags
                    .split(",")
                    .filter(Boolean)
                    .map((tag) => (
                      <span className="dietary" key={tag}>
                        {d.ui[tag as "vegetarian" | "gluten_free" | "homemade"]}
                      </span>
                    ))}
                </article>
              ))}
            </section>
          ))}
          <div className="menu-footnote">
            <p>{d.ui.prices}</p>
            <p>{d.ui.allergens}</p>
          </div>
        </div>
      </div>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Menu",
          "@id": `${restaurant.url}/${locale}/carte#menu`,
          name: d.nav.carte,
          inLanguage: locale,
          hasMenuSection: groups(items).map(([, list]) => ({
            "@type": "MenuSection",
            name: list[0][`category_${locale}`],
            hasMenuItem: list.map((item: MenuItem) => ({
              "@type": "MenuItem",
              name: item[`title_${locale}`],
              description: item[`description_${locale}`],
              offers: {
                "@type": "Offer",
                price: item.price,
                priceCurrency: "EUR",
                ...(item.price_unit === "100g"
                  ? {
                      priceSpecification: {
                        "@type": "UnitPriceSpecification",
                        price: item.price,
                        priceCurrency: "EUR",
                        referenceQuantity: {
                          "@type": "QuantitativeValue",
                          value: 100,
                          unitCode: "GRM",
                        },
                      },
                    }
                  : {}),
              },
            })),
          })),
        }}
      />
    </>
  );
}
export function Wines({ locale }: { locale: Locale }) {
  const d = getDictionary(locale),
    p = d.pages.vins;
  return (
    <section className="wine-page container" aria-labelledby="wine-title">
      <div className="wine-page-copy">
        <p className="eyebrow">{p.eyebrow}</p>
        <h1 id="wine-title">
          {p.title.slice(0, p.title.indexOf(p.titleItalic))}
          <em>{p.titleItalic}</em>
        </h1>
        <p className="wine-page-intro">{p.intro}</p>
        <div className="wine-page-actions">
          <a
            className="button"
            href={restaurant.winePdf}
            target="_blank"
            rel="noopener noreferrer"
            aria-describedby="wine-pdf-note"
          >
            {p.openMenu}
            <Icon name="ArrowUpRight" />
          </a>
          <a className="text-link" href={restaurant.winePdf} download>
            {d.ui.download}
            <Icon name="Download" />
          </a>
        </div>
        <p className="wine-pdf-note" id="wine-pdf-note">
          {p.openNote}
        </p>
        <p className="wine-page-welcome">{p.welcome}</p>
      </div>
      <figure className="wine-page-photo">
        <Photo
          name="vin-jobard"
          locale={locale}
          priority
          sizes="(max-width: 760px) calc(100vw - 40px), (min-width: 1600px) 580px, 42vw"
        />
        <figcaption>{p.photoCaption}</figcaption>
      </figure>
    </section>
  );
}
