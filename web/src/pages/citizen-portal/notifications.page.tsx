import * as React from "react"
import { Button, EmptyState, Tabs, Icon, ListView, PageTitle, Select, Tag, toast } from "@javaabu/onu"

import { CitizenShell } from "../_shared/shells"
import { useTr } from "../_shared/i18n"
import { notifications as initial, useFormat, wait, type PortalNotification } from "../applications/_data"

export const meta = { title: "Notifications inbox", group: "Citizen portal", layout: "bare", order: 6 }

const ICONS: Record<PortalNotification["category"], string> = {
  applications: "file-text",
  payments: "credit-card",
  announcements: "megaphone",
}

export default function NotificationsPage() {
  const tr = useTr()
  const { dateTime } = useFormat()
  const [items, setItems] = React.useState(initial)
  const [tab, setTab] = React.useState("all")
  const [category, setCategory] = React.useState("all")

  const categoryLabel: Record<PortalNotification["category"], string> = {
    applications: tr("Applications", "އެޕްލިކޭޝަން"),
    payments: tr("Payments", "ފައިސާ"),
    announcements: tr("Announcements", "އިޢުލާން"),
  }

  const unread = items.filter((n) => !n.read).length
  const shown = items.filter((n) => (tab === "all" || !n.read) && (category === "all" || n.category === category))

  const setRead = (id: string, read: boolean) => setItems((list) => list.map((n) => (n.id === id ? { ...n, read } : n)))

  return (
    <CitizenShell>
      <div className="gap-5 max-w-4xl grid">
        <PageTitle
          title={tr("Notifications", "ނޮޓިފިކޭޝަންތައް")}
          description={tr(`${unread} unread`, `${unread} ނުކިޔާ`)}
          action={
            <Button
              variant="outline"
              startIcon="check"
              disabled={unread === 0}
              onClick={() => {
                setItems((list) => list.map((n) => ({ ...n, read: true })))
                toast.success(tr("All notifications marked as read", "ހުރިހާ ނޮޓިފިކޭޝަނެއް ކިޔިއްޖެ"))
              }}
            >
              {tr("Mark all as read", "ހުރިހާ އެއްޗެއް ކިޔިއްޖެ")}
            </Button>
          }
        />

        <div className="gap-3 sm:flex-row sm:items-end sm:justify-between flex flex-col">
          <Tabs
            variant="line"
            countAppearance="pill"
            listLabel={tr("Show", "ދައްކާ")}
            value={tab}
            onValueChange={setTab}
            items={[
              { value: "all", label: tr("All", "ހުރިހާ"), count: items.length },
              { value: "unread", label: tr("Unread", "ނުކިޔާ"), count: unread },
            ]}
          />
          <Select
            aria-label={tr("Category", "ބާވަތް")}
            value={category}
            onValueChange={setCategory}
            className="sm:w-56"
            options={[
              { value: "all", label: tr("All categories", "ހުރިހާ ބާވަތެއް") },
              ...(Object.keys(categoryLabel) as PortalNotification["category"][]).map((c) => ({
                value: c,
                label: categoryLabel[c],
              })),
            ]}
          />
        </div>

        <ListView
          aria-label={tr("Notifications", "ނޮޓިފިކޭޝަންތައް")}
          items={shown}
          getId={(n) => n.id}
          getName={(n) => tr(...n.title)}
          getHref={(n) => n.href}
          media={(n) => (
            <span className="size-9 relative flex shrink-0 items-center justify-center rounded-full bg-muted">
              <Icon name={ICONS[n.category]} className="size-4 text-muted-foreground" />
              {!n.read ? (
                <span className="-top-0.5 -end-0.5 size-2.5 absolute rounded-full bg-primary ring-2 ring-background" />
              ) : null}
            </span>
          )}
          title={(n) => (
            <span className={n.read ? "font-normal" : "font-semibold"}>
              {!n.read ? <span className="sr-only">{tr("Unread: ", "ނުކިޔާ: ")}</span> : null}
              {tr(...n.title)}
            </span>
          )}
          description={(n) => tr(...n.body)}
          meta={(n) => (
            <>
              <span className="tabular-nums">{dateTime(n.time)}</span>
              <Tag size="sm" variant="outline">
                {categoryLabel[n.category]}
              </Tag>
              {!n.read ? (
                <Tag size="sm" variant="primary">
                  {tr("New", "އައު")}
                </Tag>
              ) : null}
            </>
          )}
          itemActions={(n) => [
            n.read
              ? {
                  id: "unread",
                  label: tr("Mark as unread", "ނުކިޔާ ކަމަށް ބަދަލުކުރޭ"),
                  icon: "mail",
                  onSelect: () => setRead(n.id, false),
                }
              : {
                  id: "read",
                  label: tr("Mark as read", "ކިޔިއްޖެ"),
                  icon: "check",
                  onSelect: () => setRead(n.id, true),
                },
            {
              id: "delete",
              label: tr("Delete", "ފުހެލާ"),
              icon: "trash",
              destructive: true,
              confirm: {
                title: tr("Delete this notification?", "މި ނޮޓިފިކޭޝަން ފުހެލަންވީތޯ؟"),
                confirmLabel: tr("Delete", "ފުހެލާ"),
              },
              onSelect: async () => {
                await wait(300)
                setItems((list) => list.filter((x) => x.id !== n.id))
                toast.success(tr("Notification deleted", "ނޮޓިފިކޭޝަން ފުހެލެވިއްޖެ"))
              },
            },
          ]}
          empty={
            <EmptyState
              bordered
              icon="bell"
              title={
                tab === "unread"
                  ? tr("You're all caught up", "ހުރިހާ ނޮޓިފިކޭޝަނެއް ކިޔާފައި")
                  : tr("No notifications", "ނޮޓިފިކޭޝަނެއް ނެތް")
              }
              description={
                tab === "unread"
                  ? tr("There are no unread notifications.", "ނުކިޔާ ނޮޓިފިކޭޝަނެއް ނެތް.")
                  : tr("Nothing in this category yet.", "މި ބާވަތުގައި އަދި އެއްވެސް އެއްޗެއް ނެތް.")
              }
              action={
                tab !== "all" || category !== "all" ? (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setTab("all")
                      setCategory("all")
                    }}
                  >
                    {tr("Show all", "ހުރިހާ އެއްޗެއް ދައްކާ")}
                  </Button>
                ) : undefined
              }
            />
          }
        />
      </div>
    </CitizenShell>
  )
}
