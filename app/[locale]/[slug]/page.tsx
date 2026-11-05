import { notFound } from "next/navigation";
import { isLocale, isSlug, slugs, locales } from "@/lib/i18n";
import { metadata } from "@/lib/seo";
import { Shell } from "@/components/shell";
import { PageIntro, Visit } from "@/components/shared";
import { Menu, Wines } from "@/components/menus";
import { EditorialPage } from "@/components/editorial-pages";
export const revalidate = 60;
export function generateStaticParams() {
  return locales.flatMap((locale) => slugs.map((slug) => ({ locale, slug })));
}
async function resolve(params: Promise<{ locale: string; slug: string }>) {
  const { locale, slug } = await params;
  if (!isLocale(locale) || !isSlug(slug)) notFound();
  return { locale, slug };
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await resolve(params);
  return metadata(locale, slug);
}
export default async function Page({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await resolve(params);
  return (
    <Shell locale={locale} slug={slug}>
      {slug !== "vins" && <PageIntro locale={locale} slug={slug} />}
      {slug === "carte" ? (
        <Menu locale={locale} />
      ) : slug === "vins" ? (
        <Wines locale={locale} />
      ) : (
        <EditorialPage locale={locale} slug={slug} />
      )}
      {![
        "vins",
        "contact",
        "mentions-legales",
        "confidentialite",
        "recrutement",
      ].includes(slug) && <Visit locale={locale} />}
    </Shell>
  );
}
