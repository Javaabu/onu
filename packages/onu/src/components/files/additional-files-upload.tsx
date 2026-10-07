"use client"

import * as React from "react"

import { Icon } from "../../icons/icon"
import { cn } from "../../lib/utils"
import { useTranslation } from "../../providers/onu-provider"
import type { ThaanaProp } from "../../thaana/use-thaana-field"
import { Badge } from "../../ui/badge"
import { Button } from "../../ui/button"
import { FormField } from "../form/form-field"
import { TextInput } from "../inputs/text-input"
import { FileRow } from "./_file-row"
import { useControllable } from "./_use-controllable"
import { FileInput, type FileInputProps } from "./file-input"
import { syncInputFiles } from "./file-utils"

/** A file already attached to the record. */
export interface ExistingAttachment {
  id: string | number
  name: string
  url?: string
  size?: number
  type?: string
  thumbnailUrl?: string
  description?: string
}

/** A newly picked file with its display name and description. */
export interface NewAttachment {
  key: string
  file: File
  name: string
  description: string
}

export interface AdditionalFilesValue {
  /** Ids of existing attachments marked for removal. */
  removed: (string | number)[]
  /** New files to attach. */
  added: NewAttachment[]
}

export interface AdditionalFilesUploadProps
  extends
    Omit<React.ComponentProps<"div">, "defaultValue" | "onChange">,
    Pick<FileInputProps, "accept" | "maxSize" | "minSize" | "onReject"> {
  /** Attachments already saved on the record. */
  existing?: ExistingAttachment[]
  value?: AdditionalFilesValue
  defaultValue?: AdditionalFilesValue
  onChange?: (value: AdditionalFilesValue) => void
  /** Ask for a display name per new file (defaults to the file name). Default `true`. */
  withName?: boolean
  /** Ask for a description per new file. Default `true`. */
  withDescription?: boolean
  /** Thaana typing in the name and description fields. */
  thaana?: ThaanaProp
  /** Most attachments in total (existing that are kept + new). */
  maxFiles?: number
  disabled?: boolean
  /**
   * Prefix for native form fields, so a plain form submit works:
   * `name[removed][]`, `name[added][0][file]`, `name[added][0][name]`, `name[added][0][description]`.
   */
  name?: string
  /** Accessible label for the picker. */
  "aria-label"?: string
  classNames?: { list?: string; item?: string; fields?: string; picker?: string; empty?: string }
}

const EMPTY: AdditionalFilesValue = { removed: [], added: [] }
const NO_FILES: File[] = []
let nextKey = 0

/**
 * Manages a record's attachments: keeps existing ones (each can be removed and restored)
 * and adds new files, each with an optional display name and description.
 */
export function AdditionalFilesUpload({
  existing = [],
  value,
  defaultValue,
  onChange,
  withName = true,
  withDescription = true,
  thaana,
  accept,
  maxSize,
  minSize,
  onReject,
  maxFiles,
  disabled,
  name,
  "aria-label": ariaLabel,
  className,
  classNames,
  ...props
}: AdditionalFilesUploadProps) {
  const { t } = useTranslation()
  const [state, setState] = useControllable<AdditionalFilesValue>(value, defaultValue ?? EMPTY, onChange)
  const pickerRef = React.useRef<HTMLInputElement>(null)
  const rootRef = React.useRef<HTMLDivElement>(null)
  const [announcement, setAnnouncement] = React.useState("")
  const kept = existing.filter((a) => !state.removed.includes(a.id)).length
  const total = kept + state.added.length
  const remaining = maxFiles !== undefined ? Math.max(0, maxFiles - total) : undefined

  const focusLater = (selector: string) => {
    setTimeout(() => rootRef.current?.querySelector<HTMLElement>(selector)?.focus(), 0)
  }

  const toggleRemoved = (attachment: ExistingAttachment) => {
    const removed = state.removed.includes(attachment.id)
    setState({
      ...state,
      removed: removed ? state.removed.filter((id) => id !== attachment.id) : [...state.removed, attachment.id],
    })
    setAnnouncement(t(removed ? "file.restoredFile" : "file.markedForRemoval", { name: attachment.name }))
    focusLater(`[data-attachment="${CSS.escape(String(attachment.id))}"] [data-action]`)
  }

  const addFiles = (files: File[]) => {
    const allowed = remaining !== undefined ? files.slice(0, remaining) : files
    if (!allowed.length) return
    const added = allowed.map<NewAttachment>((file) => ({
      key: `new-${++nextKey}`,
      file,
      name: file.name.replace(/\.[^.]+$/, ""),
      description: "",
    }))
    setState({ ...state, added: [...state.added, ...added] })
    setAnnouncement(t("file.filesAdded", { count: added.length }))
  }

  const updateAdded = (key: string, patch: Partial<NewAttachment>) =>
    setState({ ...state, added: state.added.map((a) => (a.key === key ? { ...a, ...patch } : a)) })

  const removeAdded = (item: NewAttachment) => {
    setState({ ...state, added: state.added.filter((a) => a.key !== item.key) })
    setAnnouncement(t("file.removedFile", { name: item.file.name }))
    pickerRef.current?.focus()
  }

  return (
    <div
      ref={rootRef}
      data-slot="additional-files-upload"
      className={cn("gap-3 @container/attachments grid w-full", className)}
      {...props}
    >
      {existing.length || state.added.length ? (
        <ul aria-label={t("file.attachments")} className={cn("gap-2 grid", classNames?.list)}>
          {existing.map((attachment) => {
            const removed = state.removed.includes(attachment.id)
            return (
              <FileRow
                key={`existing-${attachment.id}`}
                data-attachment={String(attachment.id)}
                data-removed={removed || undefined}
                name={attachment.name}
                size={attachment.size}
                type={attachment.type}
                thumbnailUrl={attachment.thumbnailUrl}
                struck={removed}
                className={cn(removed && "border-dashed bg-muted/50", classNames?.item)}
                meta={
                  removed ? (
                    <Badge variant="outline" className="text-destructive">
                      {t("file.willBeRemoved")}
                    </Badge>
                  ) : attachment.description ? (
                    <span dir="auto" className="truncate">
                      {attachment.description}
                    </span>
                  ) : null
                }
                actions={
                  <>
                    {attachment.url && !removed ? (
                      <Button asChild variant="ghost" size="icon-sm">
                        <a
                          href={attachment.url}
                          target="_blank"
                          rel="noreferrer"
                          aria-label={t("file.openFile", { name: attachment.name })}
                        >
                          <Icon name="external-link" />
                        </a>
                      </Button>
                    ) : null}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      data-action
                      disabled={disabled}
                      aria-label={t(removed ? "file.restoreFile" : "file.removeFile", { name: attachment.name })}
                      onClick={() => toggleRemoved(attachment)}
                    >
                      <Icon name={removed ? "restore" : "trash"} />
                    </Button>
                    {removed && name ? <input type="hidden" name={`${name}[removed][]`} value={attachment.id} /> : null}
                  </>
                }
              />
            )
          })}
          {state.added.map((item, index) => (
            <FileRow
              key={item.key}
              name={item.file.name}
              size={item.file.size}
              file={item.file}
              className={classNames?.item}
              meta={<Badge variant="secondary">{t("file.new")}</Badge>}
              actions={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  disabled={disabled}
                  aria-label={t("file.removeFile", { name: item.file.name })}
                  onClick={() => removeAdded(item)}
                >
                  <Icon name="close" />
                </Button>
              }
            >
              {name ? (
                <input
                  type="file"
                  hidden
                  tabIndex={-1}
                  aria-hidden
                  name={`${name}[added][${index}][file]`}
                  ref={(el) => syncInputFiles(el, [item.file])}
                />
              ) : null}
              {withName || withDescription ? (
                <div className={cn("gap-2 mt-1 @md/attachments:grid-cols-2 grid", classNames?.fields)}>
                  {withName ? (
                    <FormField label={t("file.displayName")} className="[&_label]:text-xs" disabled={disabled}>
                      <TextInput
                        value={item.name}
                        thaana={thaana}
                        name={name ? `${name}[added][${index}][name]` : undefined}
                        onChange={(e) => updateAdded(item.key, { name: e.target.value })}
                      />
                    </FormField>
                  ) : null}
                  {withDescription ? (
                    <FormField label={t("file.description")} className="[&_label]:text-xs" disabled={disabled}>
                      <TextInput
                        value={item.description}
                        thaana={thaana}
                        name={name ? `${name}[added][${index}][description]` : undefined}
                        onChange={(e) => updateAdded(item.key, { description: e.target.value })}
                      />
                    </FormField>
                  ) : null}
                </div>
              ) : null}
            </FileRow>
          ))}
        </ul>
      ) : (
        <p className={cn("text-sm text-muted-foreground", classNames?.empty)}>{t("file.noAttachments")}</p>
      )}

      <FileInput
        ref={pickerRef}
        name=""
        append
        value={NO_FILES}
        onChange={addFiles}
        onReject={onReject}
        accept={accept}
        maxSize={maxSize}
        minSize={minSize}
        maxFiles={maxFiles}
        countOffset={total}
        disabled={disabled}
        pickDisabled={remaining === 0}
        showList={false}
        aria-label={ariaLabel ?? t("file.addFiles")}
        buttonLabel={t("file.addFiles")}
        summary={
          maxFiles !== undefined
            ? t("file.countOfMax", { count: total, max: maxFiles })
            : t("file.attachmentCount", { count: total })
        }
        className={classNames?.picker}
      />
      <div role="status" aria-live="polite" className="sr-only">
        {announcement}
      </div>
    </div>
  )
}
