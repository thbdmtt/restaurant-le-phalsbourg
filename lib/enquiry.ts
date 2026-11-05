import type { Dictionary, Locale } from "./i18n";
import { interpolate } from "./format";
export type EnquiryValues = {
  choice: string;
  date: string;
  guests: string;
  name: string;
  email: string;
  phone: string;
  message: string;
};
export function parisToday(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}
export function composeEnquiry(
  mode: "event" | "job",
  values: EnquiryValues,
  labels: Dictionary["enquiry"],
  locale: Locale,
) {
  const date = values.date
    ? new Intl.DateTimeFormat(locale === "fr" ? "fr-FR" : "en-GB", {
        dateStyle: "long",
        timeZone: "UTC",
      }).format(new Date(values.date + "T12:00:00Z"))
    : "—";
  const clean = (s: string) => s.replace(/[\r\n]/g, " ").trim();
  const subject = interpolate(
    mode === "event" ? labels.eventSubject : labels.jobSubject,
    {
      event: clean(values.choice),
      role: clean(values.choice),
      date,
      guests: values.guests,
      name: clean(values.name),
    },
  );
  const lines = [
    labels.greeting,
    "",
    mode === "event" ? labels.eventBody : labels.jobBody,
    "",
    `${mode === "event" ? labels.event : labels.role} : ${values.choice}`,
    `${mode === "event" ? labels.date : labels.start} : ${date}`,
  ];
  if (mode === "event") lines.push(`${labels.guests} : ${values.guests}`);
  lines.push(
    "",
    values.message.trim(),
    "",
    labels.signature,
    values.name.trim(),
    `${labels.emailLabel} : ${values.email.trim()}`,
  );
  if (values.phone.trim()) lines.push(values.phone.trim());
  return { subject, body: lines.join("\n") };
}
export function enquiryMailto(email: string, subject: string, body: string) {
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
