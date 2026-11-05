import { getDictionary, type Locale } from "@/lib/i18n";
import { NotFoundContent } from "@/components/not-found-content";
export default function NotFound() {
  const labels = (locale: Locale) => {
    const d = getDictionary(locale).ui;
    return { title: d.notFound, text: d.notFoundText, back: d.back };
  };
  return <NotFoundContent labels={{ fr: labels("fr"), en: labels("en") }} />;
}
