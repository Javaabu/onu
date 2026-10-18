var e=`import * as React from "react"
import {
  BulkActionBar,
  Button,
  Card,
  ConfirmDialog,
  CopyInput,
  DescriptionList,
  DropzoneUploader,
  FileIcon,
  FormField,
  Icon,
  MediaLister,
  PageTitle,
  Select,
  TextInput,
  toast,
  useFormatFileSize,
  type MediaId,
  type UploadFn,
} from "@javaabu/onu"

import { useDv, useTr } from "../_shared/i18n"
import { routes } from "../_shared/routes"
import { AdminShell } from "../_shared/shells"
import { mediaItems, wait, type LibraryItem, type MediaKind } from "./_data"

export const meta = { title: "Media library", group: "Admin: content", layout: "bare", order: 3 }

const CDN = "https://cdn.services.gov.mv/media/"

/** A pretend upload with progress. Files with "fail" in the name are rejected. */
const fakeUpload: UploadFn = (file, { onProgress, signal }) =>
  new Promise((resolve, reject) => {
    let progress = 0
    const timer = setInterval(() => {
      progress = Math.min(100, progress + 12 + Math.round(Math.random() * 14))
      onProgress(progress)
      if (progress >= 100) {
        clearInterval(timer)
        if (/fail/i.test(file.name)) reject(new Error("The file could not be scanned. Please try another file."))
        else resolve({ id: \`up-\${Date.now()}-\${file.name}\` })
      }
    }, 200)
    signal.addEventListener("abort", () => {
      clearInterval(timer)
      reject(new DOMException("Aborted", "AbortError"))
    })
  })

function kindOf(type: string): MediaKind {
  if (type.startsWith("image/")) return "image"
  if (type.startsWith("video/")) return "video"
  if (type.startsWith("audio/")) return "audio"
  return "document"
}

export default function MediaLibraryPage() {
  const tr = useTr()
  const dv = useDv()
  const formatSize = useFormatFileSize()
  const [items, setItems] = React.useState<LibraryItem[]>(mediaItems)
  const [selected, setSelected] = React.useState<MediaId[]>([])
  const [active, setActive] = React.useState<MediaId | null>(mediaItems[0]?.id ?? null)
  const [kind, setKind] = React.useState("all")
  const [uploader, setUploader] = React.useState("all")
  const [showUpload, setShowUpload] = React.useState(false)
  const detailsRef = React.useRef<HTMLDivElement>(null)
  const [alt, setAlt] = React.useState<Record<string, string>>({})

  const visible = items
    .filter((i) => kind === "all" || i.kind === kind)
    .filter((i) => uploader === "all" || i.uploadedBy === uploader)
    .map((i) => ({ ...i, alt: alt[i.id as string] ?? i.alt }))
  const current = items.find((i) => i.id === active) ?? null
  const uploaders = [...new Set(items.map((i) => i.uploadedBy))]

  function remove(ids: MediaId[]) {
    setItems((prev) => prev.filter((i) => !ids.includes(i.id)))
    setSelected((prev) => prev.filter((id) => !ids.includes(id)))
    if (active && ids.includes(active)) setActive(null)
  }

  const kindOptions = [
    { value: "all", label: tr("All types", "ހުރިހާ ބާވަތެއް") },
    { value: "image", label: tr("Images", "ފޮޓޯ") },
    { value: "document", label: tr("Documents", "ލިޔެކިޔުން") },
    { value: "video", label: tr("Video", "ވީޑިއޯ") },
    { value: "audio", label: tr("Audio", "އޯޑިއޯ") },
  ]

  return (
    <AdminShell
      contentWidth="full"
      breadcrumbs={[{ label: tr("Content", "ކޮންޓެންޓް") }, { label: tr("Media library", "މީޑިއާ ލައިބްރަރީ") }]}
    >
      <div className="gap-6 grid">
        <PageTitle
          title={tr("Media library", "މީޑިއާ ލައިބްރަރީ")}
          description={tr(
            \`\${items.length} files. Select files to delete or download them together.\`,
            \`\${items.length} ފައިލް. އެއްކޮށް ޑިލީޓް ނުވަތަ ޑައުންލޯޑް ކުރަން ފައިލްތައް ހޮވާ.\`,
          )}
          action={
            <Button onClick={() => setShowUpload((v) => !v)} aria-expanded={showUpload} aria-controls="media-upload">
              <Icon name="upload" />
              {tr("Upload files", "ފައިލް އަޕްލޯޑްކުރޭ")}
            </Button>
          }
          links={[{ label: tr("Posts", "ޕޯސްޓްތައް"), href: routes.adminContent.postEditor, icon: "edit" }]}
        />

        {showUpload ? (
          <Card id="media-upload" title={tr("Upload files", "ފައިލް އަޕްލޯޑްކުރޭ")} headingLevel={2} size="sm">
            <FormField label={tr("Files", "ފައިލްތައް")} hideLabel>
              <DropzoneUploader
                upload={fakeUpload}
                accept="image/*,.pdf,.xlsx,.mp4,.mp3"
                maxSize={20 * 1024 * 1024}
                maxFiles={10}
                description={tr(
                  "Images, PDF, Excel, MP4 or MP3, up to 20 MB each. Paste a screenshot to upload it.",
                  "ފޮޓޯ، PDF، Excel، MP4 ނުވަތަ MP3، ކޮންމެ ފައިލެއް 20 MB އަށްވުރެ ކުޑަކޮށް.",
                )}
                onUploaded={(item) => {
                  const url = item.file.type.startsWith("image/") ? URL.createObjectURL(item.file) : undefined
                  setItems((prev) => [
                    {
                      id: \`up-\${prev.length}-\${item.file.name}\`,
                      name: item.file.name,
                      title: { en: item.file.name, dv: item.file.name },
                      type: item.file.type,
                      kind: kindOf(item.file.type),
                      size: item.file.size,
                      url,
                      thumbnailUrl: url,
                      alt: "",
                      uploadedBy: "Aishath Shifa",
                      uploadedAt: new Date().toISOString().slice(0, 10),
                      usedIn: 0,
                    },
                    ...prev,
                  ])
                  toast.success(tr(\`\${item.file.name} uploaded\`, \`\${item.file.name} އަޕްލޯޑްކުރެވިއްޖެ\`))
                }}
              />
            </FormField>
          </Card>
        ) : null}

        <BulkActionBar
          selected={selected as string[]}
          onClearSelection={() => setSelected([])}
          noun={dv ? { one: "ފައިލް", other: "ފައިލް" } : { one: "file", other: "files" }}
          onSuccess={(message) => toast.success(message)}
          actions={[
            {
              id: "download",
              label: tr("Download", "ޑައުންލޯޑް"),
              icon: "download",
              run: () => wait(600),
              successMessage: (n) => tr(\`\${n} files ready to download\`, \`\${n} ފައިލް ޑައުންލޯޑަށް ތައްޔާރު\`),
            },
            {
              id: "delete",
              label: tr("Delete", "ޑިލީޓް"),
              icon: "trash",
              destructive: true,
              run: async (ids) => {
                await wait(700)
                remove(ids)
              },
            },
          ]}
        />

        <div className="gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start grid">
          <MediaLister
            items={visible}
            label={tr("Media library", "މީޑިއާ ލައިބްރަރީ")}
            selectionMode="multiple"
            selected={selected}
            onSelectedChange={(ids) => {
              const added = ids.find((id) => !selected.includes(id))
              if (added !== undefined) setActive(added)
              setSelected(ids)
            }}
            searchThaana={dv}
            emptyMessage={tr("No files match these filters.", "މި ފިލްޓަރުތަކާ ގުޅޭ ފައިލެއް ނެތް.")}
            toolbar={
              <div className="gap-2 flex flex-wrap items-center">
                <Select
                  aria-label={tr("File type", "ފައިލްގެ ބާވަތް")}
                  options={kindOptions}
                  value={kind}
                  onValueChange={(v) => setKind(v || "all")}
                  size="sm"
                  className="w-36"
                />
                <Select
                  aria-label={tr("Uploaded by", "އަޕްލޯޑްކުރި ފަރާތް")}
                  options={[
                    { value: "all", label: tr("Anyone", "ކޮންމެ ފަރާތެއް") },
                    ...uploaders.map((u) => ({ value: u, label: u })),
                  ]}
                  value={uploader}
                  onValueChange={(v) => setUploader(v || "all")}
                  size="sm"
                  className="w-40"
                />
              </div>
            }
            renderActions={(item) => (
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={tr(\`Details of \${item.name}\`, \`\${item.name} ގެ ތަފްޞީލް\`)}
                aria-pressed={active === item.id}
                onClick={() => {
                  setActive(item.id)
                  if (window.matchMedia("(max-width: 1023px)").matches) {
                    detailsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
                  }
                }}
              >
                <Icon name="info" />
              </Button>
            )}
          />

          <Card
            ref={detailsRef}
            title={tr("Details", "ތަފްޞީލް")}
            headingLevel={2}
            size="sm"
            className="lg:top-20 lg:sticky"
            aria-live="polite"
          >
            {current ? (
              <div className="gap-4 grid">
                <div className="aspect-video flex items-center justify-center overflow-hidden rounded-md border bg-muted">
                  {current.url && current.kind === "image" ? (
                    <img
                      src={current.url}
                      alt={alt[current.id as string] ?? current.alt ?? ""}
                      className="size-full object-cover"
                    />
                  ) : (
                    <FileIcon name={current.name} type={current.type} size="lg" />
                  )}
                </div>
                <p className="font-medium break-all" dir="auto">
                  {dv ? current.title.dv : current.title.en}
                </p>
                <DescriptionList
                  layout="stacked"
                  items={[
                    { label: tr("File name", "ފައިލްގެ ނަން"), value: <span dir="ltr">{current.name}</span> },
                    { label: tr("Type", "ބާވަތް"), value: <span dir="ltr">{current.type}</span> },
                    { label: tr("Size", "ސައިޒް"), value: current.size ? formatSize(current.size) : null },
                    {
                      label: tr("Dimensions", "ދިގު ފުޅާމިން"),
                      value: current.width ? <span dir="ltr">{\`\${current.width} × \${current.height}\`}</span> : null,
                    },
                    { label: tr("Uploaded by", "އަޕްލޯޑްކުރި ފަރާތް"), value: current.uploadedBy },
                    { label: tr("Uploaded on", "އަޕްލޯޑްކުރި ތާރީޚު"), value: current.uploadedAt },
                    {
                      label: tr("Used in", "ބޭނުންކުރެވިފައިވާ"),
                      value: tr(\`\${current.usedIn} posts\`, \`\${current.usedIn} ޕޯސްޓް\`),
                    },
                  ]}
                />
                {current.kind === "image" ? (
                  <FormField
                    label={tr("Alt text", "އޯލްޓް ޓެކްސްޓް")}
                    help={tr("Describe the image for screen readers.", "ސްކްރީން ރީޑަރަށް ފޮޓޯ ބަޔާންކުރައްވާ.")}
                  >
                    <TextInput
                      dir="auto"
                      value={alt[current.id as string] ?? current.alt ?? ""}
                      onChange={(e) => setAlt((a) => ({ ...a, [current.id as string]: e.target.value }))}
                      onBlur={() => toast.success(tr("Alt text saved", "އޯލްޓް ޓެކްސްޓް ސޭވްކުރެވިއްޖެ"))}
                    />
                  </FormField>
                ) : null}
                <FormField label={tr("File URL", "ފައިލްގެ ލިންކް")}>
                  <CopyInput
                    value={\`\${CDN}\${current.name}\`}
                    dir="ltr"
                    onCopy={() => toast.success(tr("Link copied", "ލިންކް ކޮޕީކުރެވިއްޖެ"))}
                  />
                </FormField>
                <ConfirmDialog
                  trigger={
                    <Button variant="outline" className="text-destructive">
                      <Icon name="trash" />
                      {tr("Delete file", "ފައިލް ޑިލީޓްކުރޭ")}
                    </Button>
                  }
                  variant="destructive"
                  title={tr(\`Delete \${current.name}?\`, \`\${current.name} ޑިލީޓްކުރަންތަ؟\`)}
                  description={
                    current.usedIn
                      ? tr(
                          \`It is used in \${current.usedIn} posts. They will show a broken image.\`,
                          \`މިއީ \${current.usedIn} ޕޯސްޓެއްގައި ބޭނުންކުރާ ފައިލެއް.\`,
                        )
                      : tr("This cannot be undone.", "މިކަން އަނބުރާ ނުގެނެވޭނެ.")
                  }
                  confirmLabel={tr("Delete", "ޑިލީޓް")}
                  onConfirm={async () => {
                    await wait(600)
                    remove([current.id])
                    toast.success(tr("File deleted", "ފައިލް ޑިލީޓްކުރެވިއްޖެ"))
                  }}
                />
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                {tr("Select a file to see its details.", "ތަފްޞީލް ބެލުމަށް ފައިލެއް ހޮވާ.")}
              </p>
            )}
          </Card>
        </div>
      </div>
    </AdminShell>
  )
}
`;export{e as default};