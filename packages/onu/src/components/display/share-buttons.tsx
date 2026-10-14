"use client"

import * as React from "react"

import { Icon } from "../../icons/icon"
import { cn } from "../../lib/utils"
import { useTranslation } from "../../providers/onu-provider"
import { Button } from "../../ui/button"
import { useCopyToClipboard } from "./_utils"
import { registerEnglish } from "../../i18n/english"
import { display as en_display } from "../../locales/en/display"

registerEnglish({ display: en_display })

export type ShareNetwork = "copy" | "facebook" | "x" | "whatsapp" | "viber" | "telegram" | "email"

export const DEFAULT_SHARE_NETWORKS: ShareNetwork[] = [
  "copy",
  "facebook",
  "x",
  "whatsapp",
  "viber",
  "telegram",
  "email",
]

const ICONS: Record<ShareNetwork, string> = {
  copy: "link",
  facebook: "share",
  x: "share",
  whatsapp: "message",
  viber: "phone",
  telegram: "send",
  email: "mail",
}

/** The share URL for a network (`copy` has none). */
export function shareUrl(network: Exclude<ShareNetwork, "copy">, url: string, title = "", text = ""): string {
  const u = encodeURIComponent(url)
  const message = encodeURIComponent([title || text, url].filter(Boolean).join(" "))
  switch (network) {
    case "facebook":
      return `https://www.facebook.com/sharer/sharer.php?u=${u}`
    case "x":
      return `https://x.com/intent/post?url=${u}${title ? `&text=${encodeURIComponent(title)}` : ""}`
    case "whatsapp":
      return `https://wa.me/?text=${message}`
    case "viber":
      return `viber://forward?text=${message}`
    case "telegram":
      return `https://t.me/share/url?url=${u}${title ? `&text=${encodeURIComponent(title)}` : ""}`
    case "email":
      return `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent([text, url].filter(Boolean).join("\n\n"))}`
  }
}

function canNativeShare() {
  return typeof navigator !== "undefined" && typeof navigator.share === "function"
}

const noopSubscribe = () => () => {}

export interface ShareButtonsProps extends Omit<React.ComponentProps<"div">, "title"> {
  /** URL to share. Defaults to the current page. */
  url?: string
  title?: string
  text?: string
  /** Fallback networks, in order. */
  networks?: ShareNetwork[]
  /**
   * `auto` (default): one Share button using the device's share sheet (Web
   * Share API) when available, otherwise the network buttons. `always`: show
   * the network buttons as well. `never`: network buttons only.
   */
  native?: "auto" | "always" | "never"
  /** Icon-only buttons (labels stay as accessible names and tooltips). */
  iconOnly?: boolean
  /** Replace a network's icon (e.g. with a brand logo). */
  icons?: Partial<Record<ShareNetwork | "native", React.ReactNode>>
  size?: "sm" | "default" | "lg"
  variant?: "outline" | "ghost" | "secondary"
  /** Called after a share action (`native`, a network, or `copy`). */
  onShare?: (network: ShareNetwork | "native") => void
}

/**
 * Share a page: uses the device's share sheet where available, with copy-link,
 * Facebook, X, WhatsApp, Viber, Telegram and email as fallbacks.
 */
export function ShareButtons({
  url: urlProp,
  title,
  text,
  networks = DEFAULT_SHARE_NETWORKS,
  native = "auto",
  iconOnly = false,
  icons,
  size = "default",
  variant = "outline",
  onShare,
  className,
  ...props
}: ShareButtonsProps) {
  const { t } = useTranslation()
  const { copied, copy } = useCopyToClipboard()
  const hasNative = React.useSyncExternalStore(noopSubscribe, canNativeShare, () => false)
  const url = urlProp ?? (typeof window !== "undefined" ? window.location.href : "")
  const showNative = native !== "never" && hasNative
  const showNetworks = native !== "auto" || !hasNative
  const buttonSize = iconOnly ? (size === "sm" ? "icon-sm" : size === "lg" ? "icon-lg" : "icon") : size
  const touch = iconOnly ? "touch:size-11" : "touch:h-11"

  const shareNative = async () => {
    try {
      await navigator.share({ url, title, text })
      onShare?.("native")
    } catch {
      // Cancelled by the user, or the share target failed: nothing to do.
    }
  }

  const label = (network: ShareNetwork) => {
    if (network === "copy") return copied ? t("display.linkCopied") : t("display.copyLink")
    if (network === "email") return t("display.shareByEmail")
    return t("display.shareOn", { network: t(`display.${network}`) })
  }
  const visibleLabel = (network: ShareNetwork) =>
    network === "copy" ? label(network) : network === "email" ? t("display.email") : t(`display.${network}`)

  return (
    <div
      role="group"
      aria-label={t("display.share")}
      data-slot="share-buttons"
      className={cn("gap-2 flex flex-wrap items-center", className)}
      {...props}
    >
      {showNative ? (
        <Button
          type="button"
          variant={variant}
          size={buttonSize}
          className={touch}
          onClick={() => void shareNative()}
          aria-label={iconOnly ? t("display.share") : undefined}
        >
          {icons?.native ?? <Icon name="share" data-icon="inline-start" />}
          {iconOnly ? null : t("display.share")}
        </Button>
      ) : null}
      {showNetworks
        ? networks.map((network) =>
            network === "copy" ? (
              <Button
                key={network}
                type="button"
                variant={variant}
                size={buttonSize}
                className={touch}
                data-network={network}
                aria-label={iconOnly ? label(network) : undefined}
                onClick={() =>
                  void copy(url).then((ok) => {
                    if (ok) onShare?.("copy")
                  })
                }
              >
                {icons?.copy ?? <Icon name={copied ? "check" : ICONS.copy} data-icon="inline-start" />}
                {iconOnly ? null : visibleLabel(network)}
              </Button>
            ) : (
              <Button key={network} asChild variant={variant} size={buttonSize} className={touch}>
                <a
                  href={shareUrl(network, url, title, text)}
                  target={network === "email" ? undefined : "_blank"}
                  rel="noopener noreferrer"
                  data-network={network}
                  aria-label={label(network)}
                  title={iconOnly ? label(network) : undefined}
                  onClick={() => onShare?.(network)}
                >
                  {icons?.[network] ?? <Icon name={ICONS[network]} data-icon="inline-start" />}
                  {iconOnly ? null : visibleLabel(network)}
                </a>
              </Button>
            ),
          )
        : null}
      <span aria-live="polite" className="sr-only">
        {copied ? t("display.linkCopied") : ""}
      </span>
    </div>
  )
}
