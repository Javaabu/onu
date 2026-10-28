var e=`import * as React from "react"
import {
  AttachmentPreview,
  Button,
  EmptyState,
  FileInput,
  FormErrorsProvider,
  FormField,
  LinkButton,
  Modal,
  PageTitle,
  SearchBox,
  Section,
  Select,
  SegmentedControl,
  TextInput,
  toast,
  type FormErrors,
} from "@javaabu/onu"

import { CitizenShell } from "../_shared/shells"
import { useTr } from "../_shared/i18n"
import { routes } from "../_shared/routes"
import { documentUrl, documents as initialDocs, matchesAny, wait, type PortalDocument } from "../applications/_data"

export const meta = { title: "My documents", group: "Citizen portal", layout: "bare", order: 3 }

const CATEGORIES = ["identity", "certificates", "receipts"] as const

export default function MyDocumentsPage() {
  const tr = useTr()
  const [docs, setDocs] = React.useState<PortalDocument[]>(initialDocs)
  const [search, setSearch] = React.useState("")
  const [category, setCategory] = React.useState("all")

  const [open, setOpen] = React.useState(false)
  const [form, setForm] = React.useState<{ title: string; category: string; files: File[] }>({
    title: "",
    category: "",
    files: [],
  })
  const [errors, setErrors] = React.useState<FormErrors>({})
  const [saving, setSaving] = React.useState(false)

  const categoryLabel: Record<(typeof CATEGORIES)[number], string> = {
    identity: tr("Identity", "ހެއްކާ ބެހޭ"),
    certificates: tr("Licences and certificates", "ލައިސަންސާއި ސެޓްފިކެޓް"),
    receipts: tr("Receipts", "ރަސީދު"),
  }

  const shown = docs.filter(
    (d) => (category === "all" || d.category === category) && matchesAny(search, [d.name, d.title[0], d.title[1]]),
  )

  const upload = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs: Record<string, string[]> = {}
    if (!form.title.trim()) errs.title = [tr("Give the document a name.", "ލިޔުމަށް ނަމެއް ދެއްވާ.")]
    if (!form.category) errs.category = [tr("Choose a category.", "ބާވަތެއް ހޮވާ.")]
    if (!form.files.length) errs.file = [tr("Choose a file to upload.", "އަޕްލޯޑްކުރާނެ ފައިލެއް ހޮވާ.")]
    setErrors(errs)
    if (Object.keys(errs).length) return
    setSaving(true)
    await wait(900)
    const file = form.files[0] as File
    setDocs((d) => [
      {
        id: String(Date.now()),
        name: file.name,
        title: [form.title, form.title],
        category: form.category as PortalDocument["category"],
        size: file.size,
        added: new Date().toISOString(),
        kind: file.type.startsWith("image/") ? "image" : "pdf",
      },
      ...d,
    ])
    setSaving(false)
    setOpen(false)
    setForm({ title: "", category: "", files: [] })
    toast.success(tr("Document uploaded", "ލިޔުން އަޕްލޯޑްކުރެވިއްޖެ"), { description: form.title })
  }

  return (
    <CitizenShell>
      <div className="gap-6 grid grid-cols-1">
        <PageTitle
          title={tr("My documents", "އަޅުގަނޑުގެ ލިޔެކިޔުން")}
          description={tr(
            "Kept securely and reusable in any application.",
            "ރައްކާތެރިކޮށް ބަހައްޓައި، ކޮންމެ އެޕްލިކޭޝަނެއްގައި ބޭނުންކުރެވޭނެ.",
          )}
          action={
            <Button startIcon="upload" onClick={() => setOpen(true)}>
              {tr("Upload document", "ލިޔުމެއް އަޕްލޯޑްކުރޭ")}
            </Button>
          }
        />

        <div className="gap-3 md:flex-row md:items-center flex flex-col">
          <SearchBox
            value={search}
            onSearch={setSearch}
            placeholder={tr("Search documents…", "ލިޔުން ހޯދާ…")}
            aria-label={tr("Search documents", "ލިޔުން ހޯދާ")}
            className="md:max-w-sm"
          />
          <div className="min-w-0 max-w-full overflow-x-auto">
            <SegmentedControl
              aria-label={tr("Category", "ބާވަތް")}
              value={category}
              onValueChange={setCategory}
              options={[
                { value: "all", label: tr("All", "ހުރިހާ") },
                ...CATEGORIES.map((c) => ({ value: c, label: categoryLabel[c] })),
              ]}
            />
          </div>
        </div>

        <Section
          variant="card"
          title={tr("Business licence BL-2026-04417", "ވިޔަފާރީގެ ލައިސަންސް BL-2026-04417")}
          description={tr(
            "Issued 7 Oct 2026 · valid until 6 Oct 2027",
            "ދޫކުރީ 7 އޮކްޓޫބަރު 2026 · 6 އޮކްޓޫބަރު 2027 އާ ހަމައަށް",
          )}
          actions={
            <LinkButton href={routes.applications.certificate} variant="outline" size="sm" startIcon="eye">
              {tr("View and print", "ބަލާ އަދި ޕްރިންޓްކުރޭ")}
            </LinkButton>
          }
        />

        {shown.length === 0 ? (
          <EmptyState
            bordered
            variant="no-results"
            noun={{ one: tr("document", "ލިޔުން"), other: tr("documents", "ލިޔުން") }}
            search={search || undefined}
            filters={category !== "all" ? [categoryLabel[category as (typeof CATEGORIES)[number]]] : undefined}
            onClearSearch={search ? () => setSearch("") : undefined}
            onClearFilters={category !== "all" ? () => setCategory("all") : undefined}
          />
        ) : (
          CATEGORIES.filter((c) => shown.some((d) => d.category === c)).map((c) => (
            <Section key={c} title={categoryLabel[c]}>
              <ul className="gap-2 grid grid-cols-1">
                {shown
                  .filter((d) => d.category === c)
                  .map((d) => (
                    <li key={d.id}>
                      <AttachmentPreview
                        name={tr(...d.title)}
                        url={documentUrl(d)}
                        downloadUrl={documentUrl(d)}
                        size={d.size}
                        type={d.kind === "pdf" ? "application/pdf" : "image/svg+xml"}
                        alt={tr(...d.title)}
                      />
                    </li>
                  ))}
              </ul>
            </Section>
          ))
        )}
      </div>

      <Modal
        open={open}
        onOpenChange={setOpen}
        title={tr("Upload a document", "ލިޔުމެއް އަޕްލޯޑްކުރޭ")}
        description={tr("PDF or image, up to 5 MB.", "PDF ނުވަތަ ފޮޓޯ، 5MB އާ ހަމައަށް.")}
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>
              {tr("Cancel", "ކެންސަލް")}
            </Button>
            <Button type="submit" form="upload-document" loading={saving} startIcon="upload">
              {tr("Upload", "އަޕްލޯޑްކުރޭ")}
            </Button>
          </>
        }
      >
        <form id="upload-document" noValidate onSubmit={upload} className="gap-4 grid">
          <FormErrorsProvider errors={errors}>
            <FormField label={tr("Document name", "ލިޔުމުގެ ނަން")} name="title" required>
              <TextInput value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
            </FormField>
            <FormField label={tr("Category", "ބާވަތް")} name="category" required>
              <Select
                value={form.category}
                onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}
                placeholder={tr("Choose…", "ހޮވާ…")}
                options={CATEGORIES.map((c) => ({ value: c, label: categoryLabel[c] }))}
              />
            </FormField>
            <FormField label={tr("File", "ފައިލް")} name="file" required>
              <FileInput
                accept=".pdf,image/*"
                maxSize={5 * 1024 * 1024}
                value={form.files}
                onChange={(files) => setForm((f) => ({ ...f, files }))}
              />
            </FormField>
          </FormErrorsProvider>
        </form>
      </Modal>
    </CitizenShell>
  )
}
`;export{e as default};