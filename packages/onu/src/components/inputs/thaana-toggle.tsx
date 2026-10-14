"use client"

import { LiveRegion } from "../../a11y/live-region"
import { cn } from "../../lib/utils"
import { useTranslation } from "../../providers/onu-provider"
import { registerEnglish } from "../../i18n/english"
import { thaana as en_thaana } from "../../locales/en/thaana"

registerEnglish({ thaana: en_thaana })

export interface ThaanaToggleProps extends Omit<React.ComponentProps<"button">, "onToggle"> {
  enabled: boolean
  onToggle: () => void
}

/**
 * Switches a field between Thaana and Latin typing (R13.5). Shows the mode
 * that is active ("ދ" or "A"); the state is exposed with `aria-pressed`, and
 * the change is announced through a polite live region.
 */
export function ThaanaToggle({ enabled, onToggle, className, ...props }: ThaanaToggleProps) {
  const { t } = useTranslation()
  return (
    <>
      <button
        type="button"
        data-slot="thaana-toggle"
        aria-pressed={enabled}
        aria-label={t("thaana.toggle")}
        title={`${t("thaana.toggle")} (Alt+Shift+T)`}
        onClick={onToggle}
        onMouseDown={(e) => e.preventDefault()}
        className={cn(
          "h-6 min-w-6 px-1 text-xs font-medium inline-flex items-center justify-center rounded-md text-muted-foreground",
          "hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
          "touch:min-h-11 touch:min-w-11",
          className,
        )}
        {...props}
      >
        <span lang={enabled ? "dv" : "en"} aria-hidden="true">
          {enabled ? "ދ" : "A"}
        </span>
      </button>
      <LiveRegion>{enabled ? t("thaana.on") : t("thaana.off")}</LiveRegion>
    </>
  )
}
