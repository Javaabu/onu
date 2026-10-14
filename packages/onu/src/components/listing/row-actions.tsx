"use client"

import * as React from "react"

import { Icon } from "../../icons/icon"
import { cn } from "../../lib/utils"
import { useTranslation } from "../../providers/onu-provider"
import { Button } from "../../ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "../../ui/dropdown-menu"
import { useMergedRef } from "../inputs/text-input"
import { ActionMenuItems, useActionRunner, visibleActions, type RecordAction } from "./_actions"
import { registerEnglish } from "../../i18n/english"
import { listing as en_listing } from "../../locales/en/listing"

registerEnglish({ listing: en_listing })

export type { RecordAction } from "./_actions"

export interface RowActionsProps extends Omit<React.ComponentProps<"button">, "children"> {
  /** The record's display name, used in "Actions for Jane Doe" and "Delete Jane Doe?". */
  name: string
  actions: RecordAction[]
  /** Menu alignment. Default `end`. */
  align?: "start" | "center" | "end"
  classNames?: { trigger?: string; content?: string }
}

/**
 * The ⋯ menu at the end of a row (§25.6). Lists only permitted actions;
 * destructive ones close the menu and then ask "Delete Jane Doe?". Escape closes
 * the menu and focus returns to the ⋯ button.
 */
export function RowActions({ name, actions, align = "end", className, classNames, ref, ...props }: RowActionsProps) {
  const { t } = useTranslation()
  const { queue, flush, dialog } = useActionRunner(name)
  const triggerRef = React.useRef<HTMLButtonElement>(null)
  const mergedRef = useMergedRef(triggerRef, ref)
  const items = visibleActions(actions)
  if (items.length === 0) return null

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            ref={mergedRef}
            variant="ghost"
            size="icon-sm"
            data-slot="row-actions"
            aria-label={t("listing.actionsFor", { name })}
            className={cn("touch:size-11", classNames?.trigger, className)}
            {...props}
          >
            <Icon name="more" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align={align}
          className={cn("min-w-40 w-auto", classNames?.content)}
          onCloseAutoFocus={(event) => flush(event, triggerRef.current)}
        >
          <ActionMenuItems actions={items} onChoose={queue} />
        </DropdownMenuContent>
      </DropdownMenu>
      {dialog}
    </>
  )
}

/** Standard actions for a trashed record: Restore, and Delete permanently (with confirmation). */
export function trashActions(
  t: (key: string) => string,
  handlers: { onRestore?: () => void | Promise<unknown>; onForceDelete?: () => void | Promise<unknown> },
  permissions: { restore?: boolean; forceDelete?: boolean } = {},
): RecordAction[] {
  return [
    {
      id: "restore",
      label: t("listing.restore"),
      icon: "restore",
      onSelect: handlers.onRestore,
      permitted: permissions.restore !== false && !!handlers.onRestore,
    },
    {
      id: "force-delete",
      label: t("listing.deletePermanently"),
      icon: "trash",
      destructive: true,
      onSelect: handlers.onForceDelete,
      permitted: permissions.forceDelete !== false && !!handlers.onForceDelete,
    },
  ]
}
