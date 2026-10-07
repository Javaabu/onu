"use client"

import * as React from "react"
import Cropper, { type Area, type Point } from "react-easy-crop"

import { useObjectUrl } from "../components/files/use-files"
import { Icon } from "../icons/icon"
import { cn } from "../lib/utils"
import { useTranslation } from "../providers/onu-provider"
import { Button } from "../ui/button"
import { LabelledSlider } from "./_labelled-slider"
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group"
import { cropImage, cropImageToFile, type CropImageOptions, type PixelCrop } from "./crop-image"

export interface AspectOption {
  label: string
  /** Width / height, or `undefined` for free cropping (uses the image's own ratio). */
  value: number | undefined
}

export interface ImageCropperHandle {
  /** The cropped image as a Blob. */
  getBlob: (options?: CropImageOptions) => Promise<Blob>
  /** The cropped image as a File. */
  getFile: (name: string, options?: CropImageOptions) => Promise<File>
  /** Current crop in source pixels and rotation. */
  getCrop: () => { area: PixelCrop | null; rotation: number }
  /** Back to the initial position, zoom and rotation. */
  reset: () => void
}

export interface ImageCropperProps extends Omit<React.ComponentProps<"div">, "ref" | "onChange"> {
  /** Image to crop: a URL, or a picked `File` / `Blob`. */
  src: string | Blob
  /** What the image shows, used in the crop area's accessible name. */
  alt: string
  /** Fixed aspect ratio (width / height). Default `1`. */
  aspect?: number
  /** Let the user choose an aspect ratio. */
  aspectOptions?: AspectOption[]
  onAspectChange?: (aspect: number | undefined) => void
  /** `rect` or `round` (for avatars). */
  cropShape?: "rect" | "round"
  minZoom?: number
  maxZoom?: number
  /** Show rotate buttons and slider. Default `true`. */
  rotatable?: boolean
  /** Pixels moved per arrow-key press (Shift for finer steps). Default `4`. */
  keyboardStep?: number
  /** Called after each change with the crop in source pixels. */
  onCropComplete?: (area: PixelCrop, rotation: number) => void
  ref?: React.Ref<ImageCropperHandle>
  classNames?: { stage?: string; controls?: string; cropArea?: string; media?: string }
}

/**
 * Crops an image with `react-easy-crop`: drag or pinch to move and zoom, arrow keys to
 * nudge, a zoom slider, rotation, aspect-ratio presets, and Blob/File output.
 */
export function ImageCropper({
  src,
  alt,
  aspect: aspectProp = 1,
  aspectOptions,
  onAspectChange,
  cropShape = "rect",
  minZoom = 1,
  maxZoom = 3,
  rotatable = true,
  keyboardStep = 4,
  onCropComplete,
  ref,
  className,
  classNames,
  ...props
}: ImageCropperProps) {
  const { t } = useTranslation()
  const objectUrl = useObjectUrl(typeof src === "string" ? null : src)
  const url = typeof src === "string" ? src : objectUrl
  const [crop, setCrop] = React.useState<Point>({ x: 0, y: 0 })
  const [zoom, setZoom] = React.useState(1)
  const [rotation, setRotation] = React.useState(0)
  const [aspect, setAspect] = React.useState<number | undefined>(aspectProp)
  const [area, setArea] = React.useState<PixelCrop | null>(null)
  const [mediaAspect, setMediaAspect] = React.useState<number>(1)
  const helpId = React.useId()

  const reset = React.useCallback(() => {
    setCrop({ x: 0, y: 0 })
    setZoom(1)
    setRotation(0)
  }, [])

  React.useImperativeHandle(
    ref,
    () => ({
      getBlob: (options) => {
        if (!url || !area) return Promise.reject(new Error("Nothing to crop yet"))
        return cropImage(url, area, { rotation, ...options })
      },
      getFile: (name, options) => {
        if (!url || !area) return Promise.reject(new Error("Nothing to crop yet"))
        return cropImageToFile(url, area, name, { rotation, ...options })
      },
      getCrop: () => ({ area, rotation }),
      reset,
    }),
    [url, area, rotation, reset],
  )

  const rotate = (delta: number) => setRotation((r) => (((r + delta) % 360) + 360) % 360)
  const zoomBy = (delta: number) => setZoom((z) => Math.min(maxZoom, Math.max(minZoom, +(z + delta).toFixed(2))))

  return (
    <div data-slot="image-cropper" className={cn("gap-3 grid w-full", className)} {...props}>
      <div className={cn("h-72 sm:h-80 relative touch-none overflow-hidden rounded-xl bg-muted", classNames?.stage)}>
        {url ? (
          <Cropper
            image={url}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={aspect ?? mediaAspect}
            cropShape={cropShape}
            minZoom={minZoom}
            maxZoom={maxZoom}
            keyboardStep={keyboardStep}
            showGrid={cropShape === "rect"}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onRotationChange={setRotation}
            onMediaLoaded={(size) => size.height && setMediaAspect(size.width / size.height)}
            onCropComplete={(_: Area, pixels: Area) => {
              setArea(pixels)
              onCropComplete?.(pixels, rotation)
            }}
            classes={{
              cropAreaClassName: cn(
                "focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring",
                classNames?.cropArea,
              ),
              mediaClassName: classNames?.media,
            }}
            mediaProps={{ alt } as React.ImgHTMLAttributes<HTMLElement>}
            cropperProps={{
              role: "group",
              "aria-label": t("file.cropArea", { name: alt }),
              "aria-describedby": helpId,
              onKeyDown: (e: React.KeyboardEvent) => {
                if (e.key === "+" || e.key === "=") zoomBy(0.1)
                else if (e.key === "-" || e.key === "_") zoomBy(-0.1)
              },
            }}
          />
        ) : null}
      </div>
      <p id={helpId} className="sr-only">
        {t("file.cropHelp")}
      </p>

      <div className={cn("gap-x-4 gap-y-3 sm:grid-cols-2 grid", classNames?.controls)}>
        <div className="gap-2 flex items-center">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={t("file.zoomOut")}
            disabled={zoom <= minZoom}
            onClick={() => zoomBy(-0.1)}
          >
            <Icon name="zoom-out" />
          </Button>
          <LabelledSlider
            label={t("file.zoom")}
            valueText={`${Math.round(zoom * 100)}%`}
            min={minZoom}
            max={maxZoom}
            step={0.01}
            value={[zoom]}
            onValueChange={([v]) => v !== undefined && setZoom(v)}
            className="flex-1"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={t("file.zoomIn")}
            disabled={zoom >= maxZoom}
            onClick={() => zoomBy(0.1)}
          >
            <Icon name="zoom-in" />
          </Button>
        </div>
        {rotatable ? (
          <div className="gap-2 flex items-center">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={t("file.rotateLeft")}
              onClick={() => rotate(-90)}
            >
              <Icon name="rotate-ccw" />
            </Button>
            <LabelledSlider
              label={t("file.rotation")}
              valueText={`${rotation}°`}
              min={0}
              max={359}
              step={1}
              value={[rotation]}
              onValueChange={([v]) => v !== undefined && setRotation(v)}
              className="flex-1"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={t("file.rotateRight")}
              onClick={() => rotate(90)}
            >
              <Icon name="rotate" />
            </Button>
          </div>
        ) : null}
      </div>

      <div className="gap-2 flex flex-wrap items-center justify-between">
        {aspectOptions?.length ? (
          <ToggleGroup
            type="single"
            variant="outline"
            size="sm"
            aria-label={t("file.aspectRatio")}
            value={aspectOptions.findIndex((o) => o.value === aspect).toString()}
            onValueChange={(v) => {
              if (!v) return
              const next = aspectOptions[Number(v)]?.value
              setAspect(next)
              onAspectChange?.(next)
            }}
          >
            {aspectOptions.map((option, i) => (
              <ToggleGroupItem key={option.label} value={String(i)}>
                {option.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        ) : (
          <span />
        )}
        <Button type="button" variant="ghost" size="sm" onClick={reset}>
          <Icon name="undo" data-icon="inline-start" />
          {t("file.resetCrop")}
        </Button>
      </div>
    </div>
  )
}
