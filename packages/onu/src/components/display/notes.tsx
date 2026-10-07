"use client"

import * as React from "react"

import { cn } from "../../lib/utils"
import { useTranslation } from "../../providers/onu-provider"
import type { ThaanaProp } from "../../thaana/use-thaana-field"
import { Composer } from "./_composer"
import { ConfirmDeleteButton } from "./_confirm-delete"
import type { DateInput } from "./_utils"
import { RelativeDate } from "./relative-date"
import { UserAvatar } from "./user-avatar"

export interface NoteData {
  id: string | number
  author: { id?: string | number; name: string; avatar?: string | null }
  body: React.ReactNode
  createdAt: DateInput
}

export interface NotesProps extends Omit<React.ComponentProps<"section">, "onSubmit" | "title"> {
  notes: NoteData[]
  /** Add a note. Return a promise to show a spinner until it resolves. */
  onAdd?: (body: string) => void | Promise<unknown>
  onDelete?: (id: NoteData["id"]) => void | Promise<unknown>
  /** Who may delete a note. Default: everyone when `onDelete` is set, or only the author when `currentUserId` is set. */
  canDelete?: (note: NoteData) => boolean
  currentUserId?: string | number
  /** Type Thaana in the note box (R13.3). */
  thaana?: ThaanaProp
  /** Put the add-note box above the list (default) or below it. */
  composerPosition?: "top" | "bottom"
  /** Heading; pass `null` to hide it. */
  title?: React.ReactNode
  now?: DateInput
  classNames?: { list?: string; note?: string; composer?: string }
}

/** Internal notes on a record: who wrote what and when, with add and delete. */
export function Notes({
  notes,
  onAdd,
  onDelete,
  canDelete,
  currentUserId,
  thaana,
  composerPosition = "top",
  title,
  now,
  className,
  classNames,
  ...props
}: NotesProps) {
  const { t } = useTranslation()
  const headingId = React.useId()
  const composer = onAdd ? (
    <Composer
      label={t("display.writeNote")}
      placeholder={t("display.writeNote")}
      submitLabel={t("display.addNote")}
      thaana={thaana}
      onSubmit={onAdd}
      className={classNames?.composer}
    />
  ) : null
  const deletable = (note: NoteData) =>
    !!onDelete && (canDelete ? canDelete(note) : currentUserId === undefined || note.author.id === currentUserId)

  return (
    <section
      data-slot="notes"
      aria-labelledby={title === null ? undefined : headingId}
      aria-label={title === null ? t("display.notes") : undefined}
      className={cn("gap-4 grid", className)}
      {...props}
    >
      {title === null ? null : (
        <h2 id={headingId} className="text-base font-medium">
          {title ?? t("display.notes")}
        </h2>
      )}
      {composerPosition === "top" ? composer : null}
      {notes.length ? (
        <ul className={cn("divide-y overflow-hidden rounded-lg border", classNames?.list)}>
          {notes.map((note) => (
            <li key={note.id} data-slot="note" className={cn("gap-3 p-3 flex items-start bg-card", classNames?.note)}>
              <UserAvatar name={note.author.name} src={note.author.avatar} size="sm" decorative />
              <div className="min-w-0 flex-1">
                <div className="gap-x-2 text-sm flex flex-wrap items-baseline">
                  <span className="font-medium">{note.author.name}</span>
                  <RelativeDate value={note.createdAt} now={now} className="text-xs text-muted-foreground" />
                </div>
                <div dir="auto" className="mt-1 text-sm break-words whitespace-pre-line">
                  {note.body}
                </div>
              </div>
              {deletable(note) ? (
                <ConfirmDeleteButton
                  label={t("display.deleteNote")}
                  title={t("display.deleteNoteConfirm")}
                  onConfirm={() => onDelete?.(note.id)}
                />
              ) : null}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">{t("display.noNotes")}</p>
      )}
      {composerPosition === "bottom" ? composer : null}
    </section>
  )
}
