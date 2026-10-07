import * as React from "react"
import {
  Button,
  Card,
  DateTimePicker,
  Form,
  FormField,
  FormGroup,
  Icon,
  ImageInput,
  Modal,
  ModalClose,
  PageTitle,
  PublishBox,
  SaveBar,
  SlugInput,
  TagsInput,
  Textarea,
  TextInput,
  TreeView,
  ValidationError,
  describeChanges,
  toast,
} from "@javaabu/onu"
import { WysiwygEditor } from "@javaabu/onu/editor"
import { ImageCropper, type ImageCropperHandle } from "@javaabu/onu/media"

import { useDv, useTr } from "../_shared/i18n"
import { routes } from "../_shared/routes"
import { AdminShell } from "../_shared/shells"
import { categoryTree, initialPost, mediaItems, tagSuggestions, wait, type L10n, type PostValues } from "./_data"

export const meta = { title: "Post editor", group: "Admin: content", layout: "bare", order: 1 }

const SITE = "https://services.gov.mv/news/"
const featuredSeed = mediaItems.find((m) => m.id === "img-7")?.url ?? null

export default function PostEditorPage() {
  const tr = useTr()
  const dv = useDv()
  const t = (s: L10n) => (dv ? s.dv : s.en)
  const [saved, setSaved] = React.useState(initialPost)
  const [values, setValues] = React.useState(initialPost)
  const [featured, setFeatured] = React.useState<File | string | null>(featuredSeed)
  const [savedFeatured, setSavedFeatured] = React.useState<File | string | null>(featuredSeed)
  const [cropSrc, setCropSrc] = React.useState<File | string | null>(null)
  const cropper = React.useRef<ImageCropperHandle>(null)

  const set = <K extends keyof PostValues>(key: K, value: PostValues[K]) => setValues((v) => ({ ...v, [key]: value }))
  const tree = categoryTree(t)
  const categoryName = (id: string) => {
    for (const node of tree) {
      if (node.id === id) return node.label
      const child = node.children?.find((c) => c.id === id)
      if (child) return child.label
    }
    return id
  }

  const changes = [
    ...describeChanges(
      saved,
      values,
      {
        title: tr("Title", "ސުރުޙީ"),
        slug: tr("Slug", "ސްލަގް"),
        excerpt: tr("Excerpt", "ޚުލާޞާ"),
        body: tr("Content", "ލިޔުން"),
        categories: tr("Categories", "ކެޓަގަރީ"),
        tags: tr("Tags", "ޓެގް"),
        metaTitle: tr("SEO title", "އެސްއީއޯ ސުރުޚީ"),
        metaDescription: tr("Meta description", "ތަފްޞީލް"),
        status: tr("Status", "ހާލަތު"),
        visibility: tr("Visibility", "ފެންނާނެ ފަރާތް"),
        publishAt: tr("Publish date", "ޝާއިޢުކުރާ ތާރީޚު"),
      },
      { categories: (v) => (v as string[]).map(categoryName) },
    ).map((c) => (c.key === "body" ? { ...c, description: tr("Content is edited", "ލިޔުމަށް ބަދަލުގެނެވިއްޖެ") } : c)),
    ...(featured !== savedFeatured
      ? [
          {
            key: "featured",
            field: tr("Featured image", "ފީޗަރޑް ފޮޓޯ"),
            description: featured
              ? tr("Featured image changes", "ފީޗަރޑް ފޮޓޯ ބަދަލުވާނެ")
              : tr("Featured image is removed", "ފީޗަރޑް ފޮޓޯ ފޮހެލެވޭނެ"),
          },
        ]
      : []),
  ]

  async function persist(next: PostValues) {
    await wait(900)
    const errors: Record<string, string> = {}
    if (!next.title.trim()) errors.title = tr("The title field is required.", "ސުރުޙީ ލިޔުއްވާ.")
    if (next.slug === "ferry-schedule")
      errors.slug = tr("The slug has already been taken.", "މި ސްލަގް ބޭނުންކުރެވިފައި.")
    if (Object.keys(errors).length) throw new ValidationError(errors)
    setSaved(next)
    setValues(next)
    setSavedFeatured(featured)
  }

  async function confirmCrop() {
    const file = await cropper.current?.getFile("featured.jpg", { maxSize: 1600 })
    if (file) setFeatured(file)
    setCropSrc(null)
  }

  const publishLabel = values.status === "published" ? tr("Post updated", "ޕޯސްޓް އަޕްޑޭޓްކުރެވިއްޖެ") : null

  return (
    <AdminShell
      contentWidth="wide"
      breadcrumbs={[
        { label: tr("Posts", "ޕޯސްޓްތައް"), href: routes.adminContent.postEditor },
        { label: tr("Edit post", "ޕޯސްޓް އެޑިޓްކުރުން") },
      ]}
    >
      <div className="gap-6 grid">
        <PageTitle
          title={tr("Edit post", "ޕޯސްޓް އެޑިޓްކުރުން")}
          description={t({ en: saved.title, dv: "ހުޅުމާލެ ފެރީ ތާވަލަށް ގެނެވޭ ބަދަލުތައް" })}
          links={[
            { label: tr("All posts", "ހުރިހާ ޕޯސްޓެއް"), href: routes.adminContent.postEditor, icon: "back" },
            { label: tr("Media library", "މީޑިއާ ލައިބްރަރީ"), href: routes.adminContent.mediaLibrary, icon: "image" },
          ]}
        />

        <Form
          onSubmit={() => persist(values)}
          onSuccess={() => toast.success(tr("Post saved", "ޕޯސްޓް ސޭވްކުރެވިއްޖެ"))}
          className="w-full"
        >
          <div className="gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start grid">
            <div className="gap-6 min-w-0 grid">
              <Card title={tr("Content", "ލިޔުން")} headingLevel={2}>
                <div className="gap-5 grid">
                  <FormField
                    label={tr("Title", "ސުރުޙީ")}
                    name="title"
                    required
                    help={tr(
                      "Press the ދ/A button to type Thaana.",
                      "ދ/A ފިތާ އިނގިރޭސިއާއި ތާނައާ ދެމެދު ބަދަލުކުރައްވާ.",
                    )}
                  >
                    <TextInput
                      value={values.title}
                      onChange={(e) => set("title", e.target.value)}
                      dir="auto"
                      thaana={{ defaultEnabled: dv }}
                      thaanaToggle
                    />
                  </FormField>
                  <FormField
                    label={tr("Slug", "ސްލަގް")}
                    name="slug"
                    help={tr(
                      "Generated from the title. Unlock to edit it by hand.",
                      "ސުރުޙީއިން އަމިއްލައަށް ހެދޭނެ. އަތުން ބަދަލުކުރަން ތަޅު ހުޅުވާލައްވާ.",
                    )}
                  >
                    <SlugInput
                      source={values.title}
                      value={values.slug}
                      onValueChange={(slug) => set("slug", slug)}
                      prefix={SITE}
                    />
                  </FormField>
                  <FormField label={tr("Excerpt", "ޚުލާޞާ")} name="excerpt">
                    <Textarea
                      value={values.excerpt}
                      onChange={(e) => set("excerpt", e.target.value)}
                      dir="auto"
                      rows={3}
                      maxLength={280}
                      showCount
                      thaana={{ defaultEnabled: dv }}
                      thaanaToggle
                    />
                  </FormField>
                  <FormField label={tr("Body", "ލިޔުން")} name="body">
                    <WysiwygEditor
                      value={values.body}
                      onChange={(html) => set("body", html as string)}
                      thaana={{ defaultEnabled: dv }}
                      onImageUpload={async (file) => {
                        await wait(600)
                        return URL.createObjectURL(file)
                      }}
                    />
                  </FormField>
                </div>
              </Card>

              <Card
                title={tr("Search engine listing", "ސާޗް އިންޖީނުގައި ފެންނާނެ ގޮތް")}
                description={tr(
                  "How this post looks in Google and when shared.",
                  "ގޫގުލްގައި އަދި ޝެއާކުރާއިރު މި ޕޯސްޓް ފެންނާނެ ގޮތް.",
                )}
                headingLevel={2}
              >
                <div className="gap-5 grid">
                  <div className="gap-1 p-4 grid rounded-lg border bg-muted/30" dir="auto">
                    <span className="text-xs truncate text-muted-foreground" dir="ltr">
                      {SITE}
                      {values.slug}
                    </span>
                    <span className="text-base font-medium truncate text-primary">
                      {values.metaTitle || values.title || tr("Untitled post", "ސުރުޙީ ނެތް")}
                    </span>
                    <span className="text-sm line-clamp-2 text-muted-foreground">
                      {values.metaDescription || values.excerpt}
                    </span>
                  </div>
                  <FormGroup columns={1}>
                    <FormField
                      label={tr("SEO title", "އެސްއީއޯ ސުރުޚީ")}
                      name="meta_title"
                      help={tr(
                        "Leave empty to use the post title.",
                        "ހުސްކޮށް ބާއްވައިފިނަމަ ޕޯސްޓްގެ ސުރުޙީ ބޭނުންކުރާނެ.",
                      )}
                    >
                      <TextInput
                        value={values.metaTitle}
                        onChange={(e) => set("metaTitle", e.target.value)}
                        dir="auto"
                        maxLength={60}
                      />
                    </FormField>
                    <FormField label={tr("Meta description", "ތަފްޞީލް")} name="meta_description">
                      <Textarea
                        value={values.metaDescription}
                        onChange={(e) => set("metaDescription", e.target.value)}
                        dir="auto"
                        rows={2}
                        maxLength={160}
                        showCount
                      />
                    </FormField>
                  </FormGroup>
                </div>
              </Card>
            </div>

            <div className="gap-6 min-w-0 grid">
              <SaveBar
                changes={changes}
                onDiscard={() => {
                  setValues(saved)
                  setFeatured(savedFeatured)
                }}
                successMessage={tr("Post saved", "ޕޯސްޓް ސޭވްކުރެވިއްޖެ")}
              />

              <PublishBox
                status={values.status}
                onStatusChange={(s) => set("status", s)}
                visibility={values.visibility}
                onVisibilityChange={(v) => set("visibility", v)}
                publishAt={values.publishAt}
                onPublishAtChange={(d) => set("publishAt", d)}
                renderDateInput={({ id, value, onChange }) => (
                  <DateTimePicker id={id} value={value} onChange={onChange} />
                )}
                onPreview={() => toast.info(tr("Preview opened in a new tab", "ޕްރިވިއު އައު ޓެބެއްގައި ހުޅުވިއްޖެ"))}
                onSaveDraft={async () => {
                  await persist({ ...values, status: "draft" })
                  toast.success(tr("Draft saved", "ޑްރާފްޓް ސޭވްކުރެވިއްޖެ"))
                }}
                onPublish={async () => {
                  const future = values.publishAt && values.publishAt.getTime() > Date.now()
                  await persist({ ...values, status: future ? "scheduled" : "published" })
                  toast.success(
                    publishLabel ??
                      (future
                        ? tr("Post scheduled", "ޕޯސްޓް ޝެޑިއުލްކުރެވިއްޖެ")
                        : tr("Post published", "ޕޯސްޓް ޝާއިޢުކުރެވިއްޖެ")),
                  )
                }}
              />

              <Card title={tr("Featured image", "ފީޗަރޑް ފޮޓޯ")} headingLevel={2} size="sm">
                <div className="gap-3 grid">
                  <FormField
                    label={tr("Featured image", "ފީޗަރޑް ފޮޓޯ")}
                    hideLabel
                    name="featured_image"
                    help={tr("16:9, at least 1200px wide.", "16:9، 1200 ޕިކްސެލްއަށް ވުރެ ފުޅާކޮށް.")}
                  >
                    <ImageInput
                      alt={tr("Featured image of the post", "ޕޯސްޓްގެ ފީޗަރޑް ފޮޓޯ")}
                      aspectRatio={16 / 9}
                      value={featured}
                      onChange={(file) => {
                        setFeatured(file)
                        if (file) setCropSrc(file)
                      }}
                      maxSize={8 * 1024 * 1024}
                    />
                  </FormField>
                  {featured ? (
                    <Button type="button" variant="outline" size="sm" onClick={() => setCropSrc(featured)}>
                      <Icon name="crop" />
                      {tr("Crop image", "ފޮޓޯ ކަނޑާ")}
                    </Button>
                  ) : null}
                </div>
              </Card>

              <Card title={tr("Categories", "ކެޓަގަރީ")} headingLevel={2} size="sm">
                <TreeView
                  aria-label={tr("Categories", "ކެޓަގަރީ")}
                  items={tree}
                  selectionMode="multiple"
                  selectedKeys={values.categories}
                  onSelectionChange={(keys) => set("categories", keys)}
                  defaultExpandedKeys={["news", "services"]}
                />
              </Card>

              <Card title={tr("Tags", "ޓެގް")} headingLevel={2} size="sm">
                <FormField
                  label={tr("Tags", "ޓެގް")}
                  hideLabel
                  name="tags"
                  help={tr("Press Enter or comma to add.", "އިތުރުކުރަން Enter ނުވަތަ ކޮމާ ފިތާ.")}
                >
                  <TagsInput
                    value={values.tags}
                    onValueChange={(tags) => set("tags", tags)}
                    suggestions={tagSuggestions}
                    max={10}
                  />
                </FormField>
              </Card>
            </div>
          </div>
        </Form>
      </div>

      <Modal
        open={cropSrc !== null}
        onOpenChange={(open) => !open && setCropSrc(null)}
        title={tr("Crop featured image", "ފީޗަރޑް ފޮޓޯ ކަނޑާ")}
        description={tr(
          "Drag to move, pinch or use the slider to zoom.",
          "ދަމައިގެން ހަރަކާތްކުރުވާ، ޒޫމް ކުރަން ސްލައިޑަރު ބޭނުންކުރައްވާ.",
        )}
        size="lg"
        mobile="fullscreen"
        footer={
          <>
            <ModalClose asChild>
              <Button variant="outline">{tr("Cancel", "ކެންސަލް")}</Button>
            </ModalClose>
            <Button onClick={confirmCrop}>{tr("Apply crop", "ކަނޑާލާ")}</Button>
          </>
        }
      >
        {cropSrc ? (
          <ImageCropper
            ref={cropper}
            src={cropSrc}
            alt={tr("Featured image", "ފީޗަރޑް ފޮޓޯ")}
            aspect={16 / 9}
            aspectOptions={[
              { label: "16:9", value: 16 / 9 },
              { label: "4:3", value: 4 / 3 },
              { label: "1:1", value: 1 },
            ]}
          />
        ) : null}
      </Modal>
    </AdminShell>
  )
}
