"use client";
import { Icon } from "./icon";
import { useEffect, useRef } from "react";
import type { Locale, Slug, Dictionary } from "@/lib/i18n";
import { href, interpolate } from "@/lib/format";
import { restaurant } from "@/lib/restaurant";
export function Header({
  locale,
  slug,
  nav,
  ui,
}: {
  locale: Locale;
  slug?: Slug;
  nav: Dictionary["nav"];
  ui: Dictionary["ui"];
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const header = useRef<HTMLElement>(null);
  useEffect(() => {
    const update = () =>
      header.current?.toggleAttribute("data-scrolled", window.scrollY > 24);
    window.addEventListener("scroll", update, { passive: true });
    update();
    return () => window.removeEventListener("scroll", update);
  }, []);
  const pages = [
    "carte",
    "vins",
    "la-maison",
    "privatisation",
    "contact",
  ] as const;
  const languages = (
    <nav className="languages" aria-label={ui.language}>
      {(["fr", "en"] as const).map((l) => (
        <a
          key={l}
          href={href(l, slug)}
          hrefLang={l}
          lang={l}
          aria-current={l === locale ? "page" : undefined}
        >
          {l.toUpperCase()}
        </a>
      ))}
    </nav>
  );
  return (
    <header className="site-header" ref={header}>
      <a href={href(locale)} className="brand" aria-label={ui.homeLabel}>
        <img
          src="/images/signature-ui.webp"
          width={1920}
          height={705}
          alt="Le Phalsbourg"
        />
      </a>
      <div className="desktop-navigation">
      <nav className="desktop-nav" aria-label={ui.mainNav}>
        {pages.map((s) => (
          <a
            key={s}
            href={href(locale, s)}
            aria-current={slug === s ? "page" : undefined}
          >
            {nav[s]}
          </a>
        ))}
      </nav>
      <nav className="editorial-nav" aria-label={ui.editorialNav}>
        {(["presse", "recrutement"] as const).map((s) => (
          <a key={s} href={href(locale, s)} aria-current={slug === s ? "page" : undefined}>
            {nav[s]} <Icon name="ArrowUpRight" />
          </a>
        ))}
      </nav>
      </div>
      <div className="header-actions">
        {languages}
        <a className="button compact header-book" href={restaurant.reservation}>
          {ui.reserveShort}
          <Icon name="ArrowUpRight" />
        </a>
        <button
          className="menu-toggle"
          onClick={() => dialog.current?.showModal()}
          aria-label={ui.openMenu}
          aria-haspopup="dialog"
        >
          <span />
          <span />
        </button>
      </div>
      <dialog
        ref={dialog}
        aria-label={ui.mainNav}
        className="mobile-dialog"
        onClick={(e) => {
          if (e.target === dialog.current) dialog.current.close();
        }}
      >
        <div className="mobile-panel">
          <div className="mobile-top">
            <span className="eyebrow">Le Phalsbourg</span>
            <button
              className="icon-button"
              onClick={() => dialog.current?.close()}
              aria-label={ui.closeMenu}
            >
              <Icon name="Close" />
            </button>
          </div>
          <nav aria-label={ui.mainNav}>
            {(["home", ...pages, "presse", "recrutement"] as const).map(
              (s, index) => (
                <a
                  key={s}
                  href={href(locale, s === "home" ? "" : s)}
                  aria-current={(s === "home" ? !slug : slug === s) ? "page" : undefined}
                  onClick={() => dialog.current?.close()}
                >
                  <span className="nav-number">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {nav[s]}
                </a>
              ),
            )}
          </nav>
          <div className="mobile-services">
            <p>
              {interpolate(ui.dayRange, {
                first: ui.dayNames[restaurant.opening.days[0]],
                last: ui.dayNames[
                  restaurant.opening.days[restaurant.opening.days.length - 1]
                ],
              })}
            </p>
            <p>
              {restaurant.opening.services
                .map((s) => `${s.opens}–${s.closes}`)
                .join(" · ")}
            </p>
          </div>
          <div className="mobile-bottom">
            {languages}
            <a className="button" href={restaurant.reservation}>
              {ui.reserveShort} <Icon />
            </a>
          </div>
        </div>
      </dialog>
    </header>
  );
}
