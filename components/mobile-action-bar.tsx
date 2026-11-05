"use client";

import { useEffect, useState } from "react";
import type { Dictionary, Locale } from "@/lib/i18n";
import { href } from "@/lib/format";
import { restaurant } from "@/lib/restaurant";
import { Icon } from "./icon";

export function MobileActionBar({ locale, labels }: {
  locale: Locale;
  labels: Pick<Dictionary["ui"], "mobileActions" | "reserveShort" | "menu" | "call">;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const mobile = window.matchMedia("(max-width: 960px)");
    const footer = document.querySelector(".site-footer");
    const dialogs = [...document.querySelectorAll("dialog")];
    let lastY = Math.max(0, window.scrollY);
    let frame = 0;
    let idle: ReturnType<typeof setTimeout> | undefined;
    let footerVisible = !!footer && footer.getBoundingClientRect().top <= window.innerHeight;
    const allowed = () => mobile.matches && window.scrollY > 420 &&
      !footerVisible && !dialogs.some(dialog => dialog.open);
    const hide = () => {
      clearTimeout(idle);
      setVisible(false);
    };
    const onScroll = () => {
      clearTimeout(idle);
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const y = Math.max(0, window.scrollY);
        const delta = y - lastY;
        lastY = y;
        if (!allowed()) { hide(); return; }
        if (delta > 0) setVisible(false);
        else if (delta < -2) setVisible(true);
        // A brief pause returns the actions, without covering photos during reading.
        idle = setTimeout(() => setVisible(allowed()), 800);
      });
    };
    const observer = new IntersectionObserver(([entry]) => {
      footerVisible = entry.isIntersecting || entry.boundingClientRect.top < 0;
      if (footerVisible) hide();
    });
    if (footer) observer.observe(footer);
    const dialogObserver = new MutationObserver(() => {
      if (!allowed()) hide();
    });
    dialogs.forEach(dialog => dialogObserver.observe(dialog, { attributes: true, attributeFilter: ["open"] }));
    const onResize = () => {
      lastY = Math.max(0, window.scrollY);
      hide();
      // Mobile browser chrome can resize the viewport at the end of a swipe.
      if (allowed()) idle = setTimeout(() => setVisible(allowed()), 800);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    mobile.addEventListener("change", onResize);
    return () => {
      clearTimeout(idle);
      cancelAnimationFrame(frame);
      observer.disconnect();
      dialogObserver.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      mobile.removeEventListener("change", onResize);
    };
  }, []);

  return (
    <nav className="mobile-action-bar" aria-label={labels.mobileActions}
      data-visible={visible ? "true" : "false"} aria-hidden={!visible} inert={!visible}>
      <a className="reserve" href={restaurant.reservation} tabIndex={visible ? undefined : -1}>
        <Icon />{labels.reserveShort}
      </a>
      <a href={href(locale, "carte")} tabIndex={visible ? undefined : -1}>
        <Icon name="Menu" />{labels.menu}
      </a>
      <a href={restaurant.phoneHref} tabIndex={visible ? undefined : -1}>
        <Icon name="Phone" />{labels.call}
      </a>
    </nav>
  );
}
