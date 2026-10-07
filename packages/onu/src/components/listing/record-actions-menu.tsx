"use client"

import * as React from "react"

import { Icon } from "../../icons/icon"
import { cn } from "../../lib/utils"
import { useMediaQuery } from "../../hooks/use-media-query"
import { useLinkComponent, useTranslation } from "../../providers/onu-provider"
import { Button } from "../../ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "../../ui/dropdown-menu"
import { ActionMenuItems, useActionRunner, visibleActions, type RecordAction } from "./_actions"

export interface RecordActionsMenuProps extends Omit<React.ComponentProps<"div">, "children"> {
  /** The record's display name, used in confirmations ("Delete Jane Doe?"). */
  name: string
  actions: RecordAction[]
  /**
   * How many actions show as buttons on screens from 640px wide; the rest go in
   * a "More actions" menu. On phones every action is in the menu. Default `2`.
   */
  maxVisible?: number
  size?: "sm" | "default"
  classNames?: { button?: string; trigger?: string; content?: string }
}

/**
 * Actions in a record page header (e.g. Logs, Approve, Delete). The first few
 * are buttons; the rest, and all of them on phones, are in a menu.
 * Only permitted actions are shown, and risky ones ask first (§25.8).
 */
export function RecordActionsMenu({
  name,
  actions,
  maxVisible = 2,
  size = "default",
  className,
  classNames,
  ...props
}: RecordActionsMenuProps) {
  const { t } = useTranslation()
  const Link = useLinkComponent()
  const { run, queue, flush, dialog } = useActionRunner(name)
  const triggerRef = React.useRef<HTMLButtonElement>(null)
  const wide = useMediaQuery("(min-width: 640px)")
  const items = visibleActions(actions)
  const inline = wide ? items.slice(0, maxVisible) : []
  const overflow = wide ? items.slice(maxVisible) : items
  if (items.length === 0) return null

  return (
    <div data-slot="record-actions" className={cn("flex-1", className)} {...props}>
      <div className="gap-2 flex flex-wrap items-center justify-end">
        {inline.map((action) => {
          const content = (
            <>
              {action.icon ? <Icon name={action.icon} /> : null}
              {action.label}
            </>
          )
          const classes = cn("touch:min-h-11", classNames?.button)
          const variant = action.destructive ? "destructive" : "outline"
          return action.href ? (
            <Button key={action.id} asChild variant={variant} size={size} className={classes}>
              <Link href={action.href}>{content}</Link>
            </Button>
          ) : (
            <Button
              key={action.id}
              variant={variant}
              size={size}
              disabled={action.disabled}
              className={classes}
              onClick={() => run(action)}
            >
              {content}
            </Button>
          )
        })}
        {overflow.length ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size={size === "sm" ? "icon-sm" : "icon"}
                aria-label={t("listing.moreActions")}
                className={cn("touch:size-11", classNames?.trigger)}
              >
                <Icon name="more" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className={cn("min-w-44 w-auto", classNames?.content)}
              onCloseAutoFocus={(event) => flush(event, triggerRef.current)}
            >
              <ActionMenuItems actions={overflow} onChoose={queue} />
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}
      </div>
      {dialog}
    </div>
  )
}
