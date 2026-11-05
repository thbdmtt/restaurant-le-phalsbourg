"use client";
import { useEffect, useState } from "react";
export function CategoryNav({
  sections,
  label,
}: {
  sections: { id: string; title: string }[];
  label: string;
}) {
  const [active, setActive] = useState(sections[0]?.id);
  useEffect(() => {
    const update = () => {
      const threshold = 180;
      let current = sections[0]?.id;
      for (const section of sections) {
        const el = document.getElementById(section.id);
        if (el && el.getBoundingClientRect().top <= threshold)
          current = section.id;
      }
      setActive(current);
    };
    const observer = new IntersectionObserver(update, {
      rootMargin: "-140px 0px -50% 0px",
      threshold: [0, 1],
    });
    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    window.addEventListener("scroll", update, { passive: true });
    update();
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", update);
    };
  }, [sections]);
  return (
    <nav className="category-nav" aria-label={label}>
      {sections.map((s) => (
        <a
          key={s.id}
          href={`#${s.id}`}
          aria-current={active === s.id ? "location" : undefined}
          onClick={() => setActive(s.id)}
        >
          {s.title}
        </a>
      ))}
    </nav>
  );
}
