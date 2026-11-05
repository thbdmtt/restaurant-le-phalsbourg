"use client";
import { useParams } from "next/navigation";
import { href } from "@/lib/format";
import type { Locale } from "@/lib/i18n";
type Labels = { title: string; text: string; back: string };
export function NotFoundContent({
  labels,
}: {
  labels: Record<Locale, Labels>;
}) {
  const params = useParams();
  const locale = params?.locale === "en" ? "en" : "fr";
  const d = labels[locale];
  return (
    <main className="not-found container">
      <p className="eyebrow">404 · Le Phalsbourg</p>
      <h1>{d.title}</h1>
      <p>{d.text}</p>
      <a className="button" href={href(locale)}>
        {d.back}
      </a>
    </main>
  );
}
