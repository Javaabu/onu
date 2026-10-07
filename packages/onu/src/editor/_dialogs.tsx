"use client"

import * as React from "react"
import type { Editor } from "@tiptap/core"

import { FormField } from "../components/form/form-field"
import { TextInput } from "../components/inputs/text-input"
import { useTranslation } from "../providers/onu-provider"
import { Button } from "../ui/button"
import { Checkbox } from "../ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog"
import { Label } from "../ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import { isSafeImageUrl, normalizeUrl, toEmbedUrl } from "./_schema"

/** Applies a link from the link dialog: wraps the selection, or inserts the URL at the caret. */
export function applyLink(editor: Editor, { href, newTab }: { href: string; newTab: boolean }) {
  const target = newTab ? "_blank" : null
  if (editor.state.selection.empty && !editor.isActive("link")) {
    editor
      .chain()
      .insertContent({ type: "text", text: href, marks: [{ type: "link", attrs: { href, target } }] })
      .run()
  } else {
    editor.chain().extendMarkRange("link").setLink({ href, target }).run()
  }
}

export function removeLink(editor: Editor) {
  editor.chain().extendMarkRange("link").unsetLink().run()
}

/** The link under the caret, for editing it. */
export function currentLink(editor: Editor | null): { href?: string; newTab?: boolean } {
  if (!editor?.isActive("link")) return {}
  const attrs = editor.getAttributes("link") as { href?: string; target?: string }
  return { href: attrs.href, newTab: attrs.target === "_blank" }
}

/** Uploads an image file and resolves to its public URL. */
export type ImageUploadHandler = (file: File) => Promise<string>

interface BaseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Where focus goes after the dialog closes (R25.10). */
  onCloseAutoFocus?: (event: Event) => void
}

/** Dialog chrome shared by the link, image and embed dialogs. Content unmounts on close, so form state resets. */
function EditorDialog({
  open,
  onOpenChange,
  onCloseAutoFocus,
  title,
  children,
}: BaseDialogProps & { title: string; children: React.ReactNode }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} onCloseAutoFocus={onCloseAutoFocus} className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className="sr-only">{title}</DialogDescription>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  )
}

function DialogForm({
  onSubmit,
  onCancel,
  actions,
  children,
}: {
  onSubmit: () => void
  onCancel: () => void
  actions: React.ReactNode
  children: React.ReactNode
}) {
  const { t } = useTranslation()
  return (
    <form
      className="gap-4 grid"
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        // The editor may sit inside a page form; never submit that one.
        event.stopPropagation()
        onSubmit()
      }}
    >
      {children}
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          {t("common.cancel")}
        </Button>
        {actions}
      </DialogFooter>
    </form>
  )
}

export interface LinkDialogProps extends BaseDialogProps {
  /** The current link, when editing one. */
  href?: string
  newTab?: boolean
  onSubmit: (link: { href: string; newTab: boolean }) => void
  onRemove: () => void
}

export function LinkDialog({ open, onOpenChange, onCloseAutoFocus, href, ...props }: LinkDialogProps) {
  const { t } = useTranslation()
  return (
    <EditorDialog
      open={open}
      onOpenChange={onOpenChange}
      onCloseAutoFocus={onCloseAutoFocus}
      title={href ? t("editor.editLink") : t("editor.insertLink")}
    >
      <LinkForm href={href} close={() => onOpenChange(false)} {...props} />
    </EditorDialog>
  )
}

function LinkForm({
  href,
  newTab,
  onSubmit,
  onRemove,
  close,
}: Pick<LinkDialogProps, "href" | "newTab" | "onSubmit" | "onRemove"> & { close: () => void }) {
  const { t } = useTranslation()
  const [url, setUrl] = React.useState(href ?? "")
  const [blank, setBlank] = React.useState(!!newTab)
  const [error, setError] = React.useState<string | null>(null)
  const checkboxId = React.useId()

  return (
    <DialogForm
      onCancel={close}
      onSubmit={() => {
        const normalized = normalizeUrl(url)
        if (!normalized) {
          setError(t("editor.invalidUrl"))
          return
        }
        onSubmit({ href: normalized, newTab: blank })
        close()
      }}
      actions={
        <>
          {href ? (
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                onRemove()
                close()
              }}
            >
              {t("editor.removeLink")}
            </Button>
          ) : null}
          <Button type="submit">{href ? t("editor.update") : t("editor.insert")}</Button>
        </>
      }
    >
      <FormField label={t("editor.linkUrl")} error={error} required>
        <TextInput
          type="url"
          inputMode="url"
          autoComplete="url"
          dir="ltr"
          placeholder={t("editor.linkUrlPlaceholder")}
          value={url}
          onChange={(event) => {
            setUrl(event.target.value)
            setError(null)
          }}
        />
      </FormField>
      <div className="gap-2 flex items-center">
        <Checkbox id={checkboxId} checked={blank} onCheckedChange={(value) => setBlank(value === true)} />
        <Label htmlFor={checkboxId}>{t("editor.linkNewTab")}</Label>
      </div>
    </DialogForm>
  )
}

export interface ImageDialogProps extends BaseDialogProps {
  onSubmit: (image: { src: string; alt: string }) => void
  onUpload?: ImageUploadHandler
}

export function ImageDialog({ open, onOpenChange, onCloseAutoFocus, ...props }: ImageDialogProps) {
  const { t } = useTranslation()
  return (
    <EditorDialog
      open={open}
      onOpenChange={onOpenChange}
      onCloseAutoFocus={onCloseAutoFocus}
      title={t("editor.insertImage")}
    >
      <ImageForm close={() => onOpenChange(false)} {...props} />
    </EditorDialog>
  )
}

/** Accepts http(s), relative, `blob:` and raster `data:` URLs; adds `https://` to bare hosts. */
function toImageUrl(input: string): string | null {
  const raw = input.trim()
  const url = /^(data|blob):/i.test(raw) ? raw : normalizeUrl(raw)
  return url && isSafeImageUrl(url) ? url : null
}

function ImageForm({
  onSubmit,
  onUpload,
  close,
}: Pick<ImageDialogProps, "onSubmit" | "onUpload"> & { close: () => void }) {
  const { t } = useTranslation()
  const [tab, setTab] = React.useState<"url" | "upload">("url")
  const [src, setSrc] = React.useState("")
  const [alt, setAlt] = React.useState("")
  const [file, setFile] = React.useState<File | null>(null)
  const [status, setStatus] = React.useState<"idle" | "uploading" | "error">("idle")
  const [error, setError] = React.useState<string | null>(null)

  const submit = async () => {
    if (tab === "upload" && onUpload) {
      if (!file) return
      setStatus("uploading")
      try {
        const url = await onUpload(file)
        onSubmit({ src: url, alt: alt.trim() })
        close()
      } catch {
        setStatus("error")
      }
      return
    }
    const url = toImageUrl(src)
    if (!url) {
      setError(t("editor.invalidUrl"))
      return
    }
    onSubmit({ src: url, alt: alt.trim() })
    close()
  }

  const urlField = (
    <FormField label={t("editor.imageUrl")} error={error} required>
      <TextInput
        type="url"
        inputMode="url"
        dir="ltr"
        placeholder="https://"
        value={src}
        onChange={(event) => {
          setSrc(event.target.value)
          setError(null)
        }}
      />
    </FormField>
  )

  return (
    <DialogForm
      onCancel={close}
      onSubmit={() => void submit()}
      actions={
        <Button type="submit" disabled={status === "uploading" || (tab === "upload" && !file)}>
          {status === "uploading" ? t("editor.imageUploading") : t("editor.insert")}
        </Button>
      }
    >
      {onUpload ? (
        <Tabs value={tab} onValueChange={(value) => setTab(value as "url" | "upload")}>
          <TabsList className="w-full">
            <TabsTrigger value="url">{t("editor.imageFromUrl")}</TabsTrigger>
            <TabsTrigger value="upload">{t("editor.imageUpload")}</TabsTrigger>
          </TabsList>
          <TabsContent value="url" className="pt-2">
            {urlField}
          </TabsContent>
          <TabsContent value="upload" className="pt-2">
            <FormField label={t("editor.imageFile")} required>
              <TextInput
                type="file"
                accept="image/*"
                onChange={(event) => {
                  setFile(event.target.files?.[0] ?? null)
                  setStatus("idle")
                }}
              />
            </FormField>
          </TabsContent>
        </Tabs>
      ) : (
        urlField
      )}
      <FormField label={t("editor.imageAlt")} help={t("editor.imageAltHelp")}>
        <TextInput value={alt} onChange={(event) => setAlt(event.target.value)} />
      </FormField>
      <p role="status" aria-live="polite" className="text-sm text-destructive empty:hidden">
        {status === "error" ? t("editor.imageUploadFailed") : null}
      </p>
    </DialogForm>
  )
}

export interface EmbedDialogProps extends BaseDialogProps {
  onSubmit: (embed: { src: string }) => void
}

export function EmbedDialog({ open, onOpenChange, onCloseAutoFocus, onSubmit }: EmbedDialogProps) {
  const { t } = useTranslation()
  return (
    <EditorDialog
      open={open}
      onOpenChange={onOpenChange}
      onCloseAutoFocus={onCloseAutoFocus}
      title={t("editor.embedMedia")}
    >
      <EmbedForm onSubmit={onSubmit} close={() => onOpenChange(false)} />
    </EditorDialog>
  )
}

function EmbedForm({ onSubmit, close }: Pick<EmbedDialogProps, "onSubmit"> & { close: () => void }) {
  const { t } = useTranslation()
  const [src, setSrc] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)
  return (
    <DialogForm
      onCancel={close}
      onSubmit={() => {
        if (!toEmbedUrl(src)) {
          setError(t("editor.embedUnsupported"))
          return
        }
        onSubmit({ src: src.trim() })
        close()
      }}
      actions={<Button type="submit">{t("editor.insert")}</Button>}
    >
      <FormField label={t("editor.embedUrl")} help={t("editor.embedHelp")} error={error} required>
        <TextInput
          type="url"
          inputMode="url"
          dir="ltr"
          placeholder="https://www.youtube.com/watch?v="
          value={src}
          onChange={(event) => {
            setSrc(event.target.value)
            setError(null)
          }}
        />
      </FormField>
    </DialogForm>
  )
}
