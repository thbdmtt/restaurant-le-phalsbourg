"use client";
import { useState } from "react";
import type { Dictionary, Locale } from "@/lib/i18n";
import type { WineItem } from "@/lib/menu-schema";
import { price, interpolate } from "@/lib/format";
import { filterWines, wineFilters, type WineFilter } from "@/lib/wine-filters";
export function WineExplorer({
  items,
  locale,
  labels,
}: {
  items: WineItem[];
  locale: Locale;
  labels: Dictionary["wineUi"];
}) {
  const [filter, setFilter] = useState<WineFilter>("all");
  const visible = filterWines(items, filter);
  const groups = [...new Set(visible.map((i) => i.category_slug))];
  return (
    <div className="wine-explorer">
      <div className="wine-filters" role="group" aria-label={labels.filters}>
        {wineFilters.map((key) => (
          <button
            key={key}
            type="button"
            aria-pressed={filter === key}
            onClick={() => setFilter(key)}
          >
            {labels[key]}
          </button>
        ))}
      </div>
      <p
        className="selection-count eyebrow"
        aria-live="polite"
        aria-atomic="true"
      >
        {interpolate(labels.count, { count: visible.length })}
      </p>
      {groups.map((group) => (
        <section className="wine-group" key={group}>
          <h3>
            {
              visible.find((i) => i.category_slug === group)![
                `category_${locale}`
              ]
            }
          </h3>
          <table className="wine-table">
            <caption className="sr-only">
              {
                visible.find((i) => i.category_slug === group)![
                  `category_${locale}`
                ]
              }
            </caption>
            <thead>
              <tr>
                <th scope="col">{labels.appellation}</th>
                <th scope="col">{labels.domain}</th>
                <th scope="col">{labels.vintage}</th>
                <th scope="col">{labels.glassPrice}</th>
                <th scope="col">{labels.bottlePrice}</th>
                <th scope="col">{labels.magnumPrice}</th>
              </tr>
            </thead>
            <tbody>
              {visible
                .filter((i) => i.category_slug === group)
                .map((item) => (
                  <tr key={item.id} data-wine-id={item.id}>
                    <th scope="row">
                      <span className="wine-name">
                        {item.appellation || item[`title_${locale}`]}
                      </span>
                      {item.cuvee && (
                        <span className="wine-cuvee">{item.cuvee}</span>
                      )}
                      {item.serving && <small>{item.serving}</small>}
                    </th>
                    <td className="wine-estate">
                      {item.domaine || "—"}
                      <small>{item.region}</small>
                    </td>
                    <td className="wine-vintage">
                      <span className="mobile-price-label">
                        {labels.vintage}
                      </span>
                      {item.vintage || "—"}
                    </td>
                    {(
                      ["price_glass", "price_75cl", "price_150cl"] as const
                    ).map((key, i) => (
                      <td className="wine-price" key={key}>
                        <span className="mobile-price-label">
                          {
                            [
                              labels.glassPrice,
                              labels.bottlePrice,
                              labels.magnumPrice,
                            ][i]
                          }
                        </span>
                        {item[key] === null ? (
                          <span aria-label={labels.notOffered}>—</span>
                        ) : (
                          price(item[key]!, locale)
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
            </tbody>
          </table>
        </section>
      ))}
      {!visible.length && (
        <div className="empty-selection">
          <p>{labels.empty}</p>
          <button className="text-link" onClick={() => setFilter("all")}>
            {labels.reset} ↗
          </button>
        </div>
      )}
    </div>
  );
}
