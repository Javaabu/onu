"use client"

import * as React from "react"

import { Icon } from "../../icons/icon"
import { useLinkComponent, useTranslation } from "../../providers/onu-provider"
import { DropdownMenuItem, DropdownMenuSeparator } from "../../ui/dropdown-menu"
import { ConfirmDialog, type ConfirmOptions } from "./_shared"

/** An action on one record: a row's ⋯ menu or a record page header. */
export interface RecordAction {
  id: string
  label: React.ReactNode
  /** Semantic icon name. */
  icon?: string
  /** Navigate instead of calling `onSelect`. Uses the provider's link component. */
  href?: string
  onSelect?: () => void | Promise<unknown>
  /** Red styling. Destructive actions ask for confirmation unless `confirm` is `false`. */
  destructive?: boolean
  /** Ask before running. `true` uses a default "Delete Jane Doe?" style question. */
  confirm?: boolean | ConfirmOptions
  /**
   * Whether the current user may do this. `false` leaves it out of the menu
   * entirely: only actions the user can actually do are listed (§25.6).
   */
  permitted?: boolean
  disabled?: boolean
  /** Draw a separator above this item. */
  separator?: boolean
}

export function visibleActions(actions: RecordAction[]) {
  return actions.filter((a) => a.permitted !== false)
}

export function needsConfirm(action: RecordAction) {
  return action.confirm === undefined ? !!action.destructive : action.confirm !== false
}

/** Default confirmation for an action on a record called `name`. */
export function useConfirmOptions() {
  const { t } = useTranslation()
  return React.useCallback(
    (action: RecordAction, name: string): ConfirmOptions => {
      const custom = typeof action.confirm === "object" ? action.confirm : {}
      if (action.id === "force-delete")
        return {
          title: t("listing.deletePermanentlyTitle", { name }),
          description: t("listing.deletePermanentlyDescription"),
          confirmLabel: t("listing.deletePermanently"),
          destructive: true,
          ...custom,
        }
      const isDelete = action.id === "delete"
      return {
        title: isDelete ? t("listing.deleteRecordTitle", { name }) : `${textOf(action.label)} ${name}?`,
        description: t("listing.deleteRecordDescription"),
        confirmLabel: action.label,
        destructive: !!action.destructive,
        ...custom,
      }
    },
    [t],
  )
}

function textOf(node: React.ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node)
  return ""
}

/** Runs actions, asking for confirmation first where needed. */
export function useActionRunner(name: string) {
  const confirmOptions = useConfirmOptions()
  const [pending, setPending] = React.useState<RecordAction | null>(null)
  const [open, setOpen] = React.useState(false)
  const queued = React.useRef<RecordAction | null>(null)

  /** For a menu: queue the action, and open the dialog once the menu has closed. */
  const queue = (action: RecordAction) => {
    if (needsConfirm(action)) {
      queued.current = action
      setPending(action)
    } else void action.onSelect?.()
  }
  /** Call from the menu's `onCloseAutoFocus`, after focus is back on the trigger. */
  const flush = () => {
    if (queued.current) {
      queued.current = null
      setOpen(true)
    }
  }
  /** For a button: ask now, or run now. */
  const run = (action: RecordAction) => {
    if (needsConfirm(action)) {
      setPending(action)
      setOpen(true)
    } else void action.onSelect?.()
  }

  const dialog = pending ? (
    <ConfirmDialog
      open={open}
      onOpenChange={setOpen}
      onConfirm={() => pending.onSelect?.()}
      {...confirmOptions(pending, name)}
    />
  ) : null

  return { queue, flush, run, dialog }
}

/** Menu items for a list of actions. */
export function ActionMenuItems({
  actions,
  onChoose,
}: {
  actions: RecordAction[]
  onChoose: (a: RecordAction) => void
}) {
  const Link = useLinkComponent()
  return (
    <>
      {actions.map((action, index) => (
        <React.Fragment key={action.id}>
          {action.separator && index > 0 ? <DropdownMenuSeparator /> : null}
          <DropdownMenuItem
            variant={action.destructive ? "destructive" : "default"}
            disabled={action.disabled}
            className="touch:min-h-11"
            asChild={!!action.href}
            onSelect={action.href ? undefined : () => onChoose(action)}
          >
            {action.href ? (
              <Link href={action.href}>
                {action.icon ? <Icon name={action.icon} /> : null}
                {action.label}
              </Link>
            ) : (
              <>
                {action.icon ? <Icon name={action.icon} /> : null}
                {action.label}
              </>
            )}
          </DropdownMenuItem>
        </React.Fragment>
      ))}
    </>
  )
}
