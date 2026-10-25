"use client"

import * as React from "react"

import { Icon } from "../../icons/icon"
import { cn } from "../../lib/utils"
import { useTranslation } from "../../providers/onu-provider"
import type { ThaanaProp } from "../../thaana/use-thaana-field"
import { Button } from "../../ui/button"
import { Composer } from "./_composer"
import { ConfirmDeleteButton } from "./_confirm-delete"
import type { DateInput } from "./_utils"
import { RelativeDate } from "./relative-date"
import { UserAvatar } from "./user-avatar"
import { registerEnglish } from "../../i18n/english"
import { common as en_common } from "../../locales/en/common"
import { display as en_display } from "../../locales/en/display"

registerEnglish({ common: en_common, display: en_display })

export type CommentId = string | number

export interface CommentAuthor {
  id: CommentId
  name: string
  avatar?: string | null
}

export interface CommentData {
  id: CommentId
  author: CommentAuthor
  /** Plain text (editable) or rich content. */
  body: React.ReactNode
  createdAt: DateInput
  /** Set when the comment was edited; shows "edited". */
  editedAt?: DateInput
  replies?: CommentData[]
}

export interface CommentThreadLabels {
  /** Heading, and the region's name when `title` is `null`. Default "Comments" ("Notes" for `variant="list"`). */
  title?: string
  /** Shown when there are no comments. */
  empty?: string
  /** The composer's accessible name and placeholder. */
  composer?: string
  /** The composer's submit button. */
  submit?: string
  /** The delete button's accessible name. */
  delete?: string
  /** The delete confirmation's title. */
  deleteConfirm?: string
}

export interface CommentThreadProps extends Omit<React.ComponentProps<"section">, "onSubmit" | "title"> {
  comments: CommentData[]
  /** The signed-in user; their own comments get Edit and Delete. */
  currentUserId?: CommentId
  /** Post a new comment (`parentId` is `null`) or a reply. Return a promise to show a spinner. */
  onAdd?: (body: string, parentId: CommentId | null) => void | Promise<unknown>
  onEdit?: (id: CommentId, body: string) => void | Promise<unknown>
  onDelete?: (id: CommentId) => void | Promise<unknown>
  /** Override who may edit / delete. Defaults to the comment's author. */
  canEdit?: (comment: CommentData) => boolean
  canDelete?: (comment: CommentData) => boolean
  /** Show Reply buttons (with `onAdd`). Default `true`, `false` for `variant="list"`. */
  replies?: boolean
  /**
   * `thread` (default): comments as articles with nested replies. `list`: internal
   * notes on a record, a bordered, divided list with the note strings, no Reply
   * buttons and the composer on top.
   */
  variant?: "thread" | "list"
  /** Put the composer below the comments or above them. Default `bottom`, `top` for `variant="list"`. */
  composerPosition?: "top" | "bottom"
  /** How many levels are indented. Deeper replies line up with their parent. Default 3. */
  maxDepth?: number
  /** Type Thaana in the composer (R13.3). */
  thaana?: ThaanaProp
  /** Heading shown above the thread. Pass `null` to hide it. */
  title?: React.ReactNode
  /** Override the built-in strings. */
  labels?: CommentThreadLabels
  /** Reference time for the relative dates (mainly for tests and SSR). */
  now?: DateInput
  classNames?: { list?: string; comment?: string; body?: string; composer?: string }
}

interface ThreadContextValue extends Pick<
  CommentThreadProps,
  "currentUserId" | "onAdd" | "onEdit" | "onDelete" | "canEdit" | "canDelete" | "thaana" | "now" | "classNames"
> {
  maxDepth: number
  replies: boolean
  list: boolean
  deleteLabel: string
  deleteConfirm: string
}

const ThreadContext = React.createContext<ThreadContextValue>({
  maxDepth: 3,
  replies: true,
  list: false,
  deleteLabel: "",
  deleteConfirm: "",
})

/**
 * A discussion: comments with nested replies, edit and delete for your own
 * comments, and a composer that can type Thaana. Mentions are not built in.
 * With `variant="list"` it is a flat list of internal notes on a record.
 */
export function CommentThread({
  comments,
  currentUserId,
  onAdd,
  onEdit,
  onDelete,
  canEdit,
  canDelete,
  replies: repliesProp,
  variant = "thread",
  composerPosition: composerPositionProp,
  maxDepth = 3,
  thaana,
  title,
  labels,
  now,
  className,
  classNames,
  ...props
}: CommentThreadProps) {
  const { t } = useTranslation()
  const headingId = React.useId()
  const list = variant === "list"
  const replies = repliesProp ?? !list
  const composerPosition = composerPositionProp ?? (list ? "top" : "bottom")
  const deleteLabel = labels?.delete ?? t(list ? "display.deleteNote" : "display.deleteComment")
  const deleteConfirm = labels?.deleteConfirm ?? t(list ? "display.deleteNoteConfirm" : "display.deleteCommentConfirm")
  const value = React.useMemo<ThreadContextValue>(
    () => ({
      currentUserId,
      onAdd,
      onEdit,
      onDelete,
      canEdit,
      canDelete,
      thaana,
      now,
      classNames,
      maxDepth,
      replies,
      list,
      deleteLabel,
      deleteConfirm,
    }),
    [
      currentUserId,
      onAdd,
      onEdit,
      onDelete,
      canEdit,
      canDelete,
      thaana,
      now,
      classNames,
      maxDepth,
      replies,
      list,
      deleteLabel,
      deleteConfirm,
    ],
  )
  const name = labels?.title ?? t(list ? "display.notes" : "display.comments")
  const composerLabel = labels?.composer ?? t(list ? "display.writeNote" : "display.writeComment")
  const composer = onAdd ? (
    <Composer
      label={composerLabel}
      placeholder={composerLabel}
      submitLabel={labels?.submit ?? t(list ? "display.addNote" : "display.postComment")}
      thaana={thaana}
      onSubmit={(body) => onAdd(body, null)}
      className={classNames?.composer}
    />
  ) : null

  return (
    <section
      data-slot="comment-thread"
      aria-labelledby={title === null ? undefined : headingId}
      aria-label={title === null ? name : undefined}
      className={cn("gap-4 grid", className)}
      {...props}
    >
      {title === null ? null : (
        <h2 id={headingId} className="text-base font-medium">
          {title ?? name}
        </h2>
      )}
      {composerPosition === "top" ? composer : null}
      <ThreadContext.Provider value={value}>
        {comments.length ? (
          <CommentList comments={comments} depth={1} className={classNames?.list} />
        ) : (
          <p className="text-sm text-muted-foreground">
            {labels?.empty ?? t(list ? "display.noNotes" : "display.noComments")}
          </p>
        )}
      </ThreadContext.Provider>
      {composerPosition === "bottom" ? composer : null}
    </section>
  )
}

function CommentList({ comments, depth, className }: { comments: CommentData[]; depth: number; className?: string }) {
  const { maxDepth, list } = React.useContext(ThreadContext)
  // Past `maxDepth`, replies line up with their parent instead of indenting further.
  return (
    <ul
      className={cn(
        list ? "divide-y overflow-hidden rounded-lg border" : "gap-4 grid",
        depth > 1 && "mt-3",
        depth > 1 && depth <= maxDepth && "ps-4 border-s",
        className,
      )}
    >
      {comments.map((comment) => (
        <CommentItem key={comment.id} comment={comment} depth={depth} />
      ))}
    </ul>
  )
}

function CommentItem({ comment, depth }: { comment: CommentData; depth: number }) {
  const { t } = useTranslation()
  const ctx = React.useContext(ThreadContext)
  const [mode, setMode] = React.useState<"view" | "edit" | "reply">("view")
  const own = ctx.currentUserId !== undefined && comment.author.id === ctx.currentUserId
  const editable = !!ctx.onEdit && typeof comment.body === "string" && (ctx.canEdit ? ctx.canEdit(comment) : own)
  const deletable = !!ctx.onDelete && (ctx.canDelete ? ctx.canDelete(comment) : own)
  const replyable = !!ctx.onAdd && ctx.replies
  const replyButton = React.useRef<HTMLButtonElement>(null)
  const editButton = React.useRef<HTMLButtonElement>(null)

  const close = (button: React.RefObject<HTMLButtonElement | null>) => {
    setMode("view")
    requestAnimationFrame(() => button.current?.focus())
  }

  const actions =
    mode !== "edit" && (replyable || editable || deletable) ? (
      <div className={cn("gap-1 flex items-center", !ctx.list && "mt-1 -ms-2")}>
        {replyable ? (
          <Button
            ref={replyButton}
            type="button"
            variant="ghost"
            size="xs"
            className="touch:h-11"
            aria-expanded={mode === "reply"}
            onClick={() => setMode(mode === "reply" ? "view" : "reply")}
          >
            <Icon name="reply" data-icon="inline-start" />
            {t("display.reply")}
            <span className="sr-only">: {comment.author.name}</span>
          </Button>
        ) : null}
        {editable ? (
          <Button
            ref={editButton}
            type="button"
            variant="ghost"
            size="icon-xs"
            className="touch:size-11"
            aria-label={t("display.editComment")}
            onClick={() => setMode("edit")}
          >
            <Icon name="edit" />
          </Button>
        ) : null}
        {deletable ? (
          <ConfirmDeleteButton
            label={ctx.deleteLabel}
            title={ctx.deleteConfirm}
            onConfirm={() => ctx.onDelete?.(comment.id)}
          />
        ) : null}
      </div>
    ) : null

  const Header = ctx.list ? "div" : "header"
  const content = (
    <>
      <UserAvatar name={comment.author.name} src={comment.author.avatar} size="sm" decorative />
      <div className="min-w-0 flex-1">
        <Header className="gap-x-2 text-sm flex flex-wrap items-baseline">
          <span className="font-medium">{comment.author.name}</span>
          <RelativeDate value={comment.createdAt} now={ctx.now} className="text-xs text-muted-foreground" />
          {comment.editedAt ? <span className="text-xs text-muted-foreground">({t("display.edited")})</span> : null}
        </Header>
        {mode === "edit" ? (
          <Composer
            className="mt-2"
            label={t("display.editComment")}
            submitLabel={t("common.save")}
            defaultValue={comment.body as string}
            thaana={ctx.thaana}
            focusOnMount
            onCancel={() => close(editButton)}
            onSubmit={async (body) => {
              await ctx.onEdit?.(comment.id, body)
              close(editButton)
            }}
          />
        ) : (
          <div
            dir="auto"
            className={cn("mt-1 text-sm break-words whitespace-pre-line", ctx.classNames?.body)}
            data-slot="comment-body"
          >
            {comment.body}
          </div>
        )}
        {ctx.list ? null : actions}
        {mode === "reply" && replyable ? (
          <Composer
            className="mt-2"
            label={t("display.replyTo", { name: comment.author.name })}
            placeholder={t("display.writeReply")}
            submitLabel={t("display.reply")}
            thaana={ctx.thaana}
            focusOnMount
            onCancel={() => close(replyButton)}
            onSubmit={async (body) => {
              await ctx.onAdd?.(body, comment.id)
              close(replyButton)
            }}
          />
        ) : null}
        {comment.replies?.length ? <CommentList comments={comment.replies} depth={depth + 1} /> : null}
      </div>
      {ctx.list ? actions : null}
    </>
  )

  // The list variant is a plain list item; the thread names each comment as an article.
  return ctx.list ? (
    <li
      data-slot="comment"
      data-comment-id={comment.id}
      className={cn("gap-3 p-3 flex items-start bg-card", ctx.classNames?.comment)}
    >
      {content}
    </li>
  ) : (
    <li data-slot="comment" data-comment-id={comment.id}>
      <article className={cn("gap-3 flex items-start", ctx.classNames?.comment)} aria-label={comment.author.name}>
        {content}
      </article>
    </li>
  )
}
