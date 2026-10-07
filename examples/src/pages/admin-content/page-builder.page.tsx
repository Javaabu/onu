import * as React from "react"
import {
  Card,
  CardContent,
  Form,
  FormField,
  FormGroup,
  Icon,
  PageTitle,
  SaveBar,
  SegmentedControl,
  Select,
  SlugInput,
  TextInput,
  ValidationError,
  cn,
  describeChanges,
  toast,
} from "@javaabu/onu"
import { BlockEditor, BlockRenderer, type JSONContent } from "@javaabu/onu/editor"

import { useTr } from "../_shared/i18n"
import { routes } from "../_shared/routes"
import { AdminShell } from "../_shared/shells"
import { aboutPage, wait } from "./_data"

export const meta = { title: "Page builder", group: "Admin: content", layout: "bare", order: 2 }

type Layout = "split" | "edit" | "preview"

const initial = { title: "Visiting Addu City", slug: "visiting-addu-city", template: "default" }

export default function PageBuilderPage() {
  const tr = useTr()
  const [saved, setSaved] = React.useState({ ...initial, content: aboutPage })
  const [values, setValues] = React.useState(initial)
  const [doc, setDoc] = React.useState<JSONContent>(aboutPage)
  const [layout, setLayout] = React.useState<Layout>("split")
  const set = (key: keyof typeof initial, value: string) => setValues((v) => ({ ...v, [key]: value }))

  const templates = [
    { value: "default", label: tr("Default", "ޑިފޯލްޓް") },
    { value: "wide", label: tr("Full width", "ފުޅާ") },
    { value: "landing", label: tr("Landing page", "ލޭންޑިންގ ޕޭޖް") },
  ]

  const changes = [
    ...describeChanges(
      saved,
      values,
      { title: tr("Title", "ސުރުޙީ"), slug: tr("Slug", "ސްލަގް"), template: tr("Template", "ޓެމްޕްލޭޓް") },
      { template: (v) => templates.find((t) => t.value === v)?.label ?? v },
    ),
    ...(JSON.stringify(doc) !== JSON.stringify(saved.content)
      ? [
          {
            key: "content",
            field: tr("Content", "ލިޔުން"),
            description: tr("Page blocks are edited", "ސަފްހާގެ ބްލޮކްތަކަށް ބަދަލުގެނެވިއްޖެ"),
          },
        ]
      : []),
  ]

  const showEditor = layout !== "preview"
  const showPreview = layout !== "edit"

  return (
    <AdminShell
      contentWidth="full"
      breadcrumbs={[
        { label: tr("Pages", "ސަފްހާތައް"), href: routes.adminContent.pageBuilder },
        { label: values.title || tr("Untitled page", "ނަމެއް ނެތް ސަފްހާ") },
      ]}
    >
      <div className="gap-6 grid">
        <PageTitle
          title={tr("Page builder", "ސަފްހާ ބިލްޑަރ")}
          description={tr(
            "Type “/” for blocks. Drag the grip to reorder, or press it for Move up / Move down.",
            "ބްލޮކްތައް ލިބޭނީ “/” ޖެހުމުން. ތަރުތީބު ބަދަލުކުރަން ގްރިޕް ދަމާ، ނުވަތަ އެއަށް ފިތާ.",
          )}
          links={[
            { label: tr("All pages", "ހުރިހާ ސަފްހާއެއް"), href: routes.adminContent.pageBuilder, icon: "back" },
            { label: tr("Menus", "މެނޫތައް"), href: routes.adminContent.menuBuilder, icon: "menu" },
          ]}
        />

        <Form
          onSubmit={async () => {
            await wait(900)
            if (!values.title.trim()) {
              throw new ValidationError({ title: tr("The title field is required.", "ސުރުޙީ ލިޔުއްވާ.") })
            }
            setSaved({ ...values, content: doc })
          }}
          onSuccess={() => toast.success(tr("Page saved", "ސަފްހާ ސޭވްކުރެވިއްޖެ"))}
        >
          <div className="gap-6 xl:grid-cols-[minmax(0,1fr)_17rem] xl:items-start grid">
            <div className="gap-6 min-w-0 grid">
              <Card size="sm">
                <CardContent>
                  <FormGroup columns={3}>
                    <FormField label={tr("Title", "ސުރުޙީ")} name="title" required>
                      <TextInput
                        value={values.title}
                        onChange={(e) => set("title", e.target.value)}
                        dir="auto"
                        thaana={{ defaultEnabled: false }}
                        thaanaToggle
                      />
                    </FormField>
                    <FormField label={tr("Slug", "ސްލަގް")} name="slug">
                      <SlugInput
                        source={values.title}
                        value={values.slug}
                        onValueChange={(v) => set("slug", v)}
                        prefix="/"
                      />
                    </FormField>
                    <FormField label={tr("Template", "ޓެމްޕްލޭޓް")} name="template">
                      <Select options={templates} value={values.template} onValueChange={(v) => set("template", v)} />
                    </FormField>
                  </FormGroup>
                </CardContent>
              </Card>

              <div className="gap-3 flex flex-wrap items-center justify-between">
                <h2 className="text-lg font-semibold">{tr("Content", "ލިޔުން")}</h2>
                <SegmentedControl
                  aria-label={tr("Layout", "ލޭއައުޓް")}
                  className="shrink-0"
                  classNames={{ item: "flex-auto" }}
                  size="sm"
                  value={layout}
                  onValueChange={(v) => setLayout(v as Layout)}
                  options={[
                    { value: "split", label: tr("Split", "ދެބައި"), icon: <Icon name="columns" /> },
                    { value: "edit", label: tr("Editor", "އެޑިޓަރ"), icon: <Icon name="edit" /> },
                    { value: "preview", label: tr("Preview", "ޕްރިވިއު"), icon: <Icon name="eye" /> },
                  ]}
                />
              </div>

              <div className={cn("gap-6 grid items-start", layout === "split" && "2xl:grid-cols-2")}>
                {showEditor ? (
                  <section aria-label={tr("Editor", "އެޑިޓަރ")} className="min-w-0">
                    <FormField label={tr("Page content", "ސަފްހާގެ ލިޔުން")} hideLabel name="content">
                      <BlockEditor
                        value={doc}
                        onChange={setDoc}
                        onImageUpload={async (file) => {
                          await wait(600)
                          return URL.createObjectURL(file)
                        }}
                      />
                    </FormField>
                  </section>
                ) : null}
                {showPreview ? (
                  <Card
                    title={tr("Preview", "ޕްރިވިއު")}
                    description={tr("As visitors will see it.", "ޒިޔާރަތްކުރާ ފަރާތްތަކަށް ފެންނާނެ ގޮތް.")}
                    headingLevel={2}
                    variant="muted"
                    className="min-w-0"
                  >
                    <div className="p-4 sm:p-6 rounded-lg border bg-background">
                      <h3 className="mb-4 text-2xl font-semibold" dir="auto">
                        {values.title || tr("Untitled page", "ނަމެއް ނެތް ސަފްހާ")}
                      </h3>
                      <BlockRenderer
                        content={doc}
                        empty={<p className="text-muted-foreground">{tr("No content yet.", "އަދި ލިޔުމެއް ނެތް.")}</p>}
                      />
                    </div>
                  </Card>
                ) : null}
              </div>
            </div>

            <SaveBar
              changes={changes}
              onDiscard={() => {
                setValues({ title: saved.title, slug: saved.slug, template: saved.template })
                setDoc(saved.content)
              }}
              successMessage={tr("Page saved", "ސަފްހާ ސޭވްކުރެވިއްޖެ")}
            />
          </div>
        </Form>
      </div>
    </AdminShell>
  )
}
