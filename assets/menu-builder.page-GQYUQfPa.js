var e=`import * as React from "react"
import {
  Button,
  Card,
  DynamicIcon,
  EmptyState,
  FormField,
  Icon,
  IconPicker,
  PageTitle,
  SaveBar,
  SearchableSelect,
  SegmentedControl,
  Select,
  SortableList,
  Switch,
  TextInput,
  TopNav,
  UrlInput,
  cn,
  toast,
  type NavItem,
} from "@javaabu/onu"

import { useDv, useTr } from "../_shared/i18n"
import { routes } from "../_shared/routes"
import { AdminShell } from "../_shared/shells"
import { initialMenu, pageLinks, wait, type MenuNode } from "./_data"

export const meta = { title: "Menu builder", group: "Admin: content", layout: "bare", order: 4 }

// --- Tree helpers (two levels: top-level items and their children) ---------

function find(menu: MenuNode[], id: string): MenuNode | undefined {
  for (const item of menu) {
    if (item.id === id) return item
    const child = item.children.find((c) => c.id === id)
    if (child) return child
  }
  return undefined
}

function update(menu: MenuNode[], id: string, patch: Partial<MenuNode>): MenuNode[] {
  return menu.map((item) =>
    item.id === id
      ? { ...item, ...patch }
      : { ...item, children: item.children.map((c) => (c.id === id ? { ...c, ...patch } : c)) },
  )
}

function removeItem(menu: MenuNode[], id: string): MenuNode[] {
  return menu.filter((i) => i.id !== id).map((i) => ({ ...i, children: i.children.filter((c) => c.id !== id) }))
}

/** Make a top-level item the last child of the item above it. */
function indent(menu: MenuNode[], id: string): MenuNode[] {
  const index = menu.findIndex((i) => i.id === id)
  const item = menu[index]
  const parent = menu[index - 1]
  if (index < 1 || !item || !parent) return menu
  const moved = { ...item, children: [] }
  return menu.flatMap((i, n) => {
    if (n === index) return []
    if (n === index - 1) return [{ ...parent, children: [...parent.children, moved, ...item.children] }]
    return [i]
  })
}

/** Move a child out to the top level, just after its parent. */
function outdent(menu: MenuNode[], id: string): MenuNode[] {
  return menu.flatMap((i) => {
    const child = i.children.find((c) => c.id === id)
    if (!child) return [i]
    return [{ ...i, children: i.children.filter((c) => c.id !== id) }, child]
  })
}

export default function MenuBuilderPage() {
  const tr = useTr()
  const dv = useDv()
  const [saved, setSaved] = React.useState(initialMenu)
  const [menu, setMenu] = React.useState(initialMenu)
  const [location, setLocation] = React.useState("header")
  const [activeId, setActiveId] = React.useState<string | null>("services")
  const [saving, setSaving] = React.useState(false)
  const [status, setStatus] = React.useState<"idle" | "success" | "error">("idle")
  const editorRef = React.useRef<HTMLDivElement>(null)

  const label = (n: MenuNode) => (dv ? n.label.dv || n.label.en : n.label.en || n.label.dv)
  const active = activeId ? find(menu, activeId) : undefined
  const dirty = JSON.stringify(menu) !== JSON.stringify(saved)

  const changes = dirty
    ? [
        ...menu
          .flatMap((item) => [item, ...item.children])
          .flatMap((item) => {
            const before = find(saved, item.id)
            if (!before)
              return [
                {
                  key: item.id,
                  field: label(item),
                  description: tr(\`“\${label(item)}” is added\`, \`“\${label(item)}” އިތުރުކުރެވޭނެ\`),
                },
              ]
            return JSON.stringify({ ...before, children: [] }) !== JSON.stringify({ ...item, children: [] })
              ? [
                  {
                    key: item.id,
                    field: label(item),
                    description: tr(\`“\${label(item)}” is edited\`, \`“\${label(item)}” އަށް ބަދަލުގެނެވޭނެ\`),
                  },
                ]
              : []
          }),
        ...saved
          .flatMap((item) => [item, ...item.children])
          .filter((item) => !find(menu, item.id))
          .map((item) => ({
            key: \`removed-\${item.id}\`,
            field: label(item),
            description: tr(\`“\${label(item)}” is removed\`, \`“\${label(item)}” ފޮހެލެވޭނެ\`),
          })),
      ]
    : []
  const structureChanged =
    dirty &&
    JSON.stringify(menu.map((i) => [i.id, i.children.map((c) => c.id)])) !==
      JSON.stringify(saved.map((i) => [i.id, i.children.map((c) => c.id)]))
  if (structureChanged) {
    changes.push({
      key: "order",
      field: tr("Order", "ތަރުތީބު"),
      description: tr("Menu order changes", "މެނޫގެ ތަރުތީބު ބަދަލުވާނެ"),
    })
  }

  const edit = (patch: Partial<MenuNode>) => {
    if (activeId) setMenu((m) => update(m, activeId, patch))
    setStatus("idle")
  }
  const select = (id: string) => {
    setActiveId(id)
    if (window.matchMedia("(max-width: 1023px)").matches) {
      editorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

  function addItem() {
    const id = \`item-\${Date.now()}\`
    setMenu((m) => [
      ...m,
      { id, label: { en: "New item", dv: "އައު ބައެއް" }, href: "/", icon: null, newTab: false, children: [] },
    ])
    setActiveId(id)
    setStatus("idle")
  }

  const previewItems: NavItem[] = menu.map((item) => ({
    id: item.id,
    label: label(item),
    icon: item.icon ? <DynamicIcon id={item.icon} /> : undefined,
    onSelect: (e) => e.preventDefault(),
    items: item.children.length
      ? item.children.map((c) => ({
          id: c.id,
          label: label(c),
          icon: c.icon ? <DynamicIcon id={c.icon} /> : undefined,
          href: "#",
          onSelect: (e) => e.preventDefault(),
        }))
      : undefined,
    href: item.children.length ? undefined : "#",
  }))

  const isCustom = active ? !pageLinks.some((p) => p.value === active.href) : false

  function row(
    item: MenuNode,
    depth: number,
    parts: { handle: React.ReactNode; moveButtons: React.ReactNode; index: number },
  ) {
    const selected = item.id === activeId
    return (
      <div
        className={cn(
          "gap-2 p-2 flex flex-wrap items-center rounded-lg border bg-card",
          selected && "border-primary ring-1 ring-primary",
        )}
      >
        {parts.handle}
        <span className="size-8 flex shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
          {item.icon ? <DynamicIcon id={item.icon} /> : <Icon name="link" />}
        </span>
        <button
          type="button"
          className="min-w-0 flex-1 rounded-sm text-start focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          aria-pressed={selected}
          onClick={() => select(item.id)}
        >
          <span className="font-medium block truncate" dir="auto">
            {label(item)}
          </span>
          <span className="text-xs block truncate text-muted-foreground" dir="ltr">
            {item.href}
          </span>
        </button>
        <div className="gap-1 flex items-center">
          {depth === 0 && parts.index > 0 ? (
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={tr(\`Move \${label(item)} into the item above\`, \`\${label(item)} މަތީ ބައިގެ ތެރެއަށް\`)}
              onClick={() => setMenu((m) => indent(m, item.id))}
            >
              <Icon name="chevron-right" />
            </Button>
          ) : null}
          {depth === 1 ? (
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={tr(\`Move \${label(item)} to the top level\`, \`\${label(item)} މައި ލެވެލްއަށް\`)}
              onClick={() => setMenu((m) => outdent(m, item.id))}
            >
              <Icon name="chevron-left" />
            </Button>
          ) : null}
          {parts.moveButtons}
        </div>
      </div>
    )
  }

  return (
    <AdminShell
      contentWidth="wide"
      breadcrumbs={[{ label: tr("Content", "ކޮންޓެންޓް") }, { label: tr("Menus", "މެނޫތައް") }]}
    >
      <div className="gap-6 grid">
        <PageTitle
          title={tr("Menu builder", "މެނޫ ބިލްޑަރ")}
          description={tr(
            "Drag items to reorder them, or use the arrow buttons. Select an item to edit it.",
            "ތަރުތީބު ބަދަލުކުރަން ދަމާ، ނުވަތަ ތިރި/މަތި ފިތްތައް ބޭނުންކުރައްވާ. އެޑިޓްކުރަން ބައެއް ހޮވާ.",
          )}
          action={
            <Button onClick={addItem}>
              <Icon name="add" />
              {tr("Add item", "ބައެއް އިތުރުކުރޭ")}
            </Button>
          }
          links={[{ label: tr("Pages", "ސަފްހާތައް"), href: routes.adminContent.pageBuilder, icon: "file" }]}
        />

        <Card
          title={tr("Live preview", "ޕްރިވިއު")}
          description={tr("Links are disabled in the preview.", "ޕްރިވިއުގައި ލިންކްތައް ނުހިނގާނެ.")}
          headingLevel={2}
          size="sm"
        >
          <div className="px-3 py-2 rounded-lg border bg-background">
            <TopNav items={previewItems} navLabel={tr("Menu preview", "މެނޫ ޕްރިވިއު")} />
          </div>
        </Card>

        <div className="gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start grid">
          <Card
            title={tr("Structure", "އޮނިގަނޑު")}
            headingLevel={2}
            actions={
              <Select
                aria-label={tr("Menu location", "މެނޫ ހުންނާނެ ތަން")}
                size="sm"
                value={location}
                onValueChange={(v) => setLocation(v || "header")}
                options={[
                  { value: "header", label: tr("Header menu", "ހެޑަރ މެނޫ") },
                  { value: "footer", label: tr("Footer menu", "ފޫޓަރ މެނޫ") },
                ]}
              />
            }
          >
            {menu.length ? (
              <SortableList
                aria-label={tr("Menu items", "މެނޫގެ ބައިތައް")}
                items={menu}
                getName={label}
                onReorder={(next) => {
                  setMenu(next)
                  setStatus("idle")
                }}
                renderItem={(item, parts) => (
                  <div className="gap-2 grid">
                    {row(item, 0, parts)}
                    {item.children.length ? (
                      <div className="ps-6 sm:ps-10">
                        <SortableList
                          aria-label={tr(\`Items under \${label(item)}\`, \`\${label(item)} ގެ ދަށުގައިވާ ބައިތައް\`)}
                          items={item.children}
                          getName={label}
                          onReorder={(children) => {
                            setMenu((m) => m.map((i) => (i.id === item.id ? { ...i, children } : i)))
                            setStatus("idle")
                          }}
                          renderItem={(child, childParts) => row(child, 1, childParts)}
                        />
                      </div>
                    ) : null}
                  </div>
                )}
              />
            ) : (
              <EmptyState
                title={tr("This menu is empty", "މި މެނޫގައި އެއްވެސް ބައެއް ނެތް")}
                description={tr("Add the first item to start.", "ފެށުމަށް ބައެއް އިތުރުކުރައްވާ.")}
                action={<Button onClick={addItem}>{tr("Add item", "ބައެއް އިތުރުކުރޭ")}</Button>}
              />
            )}
          </Card>

          <div className="gap-6 min-w-0 grid">
            <SaveBar
              changes={changes}
              dirty={dirty}
              saving={saving}
              status={status}
              onSave={async () => {
                setSaving(true)
                await wait(800)
                setSaved(menu)
                setSaving(false)
                setStatus("success")
                toast.success(tr("Menu saved", "މެނޫ ސޭވްކުރެވިއްޖެ"))
              }}
              onDiscard={() => {
                setMenu(saved)
                setStatus("idle")
              }}
              successMessage={tr("Menu saved", "މެނޫ ސޭވްކުރެވިއްޖެ")}
            />

            <Card ref={editorRef} title={tr("Edit item", "ބައި އެޑިޓްކުރުން")} headingLevel={2} size="sm">
              {active ? (
                <div className="gap-4 grid">
                  <FormField label={tr("Label (English)", "ލޭބަލް (އިނގިރޭސި)")}>
                    <TextInput
                      dir="auto"
                      value={active.label.en}
                      onChange={(e) => edit({ label: { ...active.label, en: e.target.value } })}
                    />
                  </FormField>
                  <FormField label={tr("Label (Dhivehi)", "ލޭބަލް (ދިވެހި)")}>
                    <TextInput
                      thaana
                      thaanaToggle
                      value={active.label.dv}
                      onChange={(e) => edit({ label: { ...active.label, dv: e.target.value } })}
                    />
                  </FormField>
                  <div className="gap-2 grid">
                    <SegmentedControl
                      aria-label={tr("Link type", "ލިންކްގެ ބާވަތް")}
                      size="sm"
                      fullWidth
                      value={isCustom ? "custom" : "page"}
                      onValueChange={(v) => edit({ href: v === "page" ? "/" : "https://" })}
                      options={[
                        { value: "page", label: tr("Page", "ސަފްހާ") },
                        { value: "custom", label: tr("Custom URL", "އަމިއްލަ ލިންކް") },
                      ]}
                    />
                    {isCustom ? (
                      <FormField label={tr("URL", "ލިންކް")}>
                        <UrlInput value={active.href} onChange={(e) => edit({ href: e.target.value })} showIcon />
                      </FormField>
                    ) : (
                      <FormField label={tr("Page", "ސަފްހާ")}>
                        <SearchableSelect
                          options={pageLinks.map((p) => ({ value: p.value, label: dv ? p.label.dv : p.label.en }))}
                          value={active.href}
                          onValueChange={(v) => edit({ href: (v as string) || "/" })}
                        />
                      </FormField>
                    )}
                  </div>
                  <FormField label={tr("Icon", "އައިކަން")}>
                    <IconPicker value={active.icon} onValueChange={(icon) => edit({ icon })} sets={["lucide"]} />
                  </FormField>
                  <Switch
                    label={tr("Open in a new tab", "އައު ޓެބެއްގައި ހުޅުވާ")}
                    checked={active.newTab}
                    onCheckedChange={(newTab) => edit({ newTab })}
                  />
                  <Button
                    variant="outline"
                    className="text-destructive"
                    onClick={() => {
                      setMenu((m) => removeItem(m, active.id))
                      setActiveId(null)
                      toast(tr(\`\${label(active)} removed\`, \`\${label(active)} ފޮހެލެވިއްޖެ\`), {
                        action: { label: tr("Undo", "އަނބުރާ"), onClick: () => setMenu(menu) },
                      })
                    }}
                  >
                    <Icon name="trash" />
                    {tr("Remove item", "ބައި ފޮހެލާ")}
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {tr("Select an item to edit it.", "އެޑިޓްކުރަން ބައެއް ހޮވާ.")}
                </p>
              )}
            </Card>
          </div>
        </div>
      </div>
    </AdminShell>
  )
}
`;export{e as default};