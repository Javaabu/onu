"use client"

import * as React from "react"

import { Icon } from "../../icons/icon"
import { cn } from "../../lib/utils"
import { useTranslation } from "../../providers/onu-provider"

export type VideoProvider = "youtube" | "vimeo"

/** Finds the provider and video id in a YouTube or Vimeo URL (or returns `null`). */
export function parseVideoUrl(url: string): { provider: VideoProvider; id: string; start?: number } | null {
  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    return null
  }
  const host = parsed.hostname.replace(/^www\.|^m\./, "")
  const startParam = parsed.searchParams.get("t") ?? parsed.searchParams.get("start")
  const start = startParam ? parseInt(startParam, 10) || undefined : undefined
  if (host === "youtu.be") {
    const id = parsed.pathname.slice(1).split("/")[0]
    return id ? { provider: "youtube", id, start } : null
  }
  if (host === "youtube.com" || host === "youtube-nocookie.com") {
    const v = parsed.searchParams.get("v")
    if (v) return { provider: "youtube", id: v, start }
    const match = parsed.pathname.match(/^\/(?:embed|shorts|live|v)\/([\w-]+)/)
    return match?.[1] ? { provider: "youtube", id: match[1], start } : null
  }
  if (host === "vimeo.com" || host === "player.vimeo.com") {
    const match = parsed.pathname.match(/(\d{5,})/)
    return match?.[1] ? { provider: "vimeo", id: match[1] } : null
  }
  return null
}

/** Privacy-enhanced embed URL that starts playing (the user has already clicked play). */
export function videoEmbedUrl(provider: VideoProvider, id: string, { start }: { start?: number } = {}) {
  if (provider === "youtube") {
    const params = new URLSearchParams({ autoplay: "1", rel: "0", playsinline: "1" })
    if (start) params.set("start", String(start))
    return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?${params}`
  }
  return `https://player.vimeo.com/video/${encodeURIComponent(id)}?autoplay=1&dnt=1`
}

export interface VideoEmbedProps extends Omit<React.ComponentProps<"div">, "title"> {
  /** A YouTube or Vimeo URL. Or pass `provider` + `videoId`. */
  url?: string
  provider?: VideoProvider
  videoId?: string
  /** Video title: names the play button and the iframe (required for accessibility). */
  title: string
  /** Poster image. Defaults to YouTube's thumbnail; Vimeo needs one supplied. */
  thumbnail?: string
  /** Start time in seconds. */
  start?: number
  /** Width / height. Default `16 / 9`. */
  aspectRatio?: number
  /** Small print under the play button, e.g. a privacy note. */
  notice?: React.ReactNode
  classNames?: { button?: string; thumbnail?: string; play?: string; title?: string; iframe?: string }
}

/**
 * Click-to-load video embed (lite YouTube/Vimeo): shows a thumbnail and a play button, and
 * loads the privacy-enhanced player only when clicked, so nothing is fetched from the
 * provider before the user asks for it.
 */
export function VideoEmbed({
  url,
  provider: providerProp,
  videoId,
  title,
  thumbnail,
  start: startProp,
  aspectRatio = 16 / 9,
  notice,
  className,
  classNames,
  ...props
}: VideoEmbedProps) {
  const { t } = useTranslation()
  const [loaded, setLoaded] = React.useState(false)
  const parsed = url ? parseVideoUrl(url) : null
  const provider = providerProp ?? parsed?.provider
  const id = videoId ?? parsed?.id
  const start = startProp ?? parsed?.start
  const poster =
    thumbnail ??
    (provider === "youtube" && id ? `https://i.ytimg.com/vi/${encodeURIComponent(id)}/hqdefault.jpg` : undefined)

  const focusOnMount = React.useCallback((iframe: HTMLIFrameElement | null) => iframe?.focus(), [])

  return (
    <div
      data-slot="video-embed"
      data-provider={provider}
      data-state={loaded ? "loaded" : "idle"}
      className={cn("relative w-full overflow-hidden rounded-xl bg-muted", className)}
      style={{ aspectRatio: String(aspectRatio) }}
      {...props}
    >
      {loaded && provider && id ? (
        <iframe
          ref={focusOnMount}
          src={videoEmbedUrl(provider, id, { start })}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          className={cn("inset-0 absolute size-full border-0", classNames?.iframe)}
        />
      ) : (
        <button
          type="button"
          disabled={!provider || !id}
          aria-label={t("file.playVideo", { title })}
          onClick={() => setLoaded(true)}
          className={cn(
            "group/video inset-0 absolute flex size-full cursor-pointer flex-col items-center justify-center outline-none focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-inset disabled:cursor-not-allowed",
            classNames?.button,
          )}
        >
          {poster ? (
            <img
              src={poster}
              alt=""
              loading="lazy"
              decoding="async"
              className={cn("inset-0 absolute size-full object-cover", classNames?.thumbnail)}
            />
          ) : null}
          <span
            aria-hidden
            className="inset-x-0 top-0 h-24 absolute bg-gradient-to-b from-foreground/60 to-transparent dark:from-background/80"
          />
          <span
            dir="auto"
            className={cn(
              "inset-x-0 top-0 p-3 text-sm font-medium absolute line-clamp-2 text-start text-background dark:text-foreground",
              classNames?.title,
            )}
          >
            {title}
          </span>
          <span
            className={cn(
              "size-16 shadow-lg relative flex items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform group-hover/video:scale-105",
              classNames?.play,
            )}
          >
            <Icon name="play" size="xl" className="translate-x-0.5" />
          </span>
          {notice ? (
            <span className="inset-x-0 bottom-0 p-2 text-xs absolute bg-background/80 text-muted-foreground">
              {notice}
            </span>
          ) : null}
        </button>
      )}
    </div>
  )
}
