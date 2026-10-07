"use client"

import * as React from "react"

import { cn } from "../../lib/utils"
import { useTranslation } from "../../providers/onu-provider"
import { useFormField } from "../form/form-field"
import { useMergedRef } from "../inputs/text-input"
import { FileInput, type FileInputProps } from "./file-input"
import { UploadProgress } from "./upload-progress"
import { useUploadQueue, type UploadItem, type UploadSource } from "./use-files"

const NO_FILES: File[] = []

/** Reads an id from common response shapes: `{ id }`, `{ data: { id } }`, `{ uuid }`. */
export function defaultUploadValue(response: unknown): string | undefined {
  if (response === null || response === undefined) return undefined
  if (typeof response === "string" || typeof response === "number") return String(response)
  if (typeof response !== "object") return undefined
  const r = response as { id?: unknown; uuid?: unknown; data?: unknown }
  const id = r.id ?? r.uuid
  if (typeof id === "string" || typeof id === "number") return String(id)
  return r.data !== undefined ? defaultUploadValue(r.data) : undefined
}

export interface InstantFileUploadProps<R = unknown>
  extends
    UploadSource<R>,
    Omit<
      FileInputProps,
      "value" | "defaultValue" | "onChange" | "onError" | "showList" | "append" | "summary" | "name"
    > {
  /** Called when a file finishes uploading, with the server response in `item.response`. */
  onUploaded?: (item: UploadItem<R>) => void
  /** Called when an upload fails. */
  onError?: (item: UploadItem<R>, error: unknown) => void
  /** Called whenever the upload list changes. */
  onItemsChange?: (items: UploadItem<R>[]) => void
  /**
   * Name for hidden inputs holding each uploaded file's id, so a plain form submit sends
   * them (`name[]` when `multiple`). Defaults to the surrounding FormField's name.
   */
  name?: string
  /** Gets the value to submit from a response. Default: `id`, `uuid` or `data.id`. */
  getValue?: (response: R) => string | number | null | undefined
  classNames?: FileInputProps["classNames"] & { progress?: string }
}

/**
 * Uploads each file as soon as it is chosen, with per-file progress, cancel and retry.
 * Pass your own `upload(file, { onProgress, signal })` or a `url` for the built-in
 * XHR uploader (Laravel JSON responses and 422 errors understood).
 */
export function InstantFileUpload<R = unknown>({
  upload,
  url,
  uploadOptions,
  onUploaded,
  onError,
  onItemsChange,
  name,
  getValue,
  multiple,
  className,
  classNames,
  ref,
  ...props
}: InstantFileUploadProps<R>) {
  const { t } = useTranslation()
  const field = useFormField()
  const local = React.useRef<HTMLInputElement>(null)
  const merged = useMergedRef(local, ref)
  const queue = useUploadQueue<R>({ upload, url, uploadOptions, onUploaded, onError, onItemsChange })
  const hiddenName = name ?? field?.name
  const active = queue.items.filter((i) => i.status !== "cancelled" && i.status !== "error")
  const singleTaken = !multiple && active.length > 0

  const handlePick = (files: File[]) => {
    if (!files.length) return
    queue.add(multiple ? files : files.slice(0, 1))
  }

  const remove = (id: string) => {
    queue.remove(id)
    local.current?.focus()
  }

  const uploading = queue.items.filter((i) => i.status === "uploading").length
  const done = queue.items.filter((i) => i.status === "success").length

  return (
    <div data-slot="instant-file-upload" className={cn("gap-2 grid w-full", className)}>
      <FileInput
        {...props}
        ref={merged}
        name=""
        multiple={multiple}
        value={NO_FILES}
        onChange={handlePick}
        pickDisabled={singleTaken}
        showList={false}
        summary={
          uploading
            ? t("file.uploadingCount", { count: uploading })
            : done
              ? t("file.uploadedCount", { count: done })
              : undefined
        }
        classNames={classNames}
      />
      <UploadProgress
        items={queue.items}
        onCancel={queue.cancel}
        onRetry={queue.retry}
        onRemove={remove}
        announcement={queue.announcement}
        className={classNames?.progress}
      />
      {hiddenName
        ? queue.items
            .filter((i) => i.status === "success")
            .map((item) => {
              const value = getValue ? getValue(item.response as R) : defaultUploadValue(item.response)
              return value === null || value === undefined ? null : (
                <input
                  key={item.id}
                  type="hidden"
                  name={multiple ? `${hiddenName}[]` : hiddenName}
                  value={String(value)}
                />
              )
            })
        : null}
    </div>
  )
}
