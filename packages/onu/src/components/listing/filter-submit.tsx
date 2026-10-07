"use client"

import * as React from "react"

import { Icon } from "../../icons/icon"
import { cn } from "../../lib/utils"
import { useTranslation } from "../../providers/onu-provider"
import { Button } from "../../ui/button"
import { Spinner } from "../../ui/spinner"

export interface FilterSubmitProps extends Omit<React.ComponentProps<"div">, "children"> {
  /** Shows a spinner on the submit button and blocks double submits. */
  loading?: boolean
  /** Shows a Reset button. */
  onReset?: () => void
  /** Disable Reset (e.g. when nothing is filtered). */
  resetDisabled?: boolean
  submitLabel?: React.ReactNode
  resetLabel?: React.ReactNode
  /** The `form` attribute, when the buttons sit outside the form. */
  form?: string
  classNames?: { submit?: string; reset?: string }
}

/**
 * Submit and Reset buttons for a classic filter form (e.g. a server-rendered
 * filter bar above a table). The submit button is `type="submit"`.
 */
export function FilterSubmit({
  loading = false,
  onReset,
  resetDisabled,
  submitLabel,
  resetLabel,
  form,
  className,
  classNames,
  ...props
}: FilterSubmitProps) {
  const { t } = useTranslation()
  return (
    <div data-slot="filter-submit" className={cn("gap-2 flex flex-wrap items-center", className)} {...props}>
      <Button
        type="submit"
        form={form}
        disabled={loading}
        aria-busy={loading || undefined}
        className={cn("touch:min-h-11", classNames?.submit)}
      >
        {loading ? <Spinner /> : <Icon name="filter" />}
        {submitLabel ?? t("listing.filterSubmit")}
      </Button>
      {onReset ? (
        <Button
          type="button"
          variant="ghost"
          form={form}
          disabled={loading || resetDisabled}
          onClick={onReset}
          className={cn("touch:min-h-11", classNames?.reset)}
        >
          {resetLabel ?? t("listing.filterReset")}
        </Button>
      ) : null}
    </div>
  )
}
