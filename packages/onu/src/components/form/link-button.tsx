"use client"

import * as React from "react"
import { Slot } from "radix-ui"

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
  /**
   * Render the child element as the link: it gets the `href`, classes and icons.
   * With `disabled` only the child's content is rendered, in a dimmed `<a>` with no `href`.
   */
  asChild?: boolean
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
  asChild = false,
  className,
  children,
  ref,
  ...props
}: LinkButtonProps) {
  const LinkComponent = useLinkComponent()
  const { t } = useTranslation()
  const classes = cn(buttonVariants({ variant, size }), disabled && "pointer-events-none opacity-50", className)
  const start = renderIcon(startIcon, "inline-start")
  const newTab = external ? <span className="sr-only"> {t("form.opensInNewTab")}</span> : null
  const end = renderIcon(endIcon ?? (external ? "external-link" : undefined), "inline-end")
  const data = { "data-slot": "button", "data-variant": variant, "data-size": size }

  if (disabled) {
    const text =
      asChild && React.isValidElement<{ children?: React.ReactNode }>(children) ? children.props.children : children
    return (
      <a ref={ref} role="link" aria-disabled="true" className={classes} {...data} {...props}>
        {start}
        {text}
        {newTab}
        {end}
      </a>
    )
  }

  const link = {
    ref,
    href,
    className: classes,
    ...(external ? { target: "_blank", rel: "noopener noreferrer" } : {}),
    ...data,
    ...props,
  }

  if (asChild) {
    return (
      <Slot.Root {...link}>
        {start}
        <Slot.Slottable>{children}</Slot.Slottable>
        {newTab}
        {end}
      </Slot.Root>
    )
  }

  // createElement: the link component comes from context (Inertia/Next Link), it is not created here.
  return React.createElement(
    external ? "a" : LinkComponent,
    link,
    <>
      {start}
      {children}
      {newTab}
      {end}
    </>,
  )
}
