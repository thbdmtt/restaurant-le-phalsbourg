"use client";
import { Icon } from "./icon";
import { useRef, useState } from "react";
import type { Dictionary, Locale } from "@/lib/i18n";
import { interpolate } from "@/lib/format";
import {
  composeEnquiry,
  enquiryMailto,
  parisToday,
  type EnquiryValues,
} from "@/lib/enquiry";
export function EnquiryComposer({
  mode,
  locale,
  labels,
  capacity,
  email,
}: {
  mode: "event" | "job";
  locale: Locale;
  labels: Dictionary["enquiry"];
  capacity: number;
  email: string;
}) {
  const event = mode === "event",
    choices = event ? labels.events : labels.roles;
  const [values, setValues] = useState<EnquiryValues>({
    choice: choices[0],
    date: "",
    guests: "12",
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [status, setStatus] = useState("");
  const [preview, setPreview] = useState(false);
  const form = useRef<HTMLFormElement>(null);
  const text = useRef<HTMLTextAreaElement>(null);
  const composed = composeEnquiry(mode, values, labels, locale);
  const fullText = `${composed.subject}\n\n${composed.body}`;
  const update = (key: keyof EnquiryValues, value: string) => {
    setValues((v) => ({ ...v, [key]: value }));
    setStatus("");
  };
  function valid() {
    if (!form.current?.reportValidity()) {
      setStatus(labels.invalid);
      return false;
    }
    return true;
  }
  async function copy() {
    if (!valid()) return;
    try {
      await navigator.clipboard.writeText(fullText);
      setStatus(labels.copied);
    } catch {
      setPreview(true);
      setStatus(labels.copyError);
      requestAnimationFrame(() => {
        text.current?.focus();
        text.current?.select();
      });
    }
  }
  return (
    <section className="enquiry-composer" aria-labelledby="enquiry-title">
      <p className="eyebrow">{labels.summary}</p>
      <h2 id="enquiry-title">{event ? labels.title : labels.jobTitle}</h2>
      <p>{event ? labels.lead : labels.jobLead}</p>
      <form
        ref={form}
        onSubmit={(e) => {
          e.preventDefault();
          if (valid()) {
            window.location.href = enquiryMailto(
              email,
              composed.subject,
              composed.body,
            );
            setStatus(labels.successTitle);
          }
        }}
      >
        <fieldset className="choice-field">
          <legend>
            <span>01</span>
            {event ? labels.event : labels.role}
          </legend>
          <div className="choice-options">
            {choices.map((choice) => (
              <label key={choice}>
                <input
                  type="radio"
                  name="choice"
                  value={choice}
                  checked={values.choice === choice}
                  onChange={() => update("choice", choice)}
                />
                <span>{choice}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend>
            <span>02</span>
            {event ? labels.date : labels.start}
          </legend>
          <div className="form-grid">
            <label>
              {event ? labels.date : labels.start}
              {event ? " *" : ""}
              <input
                type="date"
                required={event}
                min={parisToday()}
                value={values.date}
                onChange={(e) => update("date", e.target.value)}
              />
            </label>
            {event && (
              <label>
                {labels.guests} *
                <input
                  name="guests"
                  type="number"
                  required
                  min="1"
                  max={capacity}
                  value={values.guests}
                  onChange={(e) => update("guests", e.target.value)}
                />
                <small>{interpolate(labels.capacity, { capacity })}</small>
              </label>
            )}
          </div>
        </fieldset>
        <fieldset>
          <legend>
            <span>03</span>
            {event ? labels.message : labels.jobMessage}
          </legend>
          <label className="sr-only" htmlFor="enquiry-message">
            {event ? labels.message : labels.jobMessage}
          </label>
          <textarea
            id="enquiry-message"
            rows={4}
            maxLength={3000}
            value={values.message}
            onChange={(e) => update("message", e.target.value)}
          />
        </fieldset>
        <div className="form-grid">
          <label>
            {labels.name} *
            <input
              name="name"
              autoComplete="name"
              required
              maxLength={120}
              value={values.name}
              onChange={(e) => update("name", e.target.value)}
            />
          </label>
          <label>
            {labels.email} *
            <input
              name="email"
              type="email"
              autoComplete="email"
              required
              maxLength={200}
              value={values.email}
              onChange={(e) => update("email", e.target.value)}
            />
          </label>
          <label>
            {labels.phone}
            <input
              type="tel"
              name="phone"
              autoComplete="tel"
              maxLength={40}
              value={values.phone}
              onChange={(e) => update("phone", e.target.value)}
            />
          </label>
        </div>
        <p className="small-copy">{labels.required}</p>
        <div className="form-actions">
          <button type="submit" className="button">
            {labels.send}
            <Icon name="ArrowUpRight" />
          </button>
          <button type="button" className="text-link" onClick={copy}>
            {labels.copy}
            <Icon name="Copy" />
          </button>
        </div>
        <p className="small-copy">{labels.note}</p>
        <p className="small-copy">
          {labels.copyNote} <a href={`mailto:${email}`}>{email}</a>.
        </p>
        <p className="form-status" role="status">
          {status}
        </p>
        <details
          open={preview}
          onToggle={(e) => setPreview(e.currentTarget.open)}
        >
          <summary>{labels.preview}</summary>
          <label className="sr-only" htmlFor="enquiry-preview">
            {labels.previewTitle}
          </label>
          <textarea
            ref={text}
            id="enquiry-preview"
            readOnly
            value={fullText}
            rows={12}
          />
        </details>
      </form>
    </section>
  );
}
