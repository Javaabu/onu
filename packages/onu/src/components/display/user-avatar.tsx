"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { Icon } from "../../icons/icon"
import { cn } from "../../lib/utils"
import { useTranslation } from "../../providers/onu-provider"
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar"

const THAANA = /[ހ-޿]/

function graphemes(word: string): string[] {
  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    const segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" })
    return Array.from(segmenter.segment(word), (s) => s.segment)
  }
  /* v8 ignore next 2 -- every supported browser has Intl.Segmenter */
  return word.match(/[ހ-ޥ][ަ-ް]*|./gu) ?? []
}

/** First letter of a word, keeping Thaana vowel signs (fili) with their consonant. */
function initial(word: string): string {
  const clusters = graphemes(word)
  const first = clusters.find((c) => /\p{L}/u.test(c))
  if (!first) return ""
  if (THAANA.test(first)) {
    // Intl.Segmenter keeps fili with the consonant; the regex fallback does too.
    const index = clusters.indexOf(first)
    let out = first
    for (const next of clusters.slice(index + 1)) {
      if (/^[ަ-ް]+$/.test(next)) out += next
      else break
    }
    return out
  }
  return first.toLocaleUpperCase()
}

/**
 * Initials for a person's name: the first letters of the first and last words.
 * Works with English and Dhivehi (Thaana) names, e.g. "Ahmed Ali" → "AA",
 * "އަޙްމަދު ޢަލީ" → "އަޢަ". Ignores punctuation such as "(Ali)" or "Mr.".
 */
export function getInitials(name: string | null | undefined, max = 2): string {
  const words = (name ?? "")
    .trim()
    .split(/[\s\-_.]+/u)
    .map((w) => w.replace(/[^\p{L}\p{M}\p{N}]/gu, ""))
    .filter(Boolean)
  if (words.length === 0) return ""
  const picked = words.length === 1 || max === 1 ? [words[0]!] : [words[0]!, words[words.length - 1]!]
  return picked
    .map(initial)
    .join("")
    .slice(0, max * 4)
}

export const userAvatarVariants = cva("", {
  variants: {
    size: {
      xs: "size-6 text-[0.625rem]",
      sm: "size-8 text-xs",
      md: "size-10 text-sm",
      lg: "size-12 text-base",
      xl: "size-16 text-lg",
    },
    shape: {
      circle: "rounded-full after:rounded-full",
      square: "rounded-lg after:rounded-lg",
    },
  },
  defaultVariants: { size: "md", shape: "circle" },
})

export type Presence = "online" | "offline" | "busy" | "away"

const PRESENCE_CLASSES: Record<Presence, string> = {
  online: "bg-success",
  offline: "bg-muted-foreground",
  busy: "bg-destructive",
  away: "bg-warning",
}

const PRESENCE_LABELS: Record<Presence, string> = {
  online: "display.presenceOnline",
  offline: "display.presenceOffline",
  busy: "display.presenceBusy",
  away: "display.presenceAway",
}

const DOT_SIZES = { xs: "size-2", sm: "size-2.5", md: "size-3", lg: "size-3.5", xl: "size-4" } as const

export interface UserAvatarProps
  extends Omit<React.ComponentProps<typeof Avatar>, "size" | "children">, VariantProps<typeof userAvatarVariants> {
  /** The person's name: used for initials and as the accessible name. */
  name?: string | null
  /** Image URL. Falls back to initials when missing or broken. */
  src?: string | null
  /** Alt text for the image. Defaults to `name`. */
  alt?: string
  /** Presence dot. Shown with a text alternative for screen readers. */
  status?: Presence
  /** Hide the avatar from screen readers (when the name is already next to it). */
  decorative?: boolean
  /** Content for the fallback instead of initials. */
  fallback?: React.ReactNode
  classNames?: { image?: string; fallback?: string; status?: string }
}

/**
 * A person's picture with an initials fallback that handles English and Dhivehi
 * names, sizes and an optional presence dot. Extends shadcn's `Avatar`.
 */
export function UserAvatar({
  name,
  src,
  alt,
  size,
  shape,
  status,
  decorative = false,
  fallback,
  className,
  classNames,
  ...props
}: UserAvatarProps) {
  const { t } = useTranslation()
  const initials = getInitials(name)
  const isThaana = THAANA.test(initials)
  const statusLabel = status ? t(PRESENCE_LABELS[status]) : undefined
  const label = [name, statusLabel].filter(Boolean).join(", ")

  return (
    <span
      data-slot="user-avatar"
      className={cn("relative inline-flex shrink-0 align-middle", className)}
      {...(decorative || !label ? { "aria-hidden": decorative || undefined } : { role: "img", "aria-label": label })}
    >
      <Avatar className={cn(userAvatarVariants({ size, shape }))} {...props}>
        {src ? (
          <AvatarImage
            src={src}
            alt={alt ?? name ?? ""}
            className={cn(shape === "square" && "rounded-lg", classNames?.image)}
          />
        ) : null}
        <AvatarFallback
          delayMs={src ? 600 : undefined}
          lang={isThaana ? "dv" : undefined}
          className={cn(
            "font-medium",
            shape === "square" && "rounded-lg",
            isThaana && "font-thaana",
            classNames?.fallback,
          )}
        >
          {fallback ?? (initials || <Icon name="user" className="size-1/2" />)}
        </AvatarFallback>
      </Avatar>
      {status ? (
        <span
          data-slot="user-avatar-status"
          data-status={status}
          className={cn(
            "bottom-0 end-0 absolute rounded-full ring-2 ring-background",
            DOT_SIZES[size ?? "md"],
            PRESENCE_CLASSES[status],
            classNames?.status,
          )}
        />
      ) : null}
    </span>
  )
}
