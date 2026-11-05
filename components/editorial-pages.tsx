import { getDictionary, interpolate, type Locale, type Slug } from "@/lib/i18n";
import { restaurant } from "@/lib/restaurant";
import { EnquiryComposer } from "./enquiry-composer";
import { Photo, OpeningHours, ArrowLink } from "./shared";
export function EditorialPage({
  locale,
  slug,
}: {
  locale: Locale;
  slug: Slug;
}) {
  const d = getDictionary(locale);
  if (slug === "la-maison") {
    const p = d.pages["la-maison"];
    return (
      <>
        <section className="house-story container">
          <figure>
            <Photo name="salle-comptoir" locale={locale} priority />
            <figcaption>{d.edition.photoHouse}</figcaption>
          </figure>
          <div>
            <p className="eyebrow">01 — Le Phalsbourg</p>
            <h2>{p.storyTitle}</h2>
            <p>{p.storyText}</p>
            <p>{p.storyText2}</p>
          </div>
        </section>
        <div className="house-pull container">
          <p className="eyebrow">{d.edition.teamPullNote}</p>
          <p>{d.edition.teamPull}</p>
        </div>
        <section className="team container">
          <p className="eyebrow">02 — {d.nav["la-maison"]}</p>
          <h2>{p.teamTitle}</h2>
          <div className="team-grid">
            {p.team.map((person, i) => (
              <article className="team-person" key={person.name} data-reveal>
                <figure>
                  <Photo
                    name={person.image}
                    locale={locale}
                    sizes="(max-width:760px) 90vw, 32vw"
                  />
                  <figcaption>0{i + 1} / Le Phalsbourg</figcaption>
                </figure>
                <div>
                  <p className="eyebrow">{person.role}</p>
                  <h3>{person.name}</h3>
                  <p>{person.text}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      </>
    );
  }
  if (slug === "privatisation" || slug === "recrutement") {
    const event = slug === "privatisation",
      p = d.pages[slug];
    return (
      <div className="enquiry-layout container">
        <aside className="enquiry-aside">
          <figure>
            <Photo
              name={event ? "reception-privee" : "chef-en-cuisine"}
              locale={locale}
              priority
              sizes="(max-width:760px) 90vw, 36vw"
            />
            <figcaption>
              {event ? d.edition.photoPrivate : d.edition.menuCaption}
            </figcaption>
          </figure>
          <h2>{p.detailTitle}</h2>
          <p>{p.detailText}</p>
          {event && (
            <div className="capacity-sign">
              <strong>{restaurant.capacity}</strong>
              <span>{d.ui.capacityLabel}</span>
            </div>
          )}
          <ArrowLink href={restaurant.phoneHref}>{restaurant.phone}</ArrowLink>
        </aside>
        <EnquiryComposer
          mode={event ? "event" : "job"}
          locale={locale}
          labels={d.enquiry}
          capacity={restaurant.capacity}
          email={restaurant.email}
        />
      </div>
    );
  }
  if (slug === "contact") {
    const p = d.pages.contact;
    return (
      <section className="contact-layout container">
        <div className="contact-information">
          <h2 className="eyebrow">{d.ui.address}</h2>
          <address className="large-address">
            {restaurant.address.street}
            <br />
            {restaurant.address.postalCode} {restaurant.address.city}
          </address>
          <ArrowLink href={restaurant.maps}>{d.ui.directions}</ArrowLink>
          <div className="contact-hours">
            <h2 className="eyebrow">{d.ui.hours}</h2>
            <OpeningHours locale={locale} />
          </div>
          <div className="contact-links">
            <a href={restaurant.phoneHref}>{restaurant.phone}</a>
            <a href={`mailto:${restaurant.email}`}>{restaurant.email}</a>
          </div>
          <p>{p.reservationText}</p>
          <a className="button" href={restaurant.reservation}>
            {d.ui.reserve} ↗
          </a>
        </div>
        <div>
          <Photo name="facade-monceau" locale={locale} priority />
          <div className="map-card">
            <p className="eyebrow">
              {restaurant.geo.latitude}° N · {restaurant.geo.longitude}° E
            </p>
            <h2>{p.mapTitle}</h2>
            <p>{p.mapText}</p>
            <ArrowLink href={restaurant.maps}>{d.ui.directions}</ArrowLink>
          </div>
        </div>
      </section>
    );
  }
  if (slug === "presse") {
    const p = d.pages.presse;
    return (
      <section className="press container">
        <div className="press-quote">
          <blockquote>
            « {d.home.quote} »<cite>{d.home.quoteAuthor}</cite>
          </blockquote>
        </div>
        {[
          ["01", p.pudloTitle, p.pudloText],
          ["02", p.parisienTitle, p.parisienText],
          ["03", p.laureTitle, p.laureText],
        ].map(([n, title, text]) => (
          <article className="press-row" key={n}>
            <span className="eyebrow">{n}</span>
            <h2>{title}</h2>
            <div>
              <p>{text}</p>
              {n === "03" && (
                <ArrowLink href="https://parisdiarybylaure.com/">
                  Paris Diary by Laure
                </ArrowLink>
              )}
            </div>
          </article>
        ))}
        <div className="recognition">
          <Photo name="pudlo-2026" locale={locale} sizes="160px" />
          <div>
            <h2>{p.recognition}</h2>
            <p>{p.recognitionText}</p>
          </div>
        </div>
      </section>
    );
  }
  if (slug === "confidentialite") {
    const p = d.pages.confidentialite;
    return (
      <div className="legal-content container">
        {p.sections.map((s) => (
          <section key={s.title}>
            <h2>{s.title}</h2>
            <p>{s.text}</p>
          </section>
        ))}
        <a className="text-link" href={`mailto:${restaurant.email}`}>
          {restaurant.email}
        </a>
      </div>
    );
  }
  const p = d.pages["mentions-legales"];
  const entries = [
    [p.company, process.env.LEGAL_COMPANY_NAME],
    [p.registration, process.env.LEGAL_COMPANY_REGISTRATION],
    [p.director, process.env.LEGAL_PUBLICATION_DIRECTOR],
    [
      p.host,
      [
        process.env.LEGAL_HOST_NAME,
        process.env.LEGAL_HOST_ADDRESS,
        process.env.LEGAL_HOST_PHONE,
      ]
        .filter(Boolean)
        .join(" · "),
    ],
  ];
  return (
    <div className="legal-content container">
      <section>
        <h2>{p.editor}</h2>
        <p>
          Le Phalsbourg
          <br />
          {restaurant.address.street}
          <br />
          {restaurant.address.postalCode} {restaurant.address.city}
        </p>
        <p>{p.contact}</p>
        <a href={`mailto:${restaurant.email}`}>{restaurant.email}</a>
        <br />
        <a href={restaurant.phoneHref}>{restaurant.phone}</a>
        <dl>
          {entries
            .filter(([, v]) => v)
            .map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
        </dl>
      </section>
      <section>
        <h2>{p.rights}</h2>
        <p>{p.rightsText}</p>
      </section>
    </div>
  );
}
