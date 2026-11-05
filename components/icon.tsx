export type IconName = "ArrowUpRight" | "Phone" | "Menu" | "Download" | "Copy" | "Close";

const paths: Record<IconName, React.ReactNode> = {
  ArrowUpRight: <path d="M3 10 10 3M3 3h7v7" />,
  Phone: <path d="m3.5 1.5 2 3-1.4 1.4a9 9 0 0 0 4 4L9.5 8.5l3 2-.5 2c-5.7.8-11.3-4.8-10.5-10.5z" />,
  Menu: <><path d="M2 2h10v10H2zM5 2v10M7.5 5h2M7.5 8h2" /></>,
  Download: <path d="M7 1.5v7m-3-3 3 3 3-3M2 10v2.5h10V10" />,
  Copy: <><rect x="5" y="5" width="7" height="7" rx="1" /><path d="M9 3V2H2v7h1" /></>,
  Close: <path d="m3 3 8 8M11 3l-8 8" />,
};

/** Decorative paths only: no font, Unicode glyph or platform emoji fallback. */
export function Icon({ name = "ArrowUpRight" }: { name?: IconName }) {
  const size = name === "ArrowUpRight" ? 13 : 14;
  return (
    <svg className={`icon icon-${name}`} width={size} height={size}
      viewBox={`0 0 ${size} ${size}`} fill="none" stroke="currentColor"
      strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true" focusable="false">
      {paths[name]}
    </svg>
  );
}
