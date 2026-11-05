import { getDictionary, href, type Locale } from "@/lib/i18n";
import { Photo, ArrowLink } from "./shared";

export function Atmosphere({ locale }: { locale: Locale }) {
  const e = getDictionary(locale).enrichment;
  const photographs = ["facade-soir", "terrasse-paris", "detail-banquette", "geste-cuisine", "salle-bouteilles"] as const;
  return (
    <section className="atmosphere container" aria-labelledby="atmosphere-title">
      <div className="atmosphere-heading">
        <div><p className="eyebrow">{e.atmosphereLabel}</p><h2 id="atmosphere-title">{e.atmosphereTitle} <em>{e.atmosphereItalic}</em></h2></div>
        <p>{e.atmosphereText}</p>
      </div>
      <div className="atmosphere-frieze">
        {photographs.map((name, index) => (
          <figure key={name}>
            <Photo name={name} locale={locale} sizes="(max-width:760px) 90vw, 30vw" />
            <figcaption><span aria-hidden="true">0{index + 1} / </span>{e.captions[name]}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

export function Distinctions({ locale }: { locale: Locale }) {
  const d = getDictionary(locale);
  return (
    <div className="distinction-emblems" aria-label={d.edition.seals}>
      {(["pudlo-2026", "college-culinaire", "tables-auberges"] as const).map((name) => (
        <Photo key={name} name={name} locale={locale} sizes="(max-width:760px) 100px, 160px" />
      ))}
    </div>
  );
}

export function PressFeature({ locale }: { locale: Locale }) {
  const e = getDictionary(locale).enrichment;
  return (
    <section className="press-feature container" aria-labelledby="press-feature-title">
      <div className="press-feature-heading">
        <div><p className="eyebrow">{e.pressLabel}</p><h2 id="press-feature-title">{e.pressTitle}<br /><em>{e.pressItalic}</em></h2></div>
        <Distinctions locale={locale} />
      </div>
      <div className="press-excerpts">
        {e.quotes.map((quote) => (
          <figure key={quote.author}>
            <blockquote><p>« {quote.text} »</p></blockquote>
            <figcaption>{quote.author}<cite>{quote.publication}</cite></figcaption>
          </figure>
        ))}
      </div>
      <ArrowLink href={href(locale, "presse")}>{e.pressLink}</ArrowLink>
    </section>
  );
}

export function CareersFeature({ locale }: { locale: Locale }) {
  const e = getDictionary(locale).enrichment;
  return (
    <section className="careers-feature container">
      <div><p className="eyebrow">{e.careersLabel}</p><h2>{e.careersTitle}<br /><em>{e.careersItalic}</em></h2></div>
      <div><p>{e.careersText}</p><ArrowLink href={href(locale, "recrutement")}>{e.careersLink}</ArrowLink></div>
    </section>
  );
}
