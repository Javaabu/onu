"use client"

import * as React from "react"

import { cn } from "../../lib/utils"
import type { LabelLayout } from "../../providers/onu-provider"
import { useTranslation } from "../../providers/onu-provider"
import { Skeleton } from "../../ui/skeleton"
import { useLabelLayout } from "../form/form-context"
import { registerEnglish } from "../../i18n/english"
import { overlay as en_overlay } from "../../locales/en/overlay"

registerEnglish({ overlay: en_overlay })

export interface PlaceholderInputProps extends React.ComponentProps<"div"> {
  /** Shape of the control. Default `input`. */
  control?: "input" | "textarea" | "select" | "checkbox" | "switch"
  /** Show a label placeholder. Default `true`. */
  label?: boolean
  /** Show a help-text placeholder under the control. Default `false`. */
  help?: boolean
  /** Label layout, like `FormField`. Defaults to the form or `OnuProvider` setting. */
  labelLayout?: LabelLayout
  /** Screen-reader text. Default "Loading…". */
  srLabel?: string
  classNames?: { label?: string; control?: string; help?: string }
}

/**
 * A skeleton shaped like a form field (label, control, help text), for forms
 * whose values are still loading. Follows the stacked/inline label layout so
 * the page doesn't jump when the real fields arrive.
 */
export function PlaceholderInput({
  control = "input",
  label = true,
  help = false,
  labelLayout,
  srLabel,
  className,
  classNames,
  ...props
}: PlaceholderInputProps) {
  const { t } = useTranslation()
  const layout = useLabelLayout(labelLayout)
  const inline = layout === "inline"
  const toggle = control === "checkbox" || control === "switch"

  if (toggle) {
    return (
      <div
        role="status"
        aria-label={srLabel ?? t("overlay.loading")}
        data-slot="placeholder-input"
        data-control={control}
        className={cn("gap-2 flex items-center", className)}
        {...props}
      >
        <Skeleton
          aria-hidden="true"
          className={cn(
            control === "switch" ? "w-8 h-[1.15rem] rounded-full" : "size-4 rounded-sm",
            classNames?.control,
          )}
        />
        {label ? <Skeleton aria-hidden="true" className={cn("h-3.5 w-32", classNames?.label)} /> : null}
      </div>
    )
  }

  return (
    <div
      role="status"
      aria-label={srLabel ?? t("overlay.loading")}
      data-slot="placeholder-input"
      data-control={control}
      data-label-layout={layout}
      className={cn("@container/form-field w-full", className)}
      {...props}
    >
      <div
        aria-hidden="true"
        className={cn(
          "gap-2 grid",
          inline && "@md/form-field:grid-cols-[var(--onu-label-width)_minmax(0,1fr)] @md/form-field:gap-x-4",
        )}
      >
        {label ? (
          <div className={cn("flex items-center", inline && "@md/form-field:h-8")}>
            <Skeleton className={cn("h-3.5 w-24", classNames?.label)} />
          </div>
        ) : null}
        <div className={cn("gap-1.5 min-w-0 grid", inline && label && "@md/form-field:col-start-2")}>
          <Skeleton
            className={cn(
              "touch:h-11 w-full rounded-lg",
              control === "textarea" ? "h-16" : "h-8",
              control === "select" && "gap-2 px-2.5 flex items-center justify-end",
              classNames?.control,
            )}
          >
            {control === "select" ? <span className="size-3 rounded-sm bg-muted-foreground/20" /> : null}
          </Skeleton>
          {help ? <Skeleton className={cn("h-3 w-2/3", classNames?.help)} /> : null}
        </div>
      </div>
    </div>
  )
}
