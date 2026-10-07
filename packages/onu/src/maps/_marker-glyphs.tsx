import { cn } from "../lib/utils"

/** Teardrop pin with an optional short label (stop number). */
export function MarkerPin({ tone, label, selected }: { tone: string; label?: string; selected?: boolean }) {
  return (
    <svg viewBox="0 0 24 32" className={cn("drop-shadow-sm", selected ? "size-10" : "size-8")} aria-hidden>
      <path
        d="M12 1C6 1 1.5 5.4 1.5 11.2 1.5 18.6 12 31 12 31s10.5-12.4 10.5-19.8C22.5 5.4 18 1 12 1Z"
        style={{ fill: tone }}
        className="stroke-background"
        strokeWidth="1.5"
      />
      {label ? (
        <text x="12" y="15" textAnchor="middle" className="font-semibold fill-background text-[9px]">
          {label}
        </text>
      ) : (
        <circle cx="12" cy="11.5" r="3.5" className="fill-background" />
      )}
    </svg>
  )
}

/** Round marker with a heading arrow (vehicles, vessels). */
export function MarkerArrow({ tone, heading }: { tone: string; heading: number }) {
  return (
    <svg viewBox="0 0 24 24" className="size-7 drop-shadow-sm" aria-hidden>
      <g transform={`rotate(${heading} 12 12)`}>
        <circle cx="12" cy="12" r="10" className="fill-background" />
        <path d="M12 3 18.5 19 12 15.5 5.5 19Z" style={{ fill: tone }} />
      </g>
    </svg>
  )
}
