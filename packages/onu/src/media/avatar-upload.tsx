"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { useControllable } from "../components/files/_use-controllable"
import { syncInputFiles, validateFile, type FileRejection } from "../components/files/file-utils"
import { useObjectUrl, useRejectionMessage } from "../components/files/use-files"
import { useFormField, useFormFieldControl } from "../components/form/form-field"
import { useMergedRef } from "../components/inputs/text-input"
import { Icon } from "../icons/icon"
import { cn } from "../lib/utils"
import { useTranslation } from "../providers/onu-provider"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { Button } from "../ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog"
import type { CropImageOptions } from "./crop-image"
import { ImageCropper, type ImageCropperHandle } from "./image-cropper"
import { registerEnglish } from "../i18n/english"
import { common as en_common } from "../locales/en/common"
import { file as en_file } from "../locales/en/file"

registerEnglish({ common: en_common, file: en_file })

export const avatarUploadVariants = cva("", {
  variants: {
    size: {
      sm: "size-12 text-sm",
      default: "size-20 text-xl",
      lg: "size-28 text-2xl",
      xl: "size-36 text-3xl",
    },
  },
  defaultVariants: { size: "default" },
})

/** Initials from a name: "Aishath Shifa" → "AS", "އަޙްމަދު ނާޒިމް" → "އނ". */
export function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  return parts
    .slice(0, 2)
    .map((p) => Array.from(p)[0] ?? "")
    .join("")
    .toLocaleUpperCase()
}

export interface AvatarUploadProps
  extends
    Omit<React.ComponentProps<"input">, "type" | "value" | "defaultValue" | "onChange" | "size">,
    VariantProps<typeof avatarUploadVariants> {
  /** The avatar: a picked `File`, an existing image URL, or `null` (controlled). */
  value?: File | string | null
  defaultValue?: File | string | null
  onChange?: (file: File | null) => void
  onReject?: (rejection: FileRejection) => void
  /** Person's name: used for initials and the image's alt text. */
  personName: string
  /** Largest allowed size in bytes (checked before cropping). */
  maxSize?: number
  /** Show the crop step after picking. Default `true`. */
  crop?: boolean
  /** Output settings for the cropped image. Default: 512px JPEG. */
  cropOptions?: CropImageOptions
  /** Allow removing the avatar. Default `true`. */
  removable?: boolean
  classNames?: { avatar?: string; actions?: string; dialog?: string; error?: string }
}

/** Circular avatar picker with preview, a crop step (react-easy-crop), replace and remove. */
export function AvatarUpload({
  value,
  defaultValue,
  onChange,
  onReject,
  personName,
  accept = "image/*",
  maxSize,
  crop = true,
  cropOptions,
  removable = true,
  size,
  className,
  classNames,
  ref,
  ...props
}: AvatarUploadProps) {
  const { t } = useTranslation()
  const local = React.useRef<HTMLInputElement>(null)
  const merged = useMergedRef(local, ref)
  const changeRef = React.useRef<HTMLButtonElement>(null)
  const cropper = React.useRef<ImageCropperHandle>(null)
  const [image, setImage] = useControllable<File | string | null>(
    value,
    defaultValue ?? null,
    onChange as ((v: File | string | null) => void) | undefined,
  )
  const [pending, setPending] = React.useState<File | null>(null)
  const [saving, setSaving] = React.useState(false)
  const [rejection, setRejection] = React.useState<FileRejection | null>(null)
  const message = useRejectionMessage({ accept, maxSize })
  const field = useFormField()
  const control = useFormFieldControl(props)
  const disabled = !!control.disabled
  const objectUrl = useObjectUrl(image instanceof Blob ? image : null)
  const src = typeof image === "string" ? image : objectUrl
  const errorId = React.useId()

  React.useEffect(() => {
    syncInputFiles(local.current, image instanceof File ? [image] : [])
  }, [image])

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    syncInputFiles(local.current, image instanceof File ? [image] : [])
    if (!file) return
    const code = validateFile(file, { accept, maxSize })
    if (code) {
      const r = { file, code }
      setRejection(r)
      onReject?.(r)
      return
    }
    setRejection(null)
    if (crop) setPending(file)
    else setImage(file)
  }

  const save = async () => {
    if (!pending) return
    setSaving(true)
    try {
      const name = pending.name.replace(/\.[^.]+$/, "") + ".jpg"
      const file = await cropper.current!.getFile(name, { type: "image/jpeg", maxSize: 512, ...cropOptions })
      setImage(file)
      setPending(null)
    } catch {
      // Cropping can fail for cross-origin images; fall back to the original file.
      setImage(pending)
      setPending(null)
    } finally {
      setSaving(false)
    }
  }

  const describedBy = [control["aria-describedby"], rejection ? errorId : null].filter(Boolean).join(" ") || undefined

  return (
    <div data-slot="avatar-upload" className={cn("gap-4 flex flex-wrap items-center", className)}>
      <Avatar className={cn(avatarUploadVariants({ size }), classNames?.avatar)}>
        {src ? <AvatarImage src={src} alt={t("file.photoOf", { name: personName })} /> : null}
        <AvatarFallback
          className="text-[length:inherit]"
          role="img"
          aria-label={t("file.noPhotoFor", { name: personName })}
        >
          {personName ? initials(personName) : <Icon name="user" />}
        </AvatarFallback>
      </Avatar>
      <div className={cn("gap-2 flex flex-col items-start", classNames?.actions)}>
        <input
          ref={merged}
          type="file"
          accept={accept}
          tabIndex={-1}
          onChange={handleChange}
          className="sr-only"
          {...control}
          aria-describedby={describedBy}
          aria-label={(props["aria-label"] as string | undefined) ?? (field ? undefined : t("file.uploadPhoto"))}
        />
        <div className="gap-2 flex flex-wrap">
          <Button
            ref={changeRef}
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled}
            aria-describedby={describedBy}
            onClick={() => local.current?.click()}
          >
            <Icon name="camera" data-icon="inline-start" />
            {src ? t("file.changePhoto") : t("file.uploadPhoto")}
          </Button>
          {removable && src ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={disabled}
              onClick={() => {
                setImage(null)
                changeRef.current?.focus()
              }}
            >
              <Icon name="trash" data-icon="inline-start" />
              {t("file.removePhoto")}
            </Button>
          ) : null}
        </div>
        {rejection ? (
          <p id={errorId} role="alert" className={cn("text-sm text-destructive", classNames?.error)}>
            {message(rejection)}
          </p>
        ) : null}
      </div>

      <Dialog open={!!pending} onOpenChange={(open) => !open && setPending(null)}>
        <DialogContent
          showCloseButton={false}
          className={cn("sm:max-w-md", classNames?.dialog)}
          onCloseAutoFocus={(e) => {
            e.preventDefault()
            changeRef.current?.focus()
          }}
        >
          <DialogHeader>
            <DialogTitle>{t("file.cropPhoto")}</DialogTitle>
            <DialogDescription>{t("file.cropPhotoHint")}</DialogDescription>
          </DialogHeader>
          {pending ? (
            <ImageCropper
              ref={cropper}
              src={pending}
              alt={t("file.photoOf", { name: personName })}
              aspect={1}
              cropShape="round"
              rotatable
            />
          ) : null}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setPending(null)}>
              {t("common.cancel")}
            </Button>
            <Button type="button" disabled={saving} onClick={save}>
              {saving ? <Icon name="loading" data-icon="inline-start" className="animate-spin" /> : null}
              {t("file.savePhoto")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
