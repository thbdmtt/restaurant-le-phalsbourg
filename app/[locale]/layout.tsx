import { Cormorant_Garamond, Jost } from "next/font/google";
import { notFound } from "next/navigation";
import { isLocale, locales } from "@/lib/i18n";
import { restaurantSchema } from "@/lib/seo";
import { JsonLd } from "@/components/shared";
import "@/styles/globals.css";
const editorial = Cormorant_Garamond({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-editorial",
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});
const ui = Jost({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-ui",
  weight: ["400", "500", "600"],
});
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}
export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return (
    <html lang={locale} className={`${editorial.variable} ${ui.variable}`}>
      <body>
        <JsonLd data={restaurantSchema(locale)} />
        {children}
      </body>
    </html>
  );
}
