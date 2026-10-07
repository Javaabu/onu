"use client"

import * as React from "react"

import { LiveMessage } from "../components/inputs/_shared"
import { TextInput } from "../components/inputs/text-input"
import { Icon } from "../icons/icon"
import { cn } from "../lib/utils"
import { useTranslation } from "../providers/onu-provider"
import { Button } from "../ui/button"

/** The part of the `BarcodeDetector` API the scanner uses. */
export interface BarcodeDetectorLike {
  detect(source: HTMLVideoElement | ImageBitmapSource): Promise<{ rawValue: string; format?: string }[]>
}

type DetectorConstructor = {
  new (options?: { formats?: string[] }): BarcodeDetectorLike
  getSupportedFormats?: () => Promise<string[]>
}

/**
 * Uses the browser's `BarcodeDetector` when it supports the formats, and
 * otherwise loads the `barcode-detector` polyfill (ZXing in WebAssembly) on demand.
 */
export async function createBarcodeDetector(formats: string[] = ["qr_code"]): Promise<BarcodeDetectorLike> {
  const Native = (globalThis as { BarcodeDetector?: DetectorConstructor }).BarcodeDetector
  if (Native) {
    const supported = await Native.getSupportedFormats?.().catch(() => [] as string[])
    if (!supported || formats.every((f) => supported.includes(f))) return new Native({ formats })
  }
  const { BarcodeDetector } = await import("barcode-detector/ponyfill")
  return new BarcodeDetector({ formats: formats as never }) as unknown as BarcodeDetectorLike
}

export type ScannerStatus = "idle" | "requesting" | "scanning" | "denied" | "no-camera" | "unsupported" | "error"

export interface QrCodeScannerProps extends Omit<React.ComponentProps<"div">, "onError"> {
  /** Called with the decoded text (from the camera or manual entry). */
  onScan: (value: string) => void
  /** Barcode formats to detect. Default `["qr_code"]`. */
  formats?: string[]
  /** Keep scanning after a result. Default `false`: the camera stops after the first code. */
  continuous?: boolean
  /** Start the camera on mount (still subject to the permission prompt). Default `false`. */
  autoStart?: boolean
  /** Show a manual entry field as a fallback. Default `true`. */
  manualEntry?: boolean
  /** Camera to prefer. Default `"environment"` (rear camera). */
  facingMode?: "environment" | "user"
  /** Time between detection attempts, in ms. Default `250`. */
  scanInterval?: number
  /** Supply your own detector (e.g. for tests or another decoder). */
  createDetector?: (formats: string[]) => Promise<BarcodeDetectorLike>
  onStatusChange?: (status: ScannerStatus) => void
  onError?: (error: unknown) => void
  classNames?: { video?: string; controls?: string; manual?: string; message?: string }
}

function statusFromError(error: unknown): ScannerStatus {
  const name = (error as { name?: string } | null)?.name
  if (name === "NotAllowedError" || name === "SecurityError" || name === "PermissionDeniedError") return "denied"
  if (name === "NotFoundError" || name === "OverconstrainedError" || name === "DevicesNotFoundError") return "no-camera"
  return "error"
}

/**
 * QR code scanner: camera preview with `getUserMedia`, decoding with
 * `BarcodeDetector` (polyfilled where missing), a torch toggle when the camera
 * has one, clear permission / no-camera states, and manual entry as a
 * fallback. The camera always stops on unmount.
 */
export function QrCodeScanner({
  onScan,
  formats = ["qr_code"],
  continuous = false,
  autoStart = false,
  manualEntry = true,
  facingMode = "environment",
  scanInterval = 250,
  createDetector = createBarcodeDetector,
  onStatusChange,
  onError,
  className,
  classNames,
  ...props
}: QrCodeScannerProps) {
  const { t } = useTranslation()
  const videoRef = React.useRef<HTMLVideoElement>(null)
  const streamRef = React.useRef<MediaStream | null>(null)
  const timerRef = React.useRef<ReturnType<typeof setInterval>>(undefined)
  const runRef = React.useRef(0)
  const [status, setStatusState] = React.useState<ScannerStatus>("idle")
  const [torch, setTorch] = React.useState<{ supported: boolean; on: boolean }>({ supported: false, on: false })
  const [manual, setManual] = React.useState("")
  const [announce, setAnnounce] = React.useState<string | null>(null)
  const latest = React.useRef({ onScan, onStatusChange, onError, continuous, formats, createDetector, scanInterval })
  React.useEffect(() => {
    latest.current = { onScan, onStatusChange, onError, continuous, formats, createDetector, scanInterval }
  })

  const setStatus = React.useCallback((next: ScannerStatus) => {
    setStatusState(next)
    latest.current.onStatusChange?.(next)
  }, [])

  const release = React.useCallback(() => {
    runRef.current++
    clearInterval(timerRef.current)
    timerRef.current = undefined
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    if (videoRef.current) videoRef.current.srcObject = null
    setTorch({ supported: false, on: false })
  }, [])

  const stop = React.useCallback(() => {
    release()
    setStatus("idle")
  }, [release, setStatus])

  const found = React.useCallback(
    (value: string) => {
      setAnnounce(t("input.scanFound", { value }))
      latest.current.onScan(value)
    },
    [t],
  )

  const start = React.useCallback(async () => {
    release()
    const run = runRef.current
    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus("unsupported")
      return
    }
    setStatus("requesting")
    let stream: MediaStream
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode }, audio: false })
    } catch (error) {
      if (run !== runRef.current) return
      setStatus(statusFromError(error))
      latest.current.onError?.(error)
      return
    }
    if (run !== runRef.current) {
      stream.getTracks().forEach((track) => track.stop())
      return
    }
    streamRef.current = stream
    const video = videoRef.current
    if (video) {
      video.srcObject = stream
      await video.play().catch(() => undefined)
    }
    let detector: BarcodeDetectorLike
    try {
      detector = await latest.current.createDetector(latest.current.formats)
    } catch (error) {
      if (run !== runRef.current) return
      release()
      setStatus("unsupported")
      latest.current.onError?.(error)
      return
    }
    if (run !== runRef.current) return
    const track = stream.getVideoTracks()[0]
    const caps = track?.getCapabilities?.() as (MediaTrackCapabilities & { torch?: boolean }) | undefined
    setTorch({ supported: !!caps?.torch, on: false })
    setStatus("scanning")

    let busy = false
    timerRef.current = setInterval(async () => {
      const el = videoRef.current
      if (busy || !el || el.readyState < 2) return
      busy = true
      try {
        const codes = await detector.detect(el)
        const value = codes[0]?.rawValue
        if (value && run === runRef.current) {
          if (!latest.current.continuous) stop()
          found(value)
        }
      } catch {
        // A frame that cannot be decoded is not an error.
      } finally {
        busy = false
      }
    }, latest.current.scanInterval)
  }, [facingMode, release, setStatus, stop, found])

  React.useEffect(() => {
    if (autoStart) void Promise.resolve().then(start)
    return release
    // Start once on mount; later changes are applied on the next start.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const toggleTorch = async () => {
    const track = streamRef.current?.getVideoTracks()[0]
    if (!track) return
    const next = !torch.on
    try {
      await track.applyConstraints({ advanced: [{ torch: next } as MediaTrackConstraintSet] })
      setTorch({ supported: true, on: next })
    } catch (error) {
      latest.current.onError?.(error)
    }
  }

  const submitManual = () => {
    const value = manual.trim()
    if (!value) return
    found(value)
    setManual("")
  }

  const active = status === "requesting" || status === "scanning"
  const message: Partial<Record<ScannerStatus, string>> = {
    requesting: t("input.scanRequesting"),
    scanning: t("input.scanActive"),
    denied: t("input.scanDenied"),
    "no-camera": t("input.scanNoCamera"),
    unsupported: t("input.scanUnsupported"),
    error: t("input.scanError"),
  }
  const problem = status === "denied" || status === "no-camera" || status === "unsupported" || status === "error"

  return (
    <div data-slot="qr-code-scanner" data-status={status} className={cn("gap-3 grid", className)} {...props}>
      <div
        className={cn(
          "max-w-sm relative aspect-square w-full overflow-hidden rounded-xl border border-border bg-muted",
          !active && "hidden",
          classNames?.video,
        )}
      >
        <video ref={videoRef} muted playsInline aria-label={t("input.scanVideo")} className="size-full object-cover" />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-[15%] rounded-lg border-2 border-primary-foreground/80 shadow-[0_0_0_9999px_color-mix(in_oklch,var(--background)_45%,transparent)]"
        />
      </div>

      <p
        role={problem ? "alert" : "status"}
        data-slot="qr-code-scanner-message"
        className={cn(
          "gap-2 text-sm flex items-start",
          problem ? "text-destructive" : "text-muted-foreground",
          status === "idle" && "sr-only",
          classNames?.message,
        )}
      >
        {problem ? <Icon name="warning" className="mt-0.5 size-4 shrink-0" /> : null}
        {message[status] ?? null}
      </p>

      <div className={cn("gap-2 flex flex-wrap", classNames?.controls)}>
        {active ? (
          <Button type="button" variant="outline" onClick={stop} className="touch:h-11">
            <Icon name="close" data-icon="inline-start" />
            {t("input.scanStop")}
          </Button>
        ) : status !== "unsupported" ? (
          <Button type="button" onClick={() => void start()} className="touch:h-11">
            <Icon name="camera" data-icon="inline-start" />
            {t("input.scanStart")}
          </Button>
        ) : null}
        {status === "scanning" && torch.supported ? (
          <Button
            type="button"
            variant="outline"
            aria-pressed={torch.on}
            onClick={() => void toggleTorch()}
            className="touch:h-11"
          >
            <Icon name="flashlight" data-icon="inline-start" />
            {torch.on ? t("input.scanTorchOff") : t("input.scanTorchOn")}
          </Button>
        ) : null}
      </div>

      {manualEntry ? (
        <div role="group" className={cn("gap-2 flex flex-wrap items-end", classNames?.manual)}>
          <TextInput
            aria-label={t("input.scanManual")}
            placeholder={t("input.scanManual")}
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
            dir="ltr"
            enterKeyHint="done"
            value={manual}
            onChange={(e) => setManual(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                submitManual()
              }
            }}
            className="min-w-48 touch:h-11 flex-1"
          />
          <Button type="button" variant="secondary" onClick={submitManual} className="touch:h-11">
            {t("input.scanManualSubmit")}
          </Button>
        </div>
      ) : null}
      <LiveMessage>{announce}</LiveMessage>
    </div>
  )
}
