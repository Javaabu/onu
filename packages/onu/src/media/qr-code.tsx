"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { encode } from "uqr"

import { LiveRegion } from "../a11y/live-region"
import { useCopy } from "../components/inputs/_shared"
import { Icon } from "../icons/icon"
import { cn } from "../lib/utils"
import { useTranslation } from "../providers/onu-provider"
import { Button } from "../ui/button"
import { registerEnglish } from "../i18n/english"
import { file as en_file } from "../locales/en/file"

registerEnglish({ file: en_file })

/** Error-correction level: L ≈ 7%, M ≈ 15%, Q ≈ 25%, H ≈ 30% of the code can be damaged or covered. */
export type QrCodeLevel = "L" | "M" | "Q" | "H"

export type QrCodeDownloadFormat = "png" | "svg"

/** The encoded QR code: a square of modules (`true` = dark), without the quiet zone. */
export interface QrCodeMatrix {
  modules: boolean[][]
  /** Modules per side. */
  size: number
  /** QR version (1–40). */
  version: number
  level: QrCodeLevel
}

/** A square area in module units, measured from the top-left of the code (without quiet zone). */
export interface QrCodeBox {
  x: number
  y: number
  size: number
}

export interface QrCodeLogo {
  /** Image URL. For PNG downloads it must allow CORS, or it is left out of the PNG. */
  src: string
  /** Width of the logo area as a fraction of the code width, 0.1–0.3. Default `0.22`. */
  size?: number
  /** Clear the modules behind the logo. Default `true`. */
  excavate?: boolean
}

/** Encodes text (UTF-8, so Thaana works) into a QR matrix. Throws a `RangeError` when it does not fit. */
export function encodeQrCode(value: string, level: QrCodeLevel = "M"): QrCodeMatrix {
  const result = encode(value, { ecc: level, border: 0 })
  return { modules: result.data, size: result.size, version: result.version, level }
}

/** The centred logo area for a code of `size` modules, kept on the module grid. */
export function qrLogoBox(size: number, ratio = 0.22): QrCodeBox {
  const clamped = Math.min(Math.max(ratio, 0.1), 0.3)
  let box = Math.max(1, Math.round(size * clamped))
  if ((size - box) % 2) box += 1
  const start = (size - box) / 2
  return { x: start, y: start, size: box }
}

const inBox = (box: QrCodeBox | undefined, x: number, y: number) =>
  !!box && x >= box.x && x < box.x + box.size && y >= box.y && y < box.y + box.size

/**
 * An SVG path for the dark modules, merged into horizontal runs. `offset` shifts
 * it by the quiet zone; modules inside `skip` (the logo area) are left out.
 */
export function qrCodePath(modules: boolean[][], offset = 0, skip?: QrCodeBox): string {
  let d = ""
  modules.forEach((row, y) => {
    let x = 0
    while (x < row.length) {
      if (!row[x] || inBox(skip, x, y)) {
        x++
        continue
      }
      const start = x
      while (x < row.length && row[x] && !inBox(skip, x, y)) x++
      const run = x - start
      d += `M${start + offset} ${y + offset}h${run}v1h-${run}z`
    }
  })
  return d
}

/** The area the logo image is drawn in: the logo box with one module of margin when there is room. */
function logoImageBox(box: QrCodeBox): QrCodeBox {
  const inset = box.size >= 5 ? 1 : 0
  return { x: box.x + inset, y: box.y + inset, size: box.size - inset * 2 }
}

export interface QrCodeRenderOptions {
  /** Light modules around the code, in modules. Default `4`. */
  quietZone?: number
  /** Dark module colour. Default `"black"`. */
  foreground?: string
  /** Background colour. Default `"white"`. */
  background?: string
  logo?: { src: string; box: QrCodeBox; excavate?: boolean }
}

const escapeAttr = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;")

/** A standalone SVG document for the matrix (what the SVG download contains). */
export function qrCodeToSvg(
  matrix: QrCodeMatrix,
  { quietZone = 4, foreground = "black", background = "white", logo }: QrCodeRenderOptions = {},
): string {
  const total = matrix.size + quietZone * 2
  const skip = logo && logo.excavate !== false ? logo.box : undefined
  const path = qrCodePath(matrix.modules, quietZone, skip)
  let image = ""
  if (logo) {
    const box = logoImageBox(logo.box)
    image = `<image href="${escapeAttr(logo.src)}" x="${box.x + quietZone}" y="${box.y + quietZone}" width="${box.size}" height="${box.size}" preserveAspectRatio="xMidYMid meet"/>`
  }
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${total} ${total}" shape-rendering="crispEdges">` +
    `<rect width="${total}" height="${total}" fill="${escapeAttr(background)}"/>` +
    `<path d="${path}" fill="${escapeAttr(foreground)}"/>` +
    image +
    `</svg>`
  )
}

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => resolve(img)
    img.onerror = () => resolve(null)
    img.src = src
  })
}

/**
 * Draws the matrix on a canvas and returns a PNG blob about `pixels` wide
 * (rounded to whole pixels per module). The logo is drawn when it loads
 * with CORS; otherwise the PNG has the cleared area only.
 */
export async function qrCodeToPng(
  matrix: QrCodeMatrix,
  {
    quietZone = 4,
    foreground = "black",
    background = "white",
    logo,
    pixels = 1024,
  }: QrCodeRenderOptions & {
    pixels?: number
  } = {},
): Promise<Blob> {
  const total = matrix.size + quietZone * 2
  const scale = Math.max(1, Math.round(pixels / total))
  const canvas = document.createElement("canvas")
  canvas.width = canvas.height = total * scale
  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("Canvas is not available")
  ctx.fillStyle = background
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = foreground
  const skip = logo && logo.excavate !== false ? logo.box : undefined
  matrix.modules.forEach((row, y) =>
    row.forEach((dark, x) => {
      if (dark && !inBox(skip, x, y)) ctx.fillRect((x + quietZone) * scale, (y + quietZone) * scale, scale, scale)
    }),
  )
  if (logo) {
    const img = await loadImage(logo.src)
    if (img) {
      const box = logoImageBox(logo.box)
      const area = box.size * scale
      const ratio = Math.min(area / (img.naturalWidth || area), area / (img.naturalHeight || area))
      const w = (img.naturalWidth || area) * ratio
      const h = (img.naturalHeight || area) * ratio
      const x = (box.x + quietZone) * scale + (area - w) / 2
      const y = (box.y + quietZone) * scale + (area - h) / 2
      try {
        ctx.drawImage(img, x, y, w, h)
      } catch {
        // A decode failure leaves the cleared area; the code still scans at level H.
      }
    }
  }
  return new Promise((resolve, reject) => {
    try {
      canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("PNG export failed"))), "image/png")
    } catch (error) {
      // A tainted canvas (logo without CORS) cannot be exported.
      reject(error)
    }
  })
}

function saveBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.rel = "noopener"
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 0)
}

function isTransparent(color: string) {
  return !color || color === "transparent" || /^rgba\(.*,\s*0\)$/.test(color) || /\/\s*0%?\s*\)$/.test(color)
}

/**
 * Converts any CSS colour (e.g. the theme's `oklch(...)`) to `#rrggbb` by painting one pixel,
 * so downloaded files open in viewers that only know sRGB. Returns the input when there is no canvas.
 */
export function toHexColor(color: string): string {
  try {
    const ctx = document.createElement("canvas").getContext("2d", { willReadFrequently: true })
    if (!ctx) return color
    ctx.fillStyle = "#000"
    ctx.fillStyle = color
    ctx.fillRect(0, 0, 1, 1)
    const [r = 0, g = 0, b = 0] = ctx.getImageData(0, 0, 1, 1).data
    return `#${[r, g, b].map((n) => n.toString(16).padStart(2, "0")).join("")}`
  } catch {
    return color
  }
}

export const qrCodeVariants = cva("block h-auto max-w-full shrink-0 rounded-md", {
  variants: {
    /**
     * `contrast` keeps dark modules on a light ground in both themes (scans everywhere);
     * `theme` follows the theme (light modules on dark in dark mode);
     * `transparent` has no background and uses the current text colour.
     */
    tone: {
      contrast: "bg-background text-foreground dark:bg-foreground dark:text-background",
      theme: "bg-background text-foreground",
      transparent: "bg-transparent",
    },
  },
  defaultVariants: { tone: "contrast" },
})

export interface QrCodeProps
  extends Omit<React.ComponentProps<"div">, "children" | "onCopy">, VariantProps<typeof qrCodeVariants> {
  /** Text to encode: a URL, reference number, payment string… */
  value: string
  /** Rendered width and height in CSS pixels. Default `160`; shrinks to fit narrow containers. */
  size?: number
  /** Error-correction level. Default `"M"`; always `"H"` when there is a logo. */
  level?: QrCodeLevel
  /** Light margin around the code, in modules. Default `4` (the QR standard). */
  quietZone?: number
  /** An image in the centre. Forces error-correction level `H`. */
  logo?: string | QrCodeLogo
  /** Accessible name. Default "QR code". `aria-label` works too. */
  label?: string
  /** Show the encoded text under the code. */
  showValue?: boolean
  /** Text under the code, e.g. "Scan to verify". */
  caption?: React.ReactNode
  /** Show download buttons: `true` for PNG and SVG, or a list of formats. */
  download?: boolean | QrCodeDownloadFormat[]
  /** Show a button that copies the encoded text. */
  copyable?: boolean
  /** File name for downloads, without extension. Default `"qr-code"`. */
  filename?: string
  /** Approximate width of the PNG download in pixels. Default `1024`. */
  downloadSize?: number
  onCopy?: (value: string) => void
  onDownload?: (format: QrCodeDownloadFormat, blob: Blob) => void
  classNames?: { svg?: string; caption?: string; value?: string; actions?: string; button?: string; error?: string }
}

/**
 * QR code generator. Encodes with `uqr` and renders the SVG itself, so the
 * modules use `currentColor` and follow theme tokens. Optional centre logo
 * (forcing level H), PNG/SVG download and copy buttons.
 */
export function QrCode({
  value,
  size = 160,
  level = "M",
  quietZone = 4,
  logo,
  label,
  showValue = false,
  caption,
  download = false,
  copyable = false,
  filename = "qr-code",
  downloadSize = 1024,
  tone,
  onCopy,
  onDownload,
  className,
  classNames,
  style,
  "aria-label": ariaLabel,
  ...props
}: QrCodeProps) {
  const { t } = useTranslation()
  const svgRef = React.useRef<SVGSVGElement>(null)
  const { status, copy } = useCopy()
  const [busy, setBusy] = React.useState<QrCodeDownloadFormat | null>(null)
  const logoOptions = typeof logo === "string" ? { src: logo } : logo
  const effectiveLevel: QrCodeLevel = logoOptions ? "H" : level
  const zone = Math.max(0, Math.round(quietZone))

  const matrix = React.useMemo(() => {
    try {
      return encodeQrCode(value, effectiveLevel)
    } catch {
      return null
    }
  }, [value, effectiveLevel])

  const box = matrix && logoOptions ? qrLogoBox(matrix.size, logoOptions.size) : undefined
  const logoRender = box && logoOptions ? { src: logoOptions.src, box, excavate: logoOptions.excavate } : undefined
  const name = label ?? ariaLabel ?? t("file.qrCode")
  const formats: QrCodeDownloadFormat[] = download === true ? ["png", "svg"] : download || []

  const colours = () => {
    const computed = svgRef.current ? getComputedStyle(svgRef.current) : null
    const foreground = computed?.color || "black"
    const bg = computed?.backgroundColor ?? ""
    return { foreground: toHexColor(foreground), background: isTransparent(bg) ? "#ffffff" : toHexColor(bg) }
  }

  const save = async (format: QrCodeDownloadFormat) => {
    if (!matrix) return
    setBusy(format)
    try {
      const options = { quietZone: zone, logo: logoRender, ...colours() }
      const blob =
        format === "svg"
          ? new Blob([qrCodeToSvg(matrix, options)], { type: "image/svg+xml" })
          : await qrCodeToPng(matrix, { ...options, pixels: downloadSize })
      saveBlob(blob, `${filename}.${format}`)
      onDownload?.(format, blob)
    } catch {
      // Export can fail (no canvas, a tainted canvas); the on-screen code is unaffected.
    } finally {
      setBusy(null)
    }
  }

  const total = matrix ? matrix.size + zone * 2 : 0
  const imageBox = logoRender ? logoImageBox(logoRender.box) : undefined

  return (
    <div
      data-slot="qr-code"
      data-level={matrix ? effectiveLevel : undefined}
      data-version={matrix?.version}
      data-modules={matrix?.size}
      className={cn("gap-2 inline-flex max-w-full flex-col items-center", className)}
      style={{ "--onu-qr-size": `${size}px`, ...style } as React.CSSProperties}
      {...props}
    >
      {matrix ? (
        <svg
          ref={svgRef}
          role="img"
          aria-label={name}
          data-slot="qr-code-svg"
          viewBox={`0 0 ${total} ${total}`}
          width={size}
          height={size}
          shapeRendering="crispEdges"
          className={cn(qrCodeVariants({ tone }), classNames?.svg)}
        >
          <path
            d={qrCodePath(matrix.modules, zone, logoRender?.excavate !== false ? logoRender?.box : undefined)}
            fill="currentColor"
          />
          {logoRender && imageBox ? (
            <image
              data-slot="qr-code-logo"
              href={logoRender.src}
              x={imageBox.x + zone}
              y={imageBox.y + zone}
              width={imageBox.size}
              height={imageBox.size}
              preserveAspectRatio="xMidYMid meet"
            />
          ) : null}
        </svg>
      ) : (
        <p
          role="alert"
          data-slot="qr-code-error"
          className={cn(
            "gap-2 p-3 text-sm flex aspect-square w-(--onu-qr-size) max-w-full items-center justify-center rounded-md border border-dashed border-destructive/50 text-center text-destructive",
            classNames?.error,
          )}
        >
          <Icon name="warning" className="size-4 shrink-0" />
          {t("file.qrTooLong")}
        </p>
      )}

      {caption ? (
        <p
          data-slot="qr-code-caption"
          className={cn("text-xs max-w-(--onu-qr-size) text-center text-muted-foreground", classNames?.caption)}
        >
          {caption}
        </p>
      ) : null}
      {showValue ? (
        <p
          dir="auto"
          data-slot="qr-code-value"
          className={cn("text-xs max-w-(--onu-qr-size) text-center font-mono break-all", classNames?.value)}
        >
          {value}
        </p>
      ) : null}

      {matrix && (formats.length || copyable) ? (
        <div
          role="group"
          aria-label={t("file.qrActions")}
          data-slot="qr-code-actions"
          className={cn("gap-2 flex flex-wrap justify-center", classNames?.actions)}
        >
          {formats.map((format) => (
            <Button
              key={format}
              type="button"
              variant="outline"
              size="sm"
              disabled={busy !== null}
              aria-busy={busy === format || undefined}
              onClick={() => void save(format)}
              className={cn("touch:h-11", classNames?.button)}
            >
              <Icon name="download" data-icon="inline-start" />
              {format === "png" ? t("file.qrDownloadPng") : t("file.qrDownloadSvg")}
            </Button>
          ))}
          {copyable ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={async () => {
                if (await copy(value)) onCopy?.(value)
              }}
              className={cn("touch:h-11", classNames?.button)}
            >
              <Icon name={status === "copied" ? "check" : "copy"} data-icon="inline-start" />
              {t("file.qrCopyValue")}
            </Button>
          ) : null}
          <LiveRegion>
            {status === "copied" ? t("file.qrCopied") : status === "failed" ? t("file.qrCopyFailed") : null}
          </LiveRegion>
        </div>
      ) : null}
    </div>
  )
}
