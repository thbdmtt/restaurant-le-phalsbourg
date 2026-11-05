export const revalidate = 60;
import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n";
import { metadata } from "@/lib/seo";
import { Shell } from "@/components/shell";
import { Home } from "@/components/home";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return metadata(locale);
}
export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return (
    <Shell locale={locale}>
      <Home locale={locale} />
    </Shell>
  );
}
