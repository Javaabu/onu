"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { Icon } from "../../icons/icon"
import { cn } from "../../lib/utils"
import { useTranslation } from "../../providers/onu-provider"
import { Button } from "../../ui/button"
import { useFormField, useFormFieldControl } from "../form/form-field"
import { useMergedRef } from "../inputs/text-input"
import { useControllable } from "./_use-controllable"
import { syncInputFiles, validateFile, type FileRejection } from "./file-utils"
import { useObjectUrl, useRejectionMessage } from "./use-files"

export const imageInputVariants = cva(
  "relative flex items-center justify-center overflow-hidden border border-border bg-muted/40",
  {
    variants: {
      shape: {
        rounded: "rounded-xl",
        square: "rounded-none",
        circle: "aspect-square rounded-full",
      },
    },
    defaultVariants: { shape: "rounded" },
  },
)

export interface ImageInputProps
  extends
    Omit<React.ComponentProps<"input">, "type" | "value" | "defaultValue" | "onChange" | "alt" | "placeholder">,
    VariantProps<typeof imageInputVariants> {
  /** The image: a picked `File`, an existing image URL, or `null` (controlled). */
  value?: File | string | null
  defaultValue?: File | string | null
  /** Called with the new file, or `null` when removed. */
  onChange?: (file: File | null) => void
  /** Called when a picked file fails validation. */
  onReject?: (rejection: FileRejection) => void
  /** Alt text for the preview (required, R14.10). */
  alt: string
  /** Largest allowed size in bytes. */
  maxSize?: number
  /** Preview aspect ratio (width / height). Default `4 / 3`; `1` for `circle`. */
  aspectRatio?: number
  /** Name of a hidden input set to `1` when an existing image is removed (for the server). */
  removeName?: string
  /** Content of the empty state. */
  placeholder?: React.ReactNode
  classNames?: { root?: string; preview?: string; image?: string; actions?: string; empty?: string; error?: string }
}

/** Picks one image with a preview, and buttons to replace or remove it. */
export function ImageInput({
  value,
  defaultValue,
  onChange,
  onReject,
  alt,
  accept = "image/*",
  maxSize,
  aspectRatio,
  shape,
  removeName,
  placeholder,
  className,
  classNames,
  ref,
  ...props
}: ImageInputProps) {
  const { t } = useTranslation()
  const local = React.useRef<HTMLInputElement>(null)
  const merged = useMergedRef(local, ref)
  const [image, setImage] = useControllable<File | string | null>(
    value,
    defaultValue ?? null,
    onChange as ((v: File | string | null) => void) | undefined,
  )
  const [initial] = React.useState(() => (typeof (value ?? defaultValue) === "string" ? (value ?? defaultValue) : null))
  const [rejection, setRejection] = React.useState<FileRejection | null>(null)
  const message = useRejectionMessage({ accept, maxSize })
  const field = useFormField()
  const control = useFormFieldControl(props)
  const disabled = !!control.disabled
  const objectUrl = useObjectUrl(image instanceof Blob ? image : null)
  const src = typeof image === "string" ? image : objectUrl
  const errorId = React.useId()
  const describedBy = [control["aria-describedby"], rejection ? errorId : null].filter(Boolean).join(" ") || undefined
  const ratio = aspectRatio ?? (shape === "circle" ? 1 : 4 / 3)

  React.useEffect(() => {
    syncInputFiles(local.current, image instanceof File ? [image] : [])
  }, [image])

  const pick = () => local.current?.click()

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      syncInputFiles(local.current, image instanceof File ? [image] : [])
      return
    }
    const code = validateFile(file, { accept, maxSize })
    if (code) {
      const r = { file, code }
      setRejection(r)
      onReject?.(r)
      syncInputFiles(local.current, image instanceof File ? [image] : [])
      return
    }
    setRejection(null)
    setImage(file)
  }

  const remove = () => {
    setImage(null)
    setRejection(null)
    setTimeout(() => local.current?.parentElement?.querySelector<HTMLElement>("[data-action=choose]")?.focus(), 0)
  }

  return (
    <div data-slot="image-input" className={cn("gap-2 max-w-sm grid w-full", classNames?.root, className)}>
      <input
        ref={merged}
        type="file"
        accept={accept}
        tabIndex={-1}
        onChange={handleChange}
        className="sr-only"
        {...control}
        aria-describedby={describedBy}
        aria-label={props["aria-label"] ?? (field ? undefined : t("file.chooseImage"))}
      />
      {src ? (
        <>
          <div
            className={cn(imageInputVariants({ shape }), classNames?.preview)}
            style={{ aspectRatio: String(ratio) }}
          >
            <img
              src={src}
              alt={alt}
              loading="lazy"
              decoding="async"
              className={cn("size-full object-cover", classNames?.image)}
            />
          </div>
          <div className={cn("gap-2 flex flex-wrap", classNames?.actions)}>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={disabled}
              aria-describedby={describedBy}
              onClick={pick}
            >
              <Icon name="refresh" data-icon="inline-start" />
              {t("file.replaceImage")}
            </Button>
            <Button type="button" variant="ghost" size="sm" disabled={disabled} onClick={remove}>
              <Icon name="trash" data-icon="inline-start" />
              {t("file.removeImage")}
            </Button>
          </div>
        </>
      ) : (
        <button
          type="button"
          data-action="choose"
          disabled={disabled}
          aria-describedby={describedBy}
          onClick={pick}
          className={cn(
            imageInputVariants({ shape }),
            "gap-2 p-4 text-sm w-full flex-col border-dashed text-muted-foreground outline-none hover:bg-muted focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 data-[invalid]:border-destructive",
            classNames?.empty,
          )}
          data-invalid={control["aria-invalid"] || undefined}
          style={{ aspectRatio: String(ratio) }}
        >
          {placeholder ?? (
            <>
              <Icon name="image" size="xl" />
              <span className="font-medium text-foreground">{t("file.chooseImage")}</span>
            </>
          )}
        </button>
      )}
      {rejection ? (
        <p
          id={errorId}
          role="alert"
          className={cn("gap-1.5 text-sm flex items-start text-destructive", classNames?.error)}
        >
          <Icon name="error" size="sm" className="mt-0.5 shrink-0" />
          <span dir="auto">{message(rejection)}</span>
        </p>
      ) : null}
      {removeName && initial && image === null ? <input type="hidden" name={removeName} value="1" /> : null}
    </div>
  )
}
