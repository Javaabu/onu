"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { Icon } from "../icons/icon"
import { cn } from "../lib/utils"
import { useOnu, useTranslation } from "../providers/onu-provider"
import { useIsDark, useMapColors } from "./_colors"
import { useMapContext } from "./_context"
import { formatLatLng, googleMapsUrl, staticMapUrl } from "./geo"
import { mapLanguage } from "./map-provider"
import type { LatLng } from "./types"

export const locationCardVariants = cva(
  "text-sm @container/location-card flex overflow-hidden rounded-xl border bg-card text-card-foreground",
  {
    variants: {
      layout: {
        vertical: "flex-col",
        horizontal: "@md/location-card:flex-row flex-col",
      },
    },
    defaultVariants: { layout: "vertical" },
  },
)

export interface LocationCardProps
  extends Omit<React.ComponentProps<"article">, "title">, VariantProps<typeof locationCardVariants> {
  position: LatLng
  /** Place name. */
  title?: React.ReactNode
  /** Address lines. */
  address?: React.ReactNode
  /** Google place id, makes the link open the exact place. */
  placeId?: string
  /** Zoom of the thumbnail. Default 15. */
  zoom?: number
  /** Show the map thumbnail. Default `true`. */
  thumbnail?: boolean
  /** Show coordinates under the address. Default `true`. */
  showCoordinates?: boolean
  /** Extra actions next to "Open in Google Maps". */
  actions?: React.ReactNode
  /** Google Maps API key for the static thumbnail. Defaults to MapProvider / OnuProvider. */
  apiKey?: string
  classNames?: { media?: string; body?: string; title?: string; address?: string; actions?: string }
}

/** A place at a glance: map thumbnail (or a placeholder), address and an "Open in Google Maps" link. */
export function LocationCard({
  position,
  title,
  address,
  placeId,
  zoom = 15,
  thumbnail = true,
  showCoordinates = true,
  actions,
  apiKey: apiKeyProp,
  layout,
  className,
  classNames,
  ...props
}: LocationCardProps) {
  const { t, locale } = useTranslation()
  const { maps } = useOnu()
  const ctx = useMapContext()
  const dark = useIsDark()
  const colors = useMapColors()
  const apiKey = apiKeyProp ?? ctx?.apiKey ?? maps.googleMapsApiKey
  const mapId = ctx?.mapId || (dark ? maps.darkMapId || maps.mapId : maps.mapId) || undefined
  const [failed, setFailed] = React.useState(false)
  const coords = formatLatLng(position, t, locale.numberLocale, 5)
  const place = typeof title === "string" ? title : coords
  const horizontal = layout === "horizontal"

  return (
    <article data-slot="location-card" className={cn(locationCardVariants({ layout }), className)} {...props}>
      {thumbnail ? (
        <div
          data-slot="location-card-media"
          className={cn(
            "relative aspect-[2/1] shrink-0 overflow-hidden bg-muted",
            horizontal && "@md/location-card:aspect-auto @md/location-card:w-2/5",
            classNames?.media,
          )}
        >
          {apiKey && !failed ? (
            <img
              src={staticMapUrl({
                apiKey,
                center: position,
                zoom,
                width: 640,
                height: 320,
                markerColor: colors.primary,
                mapId,
                language: mapLanguage(locale.code),
              })}
              alt={t("map.staticMapAlt", { place })}
              loading="lazy"
              className="size-full object-cover"
              onError={() => setFailed(true)}
            />
          ) : (
            <div
              role="img"
              aria-label={t("map.thumbnailUnavailable")}
              className="inset-0 gap-1 absolute flex flex-col items-center justify-center bg-[radial-gradient(var(--border)_1px,transparent_1px)] [background-size:16px_16px] text-muted-foreground"
            >
              <Icon name="map-pin" size="xl" className="text-primary" />
              <span className="text-xs">{t("map.thumbnailUnavailable")}</span>
            </div>
          )}
        </div>
      ) : null}
      <div className={cn("gap-1 p-4 min-w-0 flex flex-1 flex-col", classNames?.body)}>
        {title ? <h3 className={cn("font-medium text-base leading-snug", classNames?.title)}>{title}</h3> : null}
        {address ? (
          <address className={cn("text-muted-foreground not-italic", classNames?.address)}>{address}</address>
        ) : null}
        {showCoordinates ? (
          <p className="text-xs text-muted-foreground tabular-nums">
            <span className="sr-only">{t("map.coordinates")}: </span>
            {coords}
          </p>
        ) : null}
        <div className={cn("gap-3 mt-2 flex flex-wrap items-center", classNames?.actions)}>
          <a
            href={googleMapsUrl(position, placeId)}
            target="_blank"
            rel="noreferrer"
            className="gap-1 font-medium inline-flex items-center text-primary underline-offset-4 hover:underline"
          >
            <Icon name="map-pin" size="sm" />
            {t("map.openInGoogleMaps")}
            <span className="sr-only">
              {" "}
              {place !== coords ? `(${place}) ` : null}
              {t("map.opensInNewTab")}
            </span>
          </a>
          {actions}
        </div>
      </div>
    </article>
  )
}
