"use client"

import { useTranslation } from "../../providers/onu-provider"
import { Button, type ButtonProps } from "./button"
import { useOnuForm } from "./form"

export interface SubmitButtonProps extends Omit<ButtonProps, "type" | "loading"> {
  /** Show the spinner and block submits. Defaults to the enclosing `Form`'s processing state. */
  processing?: boolean
}

/**
 * A submit button that shows a spinner and `aria-busy` while the form is
 * processing, and ignores clicks until it is done (no double submits, §25.9).
 */
export function SubmitButton({ processing: processingProp, children, startIcon, ...props }: SubmitButtonProps) {
  const { t } = useTranslation()
  const form = useOnuForm()
  const processing = processingProp ?? form?.processing ?? false
  return (
    <Button type="submit" data-submit="" loading={processing} startIcon={startIcon} {...props}>
      {children ?? t("form.submit")}
    </Button>
  )
}
