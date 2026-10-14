"use client"

import * as React from "react"
import { Loader2Icon } from "lucide-react"

import { Icon } from "../../icons/icon"
import { cn } from "../../lib/utils"
import { useTranslation } from "../../providers/onu-provider"

/*
 * "Sign in with eFaas" button (R16.7), after the eFaas brand guide
 * (https://efaas.egov.mv/Home/Branding):
 * - colours from the eFaas palette only: blue #164998, black #333333,
 *   grey #d0d2d3 and white; no custom button colours;
 * - Poppins Medium for the label (Mv Waheed for Dhivehi), used when the app
 *   loads those fonts, with the app's sans-serif as the fallback;
 * - the exact "Sign in with eFaas" / "Register with eFaas" wording;
 * - the icon and label keep their order and position; only the corners
 *   (rounded or square) and the side padding may change;
 * - the black button is not for dark backgrounds.
 * Onu does not draw the eFaas logomark: pass the icon from eFaas's brand kit
 * as `logo`.
 */

export type EfaasButtonVariant = "blue" | "black" | "white"

const VARIANTS: Record<EfaasButtonVariant, string> = {
  blue: "bg-[#164998] text-white hover:bg-[#164998]/90 border-[#164998]",
  black: "bg-[#333333] text-white hover:bg-[#333333]/90 border-[#333333]",
  white: "bg-white text-[#164998] hover:bg-[#d0d2d3]/30 border-[#d0d2d3]",
}

const SIZES = {
  default: "h-10 gap-2.5 px-5 text-sm touch:min-h-11 [&_[data-slot=efaas-logo]]:size-5",
  lg: "h-12 gap-3 px-6 text-base [&_[data-slot=efaas-logo]]:size-6",
} as const

interface EfaasButtonBaseProps {
  /** Which wording to use: "Sign in with eFaas" (default) or "Register with eFaas". */
  intent?: "sign-in" | "register"
  /** One of the eFaas colour variations. Default `"blue"`; use `"white"` on dark or blue backgrounds. */
  variant?: EfaasButtonVariant
  size?: keyof typeof SIZES
  /** Corner style, the one shape change the guide allows. Default `"rounded"`. */
  shape?: "rounded" | "square"
  /** The eFaas icon from eFaas's brand kit (an `<img>` or inline SVG). Sized to the button. */
  logo?: React.ReactNode
  /** Only the icon, with the wording as the accessible name. Needs `logo` (ignored without one). */
  iconOnly?: boolean
  /** Stretch to the container's width (e.g. under a sign-in form). */
  fullWidth?: boolean
  /** Show a spinner and "Redirecting to eFaas…" while the app hands over to eFaas. */
  loading?: boolean
  /** Replace the label, e.g. for a project-approved translation. */
  children?: React.ReactNode
  className?: string
}

export type EfaasButtonProps = EfaasButtonBaseProps &
  (
    | ({ href: string } & Omit<React.ComponentProps<"a">, "href" | "children" | "className">)
    | ({ href?: undefined } & Omit<React.ComponentProps<"button">, "children" | "className">)
  )

/**
 * The "Sign in with eFaas" button, styled after the eFaas brand guide. With
 * `href` it is a plain link (a full-page redirect to your eFaas login route,
 * never a client-side visit); otherwise a button.
 */
export function EfaasButton({
  intent = "sign-in",
  variant = "blue",
  size = "default",
  shape = "rounded",
  logo,
  iconOnly: iconOnlyProp = false,
  fullWidth = false,
  loading = false,
  children,
  className,
  ...props
}: EfaasButtonProps) {
  const { t, locale } = useTranslation()
  const text = children ?? t(intent === "register" ? "auth.efaasRegister" : "auth.efaasSignIn")
  const label = loading ? t("auth.efaasRedirecting") : text
  const dv = locale.code === "dv"
  // Icon-only needs the logo; without one the label stays visible.
  const iconOnly = iconOnlyProp && !!logo

  const classes = cn(
    "font-medium relative inline-flex shrink-0 items-center justify-center border whitespace-nowrap transition-colors outline-none select-none",
    "focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    "disabled:pointer-events-none disabled:opacity-60 aria-disabled:pointer-events-none aria-disabled:opacity-60",
    VARIANTS[variant],
    SIZES[size],
    shape === "rounded" ? "rounded-md" : "rounded-none",
    iconOnly && (size === "lg" ? "w-12 px-0" : "w-10 touch:min-w-11 px-0"),
    fullWidth && !iconOnly && "w-full",
    loading && "cursor-progress",
    className,
  )
  const style: React.CSSProperties = {
    fontFamily: dv ? '"MV Waheed", var(--font-thaana, var(--font-sans))' : "Poppins, var(--font-sans)",
  }
  const content = (
    <>
      {loading ? (
        <Icon name="loading" fallback={Loader2Icon} data-slot="efaas-logo" className="animate-spin" />
      ) : logo ? (
        <span data-slot="efaas-logo" aria-hidden="true" className="inline-flex shrink-0 [&>*]:size-full">
          {logo}
        </span>
      ) : null}
      {iconOnly ? <span className="sr-only">{label}</span> : <span>{label}</span>}
    </>
  )
  const data = { "data-slot": "efaas-button", "data-variant": variant, "data-intent": intent }

  if (props.href !== undefined) {
    const { href, onClick, ...rest } = props as React.ComponentProps<"a"> & { href: string }
    return (
      <a
        {...data}
        {...rest}
        href={loading ? undefined : href}
        role={loading ? "link" : undefined}
        aria-disabled={loading || undefined}
        aria-busy={loading || undefined}
        onClick={onClick}
        className={classes}
        style={{ ...style, ...rest.style }}
      >
        {content}
      </a>
    )
  }
  const { type, onClick, ...rest } = props as React.ComponentProps<"button">
  return (
    <button
      {...data}
      {...rest}
      type={type ?? "button"}
      aria-disabled={loading || undefined}
      aria-busy={loading || undefined}
      onClick={(event) => {
        if (loading) {
          event.preventDefault()
          return
        }
        onClick?.(event)
      }}
      className={classes}
      style={{ ...style, ...rest.style }}
    >
      {content}
    </button>
  )
}
