import * as React from "react"
import {
  Button,
  Card,
  EmptyState,
  FilterTabs,
  Icon,
  ListView,
  PageTitle,
  RelativeDate,
  SaveBar,
  Select,
  Switch,
  Tabs,
  cn,
  toast,
  type SaveBarChange,
} from "@javaabu/onu"

import { useDv, useTr } from "../_shared/i18n"
import { routes } from "../_shared/routes"
import { AdminShell } from "../_shared/shells"
import {
  NOW,
  categoryNames,
  channelNames,
  inbox as initialInbox,
  initialPreferences,
  preferenceEvents,
  wait,
  type Channel,
  type InboxItem,
  type L10n,
  type NotificationCategory,
} from "./_data"

export const meta = { title: "Notifications", group: "Admin: settings and access", layout: "bare", order: 6 }

const CHANNELS: Channel[] = ["inApp", "email", "sms", "push"]

const tone: Record<InboxItem["variant"], string> = {
  default: "bg-muted text-muted-foreground",
  info: "bg-info/10 text-info",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  error: "bg-destructive/10 text-destructive",
}

export default function NotificationsPage() {
  const tr = useTr()
  const dv = useDv()
  const t = (s: L10n) => (dv ? s.dv : s.en)
  const [items, setItems] = React.useState(initialInbox)
  const [filter, setFilter] = React.useState("all")
  const [category, setCategory] = React.useState("all")
  const [selection, setSelection] = React.useState<string[]>([])
  const [saved, setSaved] = React.useState(initialPreferences)
  const [prefs, setPrefs] = React.useState(initialPreferences)
  const [saving, setSaving] = React.useState(false)
  const [status, setStatus] = React.useState<"idle" | "success" | "error">("idle")

  const unread = items.filter((i) => !i.read).length
  const visible = items
    .filter((i) => filter === "all" || !i.read)
    .filter((i) => category === "all" || i.category === category)

  const markRead = (ids: string[], read = true) =>
    setItems((list) => list.map((i) => (ids.includes(i.id) ? { ...i, read } : i)))

  const changes: SaveBarChange[] = preferenceEvents.flatMap((e) =>
    CHANNELS.filter((c) => saved[e.id]?.[c] !== prefs[e.id]?.[c]).map((c) => ({
      key: `${e.id}.${c}`,
      field: `${t(e.label)} · ${t(channelNames[c])}`,
      description: prefs[e.id]?.[c]
        ? tr(`${t(e.label)}: ${t(channelNames[c])} turns on`, `${t(e.label)}: ${t(channelNames[c])} ހުޅުވޭނެ`)
        : tr(`${t(e.label)}: ${t(channelNames[c])} turns off`, `${t(e.label)}: ${t(channelNames[c])} ބަންދުވާނެ`),
    })),
  )

  const inboxPanel = (
    <div className="gap-4 grid">
      <div className="gap-3 flex flex-wrap items-center justify-between">
        <FilterTabs
          controls="inbox-list"
          value={filter}
          onValueChange={setFilter}
          tabs={[
            { value: "all", label: tr("All", "ހުރިހާ"), count: items.length },
            { value: "unread", label: tr("Unread", "ނުކިޔާ"), count: unread },
          ]}
        />
        <div className="gap-2 flex flex-wrap items-center">
          <Select
            aria-label={tr("Category", "ބާވަތް")}
            className="w-44"
            size="sm"
            value={category}
            onValueChange={(v) => setCategory(v || "all")}
            options={[
              { value: "all", label: tr("All categories", "ހުރިހާ ބާވަތެއް") },
              ...(Object.keys(categoryNames) as NotificationCategory[]).map((c) => ({
                value: c,
                label: t(categoryNames[c]),
              })),
            ]}
          />
          <Button
            variant="outline"
            size="sm"
            disabled={!unread}
            onClick={() => {
              markRead(items.map((i) => i.id))
              toast.success(tr("All notifications marked as read", "ހުރިހާ ނޮޓިފިކޭޝަނެއް ކިޔިއްޖެ"))
            }}
          >
            <Icon name="check" />
            {tr("Mark all as read", "ހުރިހާ ކިޔިއްޖެ")}
          </Button>
        </div>
      </div>

      {selection.length ? (
        <div
          className="gap-2 px-3 py-2 flex flex-wrap items-center rounded-lg border bg-muted/50"
          role="region"
          aria-label={tr("Selected notifications", "ހޮވާފައިވާ ނޮޓިފިކޭޝަން")}
        >
          <span className="text-sm font-medium me-auto" role="status">
            {tr(`${selection.length} selected`, `${selection.length} ހޮވާފައި`)}
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              markRead(selection)
              setSelection([])
            }}
          >
            {tr("Mark as read", "ކިޔިއްޖެ")}
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="text-destructive"
            onClick={async () => {
              await wait(400)
              const n = selection.length
              setItems((list) => list.filter((i) => !selection.includes(i.id)))
              setSelection([])
              toast.success(tr(`${n} notifications deleted`, `${n} ނޮޓިފިކޭޝަން ޑިލީޓްކުރެވިއްޖެ`))
            }}
          >
            {tr("Delete", "ޑިލީޓް")}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setSelection([])}>
            {tr("Clear selection", "ހޮވުން ދޫކޮށްލާ")}
          </Button>
        </div>
      ) : null}

      <div id="inbox-list">
        <ListView
          aria-label={tr("Notifications", "ނޮޓިފިކޭޝަން")}
          variant="cards"
          items={visible}
          getName={(i) => t(i.title)}
          selection={selection}
          onSelectionChange={setSelection}
          onItemClick={(i) => markRead([i.id])}
          media={(i) => (
            <span className={cn("size-10 flex items-center justify-center rounded-full", tone[i.variant])}>
              <Icon name={i.icon} />
            </span>
          )}
          title={(i) => (
            <span className={cn("gap-2 inline-flex items-center", !i.read && "font-semibold")}>
              {!i.read ? (
                <>
                  <span className="size-2 shrink-0 rounded-full bg-primary" aria-hidden />
                  <span className="sr-only">{tr("Unread:", "ނުކިޔާ:")}</span>
                </>
              ) : null}
              {t(i.title)}
            </span>
          )}
          description={(i) => t(i.body)}
          meta={(i) => (
            <>
              <span>{t(categoryNames[i.category])}</span>
              <RelativeDate value={i.time} now={NOW} />
            </>
          )}
          itemActions={(i) => [
            {
              id: "read",
              label: i.read ? tr("Mark as unread", "ނުކިޔާ ކަމަށް") : tr("Mark as read", "ކިޔިއްޖެ"),
              icon: i.read ? "mail" : "check",
              onSelect: () => markRead([i.id], !i.read),
            },
            {
              id: "delete",
              label: tr("Delete", "ޑިލީޓް"),
              icon: "trash",
              destructive: true,
              confirm: false,
              separator: true,
              onSelect: () => {
                setItems((list) => list.filter((x) => x.id !== i.id))
                toast(tr("Notification deleted", "ނޮޓިފިކޭޝަން ޑިލީޓްކުރެވިއްޖެ"), {
                  action: { label: tr("Undo", "އަނބުރާ"), onClick: () => setItems(items) },
                })
              },
            },
          ]}
          empty={
            <EmptyState
              icon="bell"
              title={
                filter === "unread"
                  ? tr("You're all caught up", "ހުރިހާ ނޮޓިފިކޭޝަނެއް ކިޔިއްޖެ")
                  : tr("No notifications", "ނޮޓިފިކޭޝަނެއް ނެތް")
              }
              description={tr("New notifications appear here.", "އައު ނޮޓިފިކޭޝަން މިތާ ފެންނާނެ.")}
            />
          }
        />
      </div>
    </div>
  )

  const preferencesPanel = (
    <div className="gap-6 lg:grid-cols-[minmax(0,1fr)_17rem] lg:items-start grid">
      <div className="gap-6 min-w-0 grid">
        {(Object.keys(categoryNames) as NotificationCategory[]).map((cat) => (
          <Card key={cat} title={t(categoryNames[cat])} headingLevel={3}>
            <div className="divide-y">
              {preferenceEvents
                .filter((e) => e.category === cat)
                .map((e) => (
                  <fieldset
                    key={e.id}
                    className="gap-3 py-3 md:grid-cols-[minmax(0,1fr)_auto] first:pt-0 last:pb-0 grid"
                  >
                    <legend className="sr-only">{t(e.label)}</legend>
                    <div aria-hidden>
                      <p className="font-medium">{t(e.label)}</p>
                      <p className="text-sm text-muted-foreground">{t(e.description)}</p>
                    </div>
                    <div className="gap-x-5 gap-y-2 flex flex-wrap items-center">
                      {CHANNELS.map((c) => (
                        <Switch
                          key={c}
                          size="sm"
                          label={t(channelNames[c])}
                          aria-label={`${t(e.label)}: ${t(channelNames[c])}`}
                          disabled={c === "inApp" && cat === "security"}
                          checked={prefs[e.id]?.[c] ?? false}
                          onCheckedChange={(on) => {
                            setPrefs((p) => ({ ...p, [e.id]: { ...p[e.id]!, [c]: on } }))
                            setStatus("idle")
                          }}
                        />
                      ))}
                    </div>
                  </fieldset>
                ))}
            </div>
          </Card>
        ))}
      </div>
      <SaveBar
        changes={changes}
        saving={saving}
        status={status}
        onDiscard={() => {
          setPrefs(saved)
          setStatus("idle")
        }}
        onSave={async () => {
          setSaving(true)
          await wait(800)
          setSaved(prefs)
          setSaving(false)
          setStatus("success")
          toast.success(tr("Preferences saved", "ޕްރެފަރެންސް ސޭވްކުރެވިއްޖެ"))
        }}
        successMessage={tr("Preferences saved", "ޕްރެފަރެންސް ސޭވްކުރެވިއްޖެ")}
      />
    </div>
  )

  return (
    <AdminShell
      contentWidth="wide"
      breadcrumbs={[{ label: tr("Settings & access", "ސެޓިންގްސް") }, { label: tr("Notifications", "ނޮޓިފިކޭޝަން") }]}
    >
      <div className="gap-6 grid">
        <PageTitle
          title={tr("Notifications", "ނޮޓިފިކޭޝަން")}
          description={
            unread
              ? tr(`You have ${unread} unread notifications.`, `ނުކިޔާ ${unread} ނޮޓިފިކޭޝަން އެބައޮތް.`)
              : tr("You're all caught up.", "ހުރިހާ ނޮޓިފިކޭޝަނެއް ކިޔިއްޖެ.")
          }
          links={[
            { label: tr("My profile", "ޕްރޮފައިލް"), href: routes.adminSettings.userProfile, icon: "user" },
            { label: tr("Settings", "ސެޓިންގްސް"), href: routes.adminSettings.settings, icon: "settings" },
          ]}
        />
        <Tabs
          variant="line"
          listLabel={tr("Notifications", "ނޮޓިފިކޭޝަން")}
          items={[
            { value: "inbox", label: tr("Inbox", "އިންބޮކްސް"), icon: "bell", count: unread, content: inboxPanel },
            {
              value: "preferences",
              label: tr("Preferences", "ޕްރެފަރެންސް"),
              icon: "settings",
              content: preferencesPanel,
            },
          ]}
        />
      </div>
    </AdminShell>
  )
}
