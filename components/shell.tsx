import { Reveal } from "./reveal";
import { Header } from "./header";
import { Footer } from "./shared";
import { getDictionary, type Locale, type Slug } from "@/lib/i18n";
export function Shell({
  locale,
  slug,
  children,
}: {
  locale: Locale;
  slug?: Slug;
  children: React.ReactNode;
}) {
  const d = getDictionary(locale);
  return (
    <>
      <a className="skip-link" href="#main">
        {d.ui.skip}
      </a>
      <Header locale={locale} slug={slug} nav={d.nav} ui={d.ui} />
      <main id="main">{children}</main>
      <Footer locale={locale} />
      <Reveal />
    </>
  );
}
