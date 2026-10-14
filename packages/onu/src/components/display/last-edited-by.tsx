"use client"

import * as React from "react"

import { cn } from "../../lib/utils"
import { useTranslation } from "../../providers/onu-provider"
import type { DateInput } from "./_utils"
import { ConditionalLink } from "./conditional-link"
import { RelativeDate, type RelativeDateProps } from "./relative-date"
import { UserAvatar } from "./user-avatar"
import { registerEnglish } from "../../i18n/english"
import { display as en_display } from "../../locales/en/display"

registerEnglish({ display: en_display })

export interface LastEditedByProps extends React.ComponentProps<"div"> {
  /** The person who made the last change. */
  user?: { name: string; avatar?: string | null; href?: string } | null
  /** When the change was made. */
  at: DateInput
  /** Hide the avatar. */
  hideAvatar?: boolean
  /** Props for the relative date (e.g. a fixed `now`). */
  dateProps?: Omit<RelativeDateProps, "value">
  classNames?: { avatar?: string; name?: string; date?: string }
}

/** "Last edited by Aishath Shiuna · 5 minutes ago", with an avatar. */
export function LastEditedBy({
  user,
  at,
  hideAvatar = false,
  dateProps,
  className,
  classNames,
  ...props
}: LastEditedByProps) {
  const { t } = useTranslation()
  const name = (
    <ConditionalLink href={user?.href} className="font-medium text-foreground">
      {user?.name}
    </ConditionalLink>
  )
  // Split the translated sentence around {name} so the name can be a link or styled.
  const [before = "", after = ""] = t("display.lastEditedBy", { name: "\u0000" }).split("\u0000")

  return (
    <div
      data-slot="last-edited-by"
      className={cn("gap-2 text-sm flex items-center text-muted-foreground", className)}
      {...props}
    >
      {!hideAvatar && user ? (
        <UserAvatar name={user.name} src={user.avatar} size="xs" decorative className={classNames?.avatar} />
      ) : null}
      <span className="gap-x-1.5 min-w-0 flex flex-wrap items-baseline">
        {user ? (
          <span className={classNames?.name}>
            {before}
            {name}
            {after}
          </span>
        ) : null}
        {user ? <span aria-hidden>·</span> : null}
        <RelativeDate value={at} className={classNames?.date} {...dateProps} />
      </span>
    </div>
  )
}
