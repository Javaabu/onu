"use client"

import * as React from "react"

import { cn } from "../../lib/utils"
import { useLinkComponent, useTranslation } from "../../providers/onu-provider"
import { buttonVariants, renderIcon, type ButtonSize, type ButtonVariant, type IconProp } from "./button"
import { registerEnglish } from "../../i18n/english"
import { form as en_form } from "../../locales/en/form"

registerEnglish({ form: en_form })

export interface LinkButtonProps extends Omit<React.ComponentProps<"a">, "href"> {
  href: string
  variant?: ButtonVariant
  size?: ButtonSize
  startIcon?: IconProp
  endIcon?: IconProp
  /** Open in a new tab (`target="_blank"`, safe `rel`) and tell screen readers so. */
  external?: boolean
  /** Render as a non-interactive, dimmed link (`aria-disabled`, no `href`). */
  disabled?: boolean
}

/**
 * A link styled as a button. Renders through the `linkComponent` from
 * `OnuProvider` (Inertia's or Next's `Link`, R16.2), or a plain `<a>`.
 */
export function LinkButton({
  href,
  variant = "default",
  size = "default",
  startIcon,
  endIcon,
  external = false,
  disabled = false,
  className,
  children,
  ref,
  ...props
}: LinkButtonProps) {
  const LinkComponent = useLinkComponent()
  const { t } = useTranslation()
  const classes = cn(buttonVariants({ variant, size }), disabled && "pointer-events-none opacity-50", className)
  const content = (
    <>
      {renderIcon(startIcon, "inline-start")}
      {children}
      {external ? <span className="sr-only"> {t("form.opensInNewTab")}</span> : null}
      {renderIcon(endIcon ?? (external ? "external-link" : undefined), "inline-end")}
    </>
  )
  const data = { "data-slot": "button", "data-variant": variant, "data-size": size }

  if (disabled) {
    return (
      <a ref={ref} role="link" aria-disabled="true" className={classes} {...data} {...props}>
        {content}
      </a>
    )
  }

  // createElement: the link component comes from context (Inertia/Next Link), it is not created here.
  return React.createElement(
    external ? "a" : LinkComponent,
    {
      ref,
      href,
      className: classes,
      ...(external ? { target: "_blank", rel: "noopener noreferrer" } : {}),
      ...data,
      ...props,
    },
    content,
  )
}
