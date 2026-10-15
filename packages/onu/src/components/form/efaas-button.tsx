"use client"

import * as React from "react"
import { Loader2Icon } from "lucide-react"

import { Icon } from "../../icons/icon"
import { cn } from "../../lib/utils"
import { registerEnglish } from "../../i18n/english"
import { auth as en_auth } from "../../locales/en/auth"
import { useTranslation } from "../../providers/onu-provider"
import { EFAAS_LOGO_VARIANTS, EfaasLogo, type EfaasLogoVariant } from "./efaas-logo"

registerEnglish({ auth: en_auth })

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
 * The logo is one of the 22 official eFaas logos (`EfaasLogo`), chosen with
 * `logoVariant`.
 */

export type EfaasButtonVariant = "blue" | "black" | "white"

const VARIANTS: Record<EfaasButtonVariant, string> = {
  blue: "bg-[#164998] text-white hover:bg-[#164998]/90 border-[#164998]",
  black: "bg-[#333333] text-white hover:bg-[#333333]/90 border-[#333333]",
  white: "bg-white text-[#164998] hover:bg-[#d0d2d3]/30 border-[#d0d2d3]",
}

/** The icon mark made for each button colour. */
const DEFAULT_LOGO: Record<EfaasButtonVariant, EfaasLogoVariant> = { blue: 15, black: 14, white: 9 }

const SIZES = {
  default: "h-10 gap-2.5 px-5 text-sm touch:min-h-11 [&_[data-slot=efaas-button-icon]]:size-5",
  lg: "h-12 gap-3 px-6 text-base [&_[data-slot=efaas-button-icon]]:size-6",
} as const

interface EfaasButtonBaseProps {
  /** Which wording to use: "Sign in with eFaas" (default) or "Register with eFaas". */
  intent?: "sign-in" | "register"
  /** One of the eFaas colour variations. Default `"blue"`; use `"white"` on dark or blue backgrounds. */
  variant?: EfaasButtonVariant
  size?: keyof typeof SIZES
  /** Corner style, the one shape change the guide allows. Default `"rounded"`. */
  shape?: "rounded" | "square"
  /**
   * Which official eFaas logo to show, 1–22 (see `EfaasLogo`). The icon marks
   * (9, 10, 11, 14, 15) sit before the label; any other variant already spells
   * "eFaas", so it replaces the label (which stays the accessible name).
   * Defaults to the icon made for the button's colour: 15 on blue, 14 on black,
   * 9 on white. `"none"` shows the label alone.
   */
  logoVariant?: EfaasLogoVariant | "none"
  /** A custom logo node instead of `logoVariant` (sized like the icon marks). */
  logo?: React.ReactNode
  /** Only the icon, with the wording as the accessible name. Needs an icon logo (ignored otherwise). */
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
  logoVariant,
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
  const chosen = logoVariant ?? DEFAULT_LOGO[variant]
  const official = logo === undefined && chosen !== "none" ? chosen : undefined
  // A logo with the wordmark replaces the visible label; the icon marks go before it.
  const wordmark = official !== undefined && EFAAS_LOGO_VARIANTS[official].layout !== "icon" && !loading
  const stacked = wordmark && EFAAS_LOGO_VARIANTS[official].layout === "stacked"
  const icon: React.ReactNode =
    logo ?? (official !== undefined && !wordmark ? <EfaasLogo variant={official} decorative /> : null)
  // Icon-only needs an icon; without one the label stays visible.
  const iconOnly = iconOnlyProp && !!icon && !wordmark

  const classes = cn(
    "font-medium relative inline-flex shrink-0 items-center justify-center border whitespace-nowrap transition-colors outline-none select-none",
    "focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    "disabled:pointer-events-none disabled:opacity-60 aria-disabled:pointer-events-none aria-disabled:opacity-60",
    VARIANTS[variant],
    SIZES[size],
    shape === "rounded" ? "rounded-md" : "rounded-none",
    iconOnly && (size === "lg" ? "w-12 px-0" : "w-10 touch:min-w-11 px-0"),
    wordmark && (size === "lg" ? "px-5" : "px-4"),
    stacked && "py-2.5 h-auto",
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
        <Icon name="loading" fallback={Loader2Icon} data-slot="efaas-button-icon" className="animate-spin" />
      ) : wordmark ? (
        <EfaasLogo
          variant={official}
          decorative
          className={
            stacked
              ? size === "lg"
                ? "h-24"
                : "h-20"
              : EFAAS_LOGO_VARIANTS[official].layout === "tagline"
                ? size === "lg"
                  ? "h-9"
                  : "h-7"
                : size === "lg"
                  ? "h-8"
                  : "h-6"
          }
        />
      ) : icon ? (
        <span data-slot="efaas-button-icon" aria-hidden="true" className="inline-flex shrink-0 [&>*]:size-full">
          {icon}
        </span>
      ) : null}
      {iconOnly || wordmark ? <span className="sr-only">{label}</span> : <span>{label}</span>}
    </>
  )
  const data = {
    "data-slot": "efaas-button",
    "data-variant": variant,
    "data-intent": intent,
    "data-logo-variant": official,
  }

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
