"use client"

import * as React from "react"
import { cva } from "class-variance-authority"

import { Icon } from "../../icons/icon"
import { cn } from "../../lib/utils"
import type { LabelLayout } from "../../providers/onu-provider"
import { FormLayoutProvider, useFormDisabled } from "./form-context"

export const fieldsetVariants = cva("min-w-0 gap-4 grid", {
  variants: {
    variant: {
      plain: "",
      card: "p-4 sm:p-5 rounded-xl border border-border bg-card text-card-foreground",
      separated: "pt-6 first:pt-0 border-t border-border first:border-t-0",
    },
  },
  defaultVariants: { variant: "plain" },
})

export interface FieldsetProps extends Omit<React.ComponentProps<"fieldset">, "title"> {
  /** Section title, rendered as the `<legend>`. */
  legend: React.ReactNode
  /** Text under the legend, linked with `aria-describedby`. */
  description?: React.ReactNode
  variant?: "plain" | "card" | "separated"
  /** Let the user show and hide the section. */
  collapsible?: boolean
  /** Initial state when collapsible. Default `true`. */
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
  /** Label layout for the fields inside. */
  labelLayout?: LabelLayout
  /** Disables every control inside (native `<fieldset disabled>`). */
  disabled?: boolean
  /** Visually hide the legend (it stays available to screen readers). */
  hideLegend?: boolean
  classNames?: { legend?: string; description?: string; content?: string; trigger?: string }
}

/**
 * A titled group of fields (`<fieldset>` + `<legend>`): the form section.
 * Optionally collapsible; a collapsed section keeps its fields in the form
 * and opens itself when one of them needs focus (e.g. a validation error).
 */
export function Fieldset({
  legend,
  description,
  variant = "plain",
  collapsible = false,
  defaultOpen = true,
  open: openProp,
  onOpenChange,
  labelLayout,
  disabled: disabledProp,
  hideLegend = false,
  className,
  classNames,
  children,
  ...props
}: FieldsetProps) {
  const id = React.useId()
  const contentId = `${id}-content`
  const descriptionId = description ? `${id}-description` : undefined
  const [uncontrolled, setUncontrolled] = React.useState(defaultOpen)
  const open = !collapsible || (openProp ?? uncontrolled)
  const formDisabled = useFormDisabled()
  const disabled = disabledProp ?? formDisabled

  const setOpen = (next: boolean) => {
    if (openProp === undefined) setUncontrolled(next)
    onOpenChange?.(next)
  }

  function reveal(event: Event) {
    if (!collapsible || open) return
    setOpen(true)
    event.stopPropagation()
  }

  const ref = React.useRef<HTMLFieldSetElement>(null)
  const revealRef = React.useRef(reveal)
  React.useEffect(() => {
    revealRef.current = reveal
  })
  React.useEffect(() => {
    const el = ref.current
    if (!el) return
    const handler = (e: Event) => revealRef.current(e)
    el.addEventListener("onu:reveal", handler)
    return () => el.removeEventListener("onu:reveal", handler)
  }, [])

  const legendContent = collapsible ? (
    <button
      type="button"
      aria-expanded={open}
      aria-controls={contentId}
      onClick={() => setOpen(!open)}
      className={cn(
        "gap-2 -mx-1 px-1 py-0.5 touch:min-h-11 flex w-full items-center rounded-md text-start outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        classNames?.trigger,
      )}
    >
      <span className="flex-1">{legend}</span>
      <Icon
        name="chevron-down"
        className={cn("size-4 text-muted-foreground transition-transform", open && "rotate-180")}
      />
    </button>
  ) : (
    legend
  )

  return (
    <fieldset
      ref={ref}
      data-slot="fieldset"
      data-variant={variant}
      data-state={collapsible ? (open ? "open" : "closed") : undefined}
      disabled={disabled || undefined}
      aria-describedby={descriptionId}
      onInvalidCapture={() => {
        if (collapsible && !open) setOpen(true)
      }}
      className={cn(fieldsetVariants({ variant }), className)}
      {...props}
    >
      <legend
        data-slot="fieldset-legend"
        className={cn(
          "text-base font-semibold leading-snug float-start w-full",
          hideLegend && "sr-only",
          classNames?.legend,
        )}
      >
        {legendContent}
      </legend>
      {description ? (
        <p
          id={descriptionId}
          data-slot="fieldset-description"
          className={cn("text-sm -mt-2 clear-both text-muted-foreground", classNames?.description)}
        >
          {description}
        </p>
      ) : null}
      <div
        id={contentId}
        data-slot="fieldset-content"
        hidden={!open}
        className={cn("gap-5 min-w-0 clear-both grid", classNames?.content)}
      >
        <FormLayoutProvider labelLayout={labelLayout} disabled={disabled}>
          {children}
        </FormLayoutProvider>
      </div>
    </fieldset>
  )
}

/** Alias: a form section is a `Fieldset`. */
export const FormSection = Fieldset
export type FormSectionProps = FieldsetProps
