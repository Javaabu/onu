"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { Icon } from "../../icons/icon"
import { cn } from "../../lib/utils"
import { useTranslation } from "../../providers/onu-provider"
import { readStorage, writeStorage } from "./_utils"
import { AppLink } from "./_link"
import { registerEnglish } from "../../i18n/english"
import { display as en_display } from "../../locales/en/display"

registerEnglish({ display: en_display })

export const announcementBarVariants = cva(
  "gap-x-3 gap-y-1 px-4 py-2 text-sm relative flex w-full flex-wrap items-center justify-center text-center",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground",
        neutral: "border-b bg-muted text-foreground",
        info: "bg-info text-info-foreground",
        warning: "bg-warning text-warning-foreground",
      },
    },
    defaultVariants: { variant: "primary" },
  },
)

const CHANGE_EVENT = "onu:announcement"

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange)
  window.addEventListener(CHANGE_EVENT, onChange)
  return () => {
    window.removeEventListener("storage", onChange)
    window.removeEventListener(CHANGE_EVENT, onChange)
  }
}

/** Whether an announcement with this id was dismissed earlier (persisted in `localStorage`). */
function useDismissed(storageKey: string | null) {
  return React.useSyncExternalStore(
    subscribe,
    () => (storageKey ? readStorage<boolean>(storageKey) === true : false),
    () => false,
  )
}

export interface AnnouncementBarProps
  extends React.ComponentProps<"div">, VariantProps<typeof announcementBarVariants> {
  /**
   * Identifies this announcement. When set, dismissing it is remembered in
   * `localStorage`, so it stays hidden on later visits. Change the id to show a
   * new announcement.
   */
  id?: string
  /** Optional link after the message. */
  href?: string
  linkText?: React.ReactNode
  /** Semantic icon name or node before the message. */
  icon?: string | React.ReactNode
  /** Shows a dismiss button. Default `true`. */
  dismissible?: boolean
  onDismiss?: () => void
  /** `localStorage` key prefix. */
  storagePrefix?: string
  classNames?: { message?: string; link?: string; dismiss?: string }
}

/**
 * A full-width bar at the top of the page for site-wide news ("Applications
 * close on 30 June"). Dismissible, and the dismissal persists when `id` is set.
 */
export function AnnouncementBar({
  id,
  href,
  linkText,
  icon,
  dismissible = true,
  onDismiss,
  storagePrefix = "onu-announcement:",
  variant,
  className,
  classNames,
  children,
  ...props
}: AnnouncementBarProps) {
  const { t } = useTranslation()
  const storageKey = id ? `${storagePrefix}${id}` : null
  const persisted = useDismissed(storageKey)
  const [dismissedNow, setDismissedNow] = React.useState(false)
  if (persisted || dismissedNow) return null

  const dismiss = () => {
    setDismissedNow(true)
    if (storageKey) {
      writeStorage(storageKey, true)
      window.dispatchEvent(new Event(CHANGE_EVENT))
    }
    onDismiss?.()
  }

  return (
    <div
      role="region"
      aria-label={t("display.announcement")}
      data-slot="announcement-bar"
      data-variant={variant ?? "primary"}
      className={cn(announcementBarVariants({ variant }), dismissible && "pe-12", className)}
      {...props}
    >
      <p className={cn("gap-2 inline-flex items-center", classNames?.message)}>
        {typeof icon === "string" ? <Icon name={icon} className="size-4 shrink-0" /> : icon}
        <span>{children}</span>
      </p>
      {href && linkText ? (
        <AppLink
          href={href}
          className={cn(
            "gap-1 font-medium inline-flex items-center rounded-sm underline underline-offset-4 outline-none hover:no-underline focus-visible:ring-2 focus-visible:ring-current",
            classNames?.link,
          )}
        >
          {linkText}
          <Icon name="arrow-right" className="size-3.5" />
        </AppLink>
      ) : null}
      {dismissible ? (
        <button
          type="button"
          data-slot="announcement-dismiss"
          onClick={dismiss}
          aria-label={t("display.dismiss")}
          className={cn(
            "end-2 size-8 touch:size-11 touch:end-0 absolute top-1/2 inline-flex -translate-y-1/2 items-center justify-center rounded-md outline-none hover:bg-current/10 focus-visible:ring-2 focus-visible:ring-current",
            classNames?.dismiss,
          )}
        >
          <Icon name="close" className="size-4" />
        </button>
      ) : null}
    </div>
  )
}
