"use client"

import * as React from "react"
import SignaturePadLib from "signature_pad"

import { LiveMessage } from "../components/inputs/_shared"
import { TextInput } from "../components/inputs/text-input"
import { Icon } from "../icons/icon"
import { cn } from "../lib/utils"
import { useTranslation } from "../providers/onu-provider"
import type { ThaanaProp } from "../thaana/use-thaana-field"
import { Button } from "../ui/button"
import { registerEnglish } from "../i18n/english"
import { input as en_input } from "../locales/en/input"

registerEnglish({ input: en_input })

/** Fonts tried, in order, for typed signatures. */
export const TYPED_SIGNATURE_FONT = `"Segoe Script", "Brush Script MT", "Snell Roundhand", "MV Waheed", cursive`

/**
 * Renders a typed name as a PNG data URL, so a typed signature has the same
 * output as a drawn one. Returns `null` when canvas is unavailable.
 */
export function renderTypedSignature(
  text: string,
  { color = "#000", width = 600, height = 160, font = TYPED_SIGNATURE_FONT } = {},
): string | null {
  const name = text.trim()
  if (!name) return null
  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext("2d")
  if (!ctx) return null
  let size = Math.round(height * 0.45)
  ctx.font = `${size}px ${font}`
  while (size > 12 && ctx.measureText(name).width > width * 0.9) {
    size -= 2
    ctx.font = `${size}px ${font}`
  }
  ctx.fillStyle = color
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"
  ctx.fillText(name, width / 2, height / 2)
  return canvas.toDataURL("image/png")
}

export type SignatureMode = "draw" | "type"

export interface SignaturePadProps extends Omit<React.ComponentProps<"div">, "defaultValue" | "onChange"> {
  /** Called with a PNG data URL after each stroke (or typed change), or `null` when cleared. */
  onValueChange?: (dataUrl: string | null) => void
  /** A data URL to start from, e.g. a saved signature. */
  defaultValue?: string | null
  /** Ink colour. Defaults to the text colour (`currentColor`), so it follows the theme. */
  penColor?: string
  /** Fill colour of the exported image. Default transparent. */
  backgroundColor?: string
  minWidth?: number
  maxWidth?: number
  disabled?: boolean
  /** Offer "type your name" as a keyboard and screen-reader alternative. Default `true`. */
  allowTyped?: boolean
  mode?: SignatureMode
  defaultMode?: SignatureMode
  onModeChange?: (mode: SignatureMode) => void
  /** Thaana typing for the typed name. */
  thaana?: ThaanaProp
  /** Form field name; the data URL is submitted through a hidden input. */
  name?: string
  /** Accessible name for the group (e.g. "Applicant signature"). */
  label?: string
  classNames?: { canvas?: string; toolbar?: string; typed?: string }
}

/**
 * Signature pad (`signature_pad`): draw with finger, pen or mouse, undo and
 * clear, export as a PNG data URL. Resizes without losing the drawing, and
 * offers "type your name" as an accessible alternative.
 */
export function SignaturePad({
  onValueChange,
  defaultValue = null,
  penColor,
  backgroundColor = "rgba(0,0,0,0)",
  minWidth = 0.75,
  maxWidth = 2.75,
  disabled = false,
  allowTyped = true,
  mode: modeProp,
  defaultMode = "draw",
  onModeChange,
  thaana,
  name,
  label,
  className,
  classNames,
  ...props
}: SignaturePadProps) {
  const { t } = useTranslation()
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const padRef = React.useRef<SignaturePadLib | null>(null)
  const onValueChangeRef = React.useRef(onValueChange)
  React.useEffect(() => {
    onValueChangeRef.current = onValueChange
  })
  const [innerMode, setInnerMode] = React.useState<SignatureMode>(defaultMode)
  const mode = modeProp ?? innerMode
  const [strokes, setStrokes] = React.useState(0)
  const [typed, setTyped] = React.useState("")
  const [dataUrl, setDataUrl] = React.useState<string | null>(defaultValue)
  const [announce, setAnnounce] = React.useState<string | null>(null)
  const initial = React.useRef(defaultValue)

  const emit = React.useCallback((url: string | null) => {
    setDataUrl(url)
    onValueChangeRef.current?.(url)
  }, [])

  const ink = React.useCallback(
    () => penColor ?? (canvasRef.current ? getComputedStyle(canvasRef.current).color : "") ?? "#000",
    [penColor],
  )

  // Create the pad once the canvas is in the document (draw mode).
  React.useEffect(() => {
    const canvas = canvasRef.current
    if (mode !== "draw" || !canvas) return
    const pad = new SignaturePadLib(canvas, { penColor: ink() || "#000", backgroundColor, minWidth, maxWidth })
    padRef.current = pad
    const onEnd = () => {
      setStrokes(pad.toData().length)
      emit(pad.toDataURL("image/png"))
      setAnnounce(t("input.signatureCaptured"))
    }
    pad.addEventListener("endStroke", onEnd)

    const resize = () => {
      const ratio = Math.max(window.devicePixelRatio || 1, 1)
      const width = canvas.offsetWidth
      const height = canvas.offsetHeight
      if (!width || !height) return
      if (canvas.width === Math.round(width * ratio) && canvas.height === Math.round(height * ratio)) return
      const data = pad.toData()
      canvas.width = Math.round(width * ratio)
      canvas.height = Math.round(height * ratio)
      canvas.getContext("2d")?.scale(ratio, ratio)
      pad.clear()
      if (data.length) pad.fromData(data)
    }
    resize()
    if (initial.current) {
      const url = initial.current
      initial.current = null
      void pad.fromDataURL(url).catch(() => undefined)
    }
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(resize)
    observer?.observe(canvas)
    window.addEventListener("resize", resize)
    return () => {
      observer?.disconnect()
      window.removeEventListener("resize", resize)
      pad.removeEventListener("endStroke", onEnd)
      pad.off()
      padRef.current = null
    }
    // Pen settings are applied below without recreating the pad.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, emit, t])

  React.useEffect(() => {
    const pad = padRef.current
    if (!pad) return
    pad.penColor = ink() || "#000"
    pad.minWidth = minWidth
    pad.maxWidth = maxWidth
    pad.backgroundColor = backgroundColor
    if (disabled) pad.off()
    else pad.on()
  }, [ink, minWidth, maxWidth, backgroundColor, disabled, mode])

  const undo = () => {
    const pad = padRef.current
    if (!pad) return
    const data = pad.toData()
    data.pop()
    pad.fromData(data)
    setStrokes(data.length)
    emit(data.length ? pad.toDataURL("image/png") : null)
  }

  const clear = () => {
    padRef.current?.clear()
    setStrokes(0)
    setTyped("")
    emit(null)
    setAnnounce(t("input.signatureCleared"))
  }

  const switchMode = (next: SignatureMode) => {
    if (next === mode) return
    setInnerMode(next)
    onModeChange?.(next)
    setStrokes(0)
    setTyped("")
    emit(null)
  }

  const empty = mode === "draw" ? strokes === 0 && !dataUrl : !typed.trim()

  return (
    <div
      role="group"
      aria-label={label}
      data-slot="signature-pad"
      data-mode={mode}
      data-disabled={disabled || undefined}
      className={cn("gap-2 grid", className)}
      {...props}
    >
      {allowTyped ? (
        <div className="gap-1 p-0.5 inline-flex w-fit rounded-lg bg-muted" role="group">
          {(["draw", "type"] as const).map((m) => (
            <button
              key={m}
              type="button"
              aria-pressed={mode === m}
              disabled={disabled}
              onClick={() => switchMode(m)}
              className="h-7 px-3 text-sm aria-pressed:shadow-sm touch:h-11 rounded-md text-muted-foreground transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50 aria-pressed:bg-background aria-pressed:text-foreground"
            >
              {m === "draw" ? t("input.signatureDraw") : t("input.signatureType")}
            </button>
          ))}
        </div>
      ) : null}

      {mode === "draw" ? (
        <div className="relative">
          <canvas
            ref={canvasRef}
            role="img"
            aria-label={t("input.signatureCanvas")}
            data-slot="signature-canvas"
            className={cn(
              "h-40 w-full cursor-crosshair touch-none rounded-lg border border-input bg-background text-foreground dark:bg-input/30",
              "data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50",
              classNames?.canvas,
            )}
            data-disabled={disabled || undefined}
          />
          {empty ? (
            <div
              aria-hidden="true"
              className="inset-x-6 bottom-6 pt-1 text-xs pointer-events-none absolute border-t border-dashed border-muted-foreground/40 text-muted-foreground"
            >
              {t("input.signatureEmpty")}
            </div>
          ) : null}
        </div>
      ) : (
        <div className={cn("gap-2 grid", classNames?.typed)}>
          <TextInput
            aria-label={t("input.signatureTypedName")}
            placeholder={t("input.signatureTypedName")}
            autoComplete="name"
            disabled={disabled}
            thaana={thaana}
            value={typed}
            onChange={(e) => {
              setTyped(e.target.value)
              emit(renderTypedSignature(e.target.value, { color: ink() || "#000" }))
            }}
          />
          <div
            aria-hidden="true"
            className="h-24 px-4 text-4xl flex items-center justify-center overflow-hidden rounded-lg border border-input text-foreground"
            style={{ fontFamily: TYPED_SIGNATURE_FONT }}
          >
            {typed}
          </div>
        </div>
      )}

      <div className={cn("gap-2 flex flex-wrap", classNames?.toolbar)}>
        {mode === "draw" ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={undo}
            disabled={disabled || strokes === 0}
            className="touch:h-11"
          >
            <Icon name="undo" data-icon="inline-start" />
            {t("input.signatureUndo")}
          </Button>
        ) : null}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={clear}
          disabled={disabled || empty}
          className="touch:h-11"
        >
          <Icon name="trash" data-icon="inline-start" />
          {t("input.signatureClear")}
        </Button>
      </div>
      {name ? <input type="hidden" name={name} value={dataUrl ?? ""} /> : null}
      <LiveMessage>{announce}</LiveMessage>
    </div>
  )
}
