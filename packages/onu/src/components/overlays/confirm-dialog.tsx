"use client"

import * as React from "react"

import { Icon } from "../../icons/icon"
import type { SemanticIconName } from "../../icons/types"
import { cn } from "../../lib/utils"
import { useTranslation } from "../../providers/onu-provider"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../../ui/alert-dialog"
import { Button } from "../../ui/button"
import { Label } from "../../ui/label"
import { TextInput } from "../inputs/text-input"
import { Spinner } from "../loading/spinner"
import { useControllableState } from "./_use-controllable-state"
import { useRestoreFocus } from "./_use-restore-focus"
import { activeConfirm, ConfirmContext } from "./_confirm-context"
import { registerEnglish } from "../../i18n/english"
import { common as en_common } from "../../locales/en/common"
import { overlay as en_overlay } from "../../locales/en/overlay"

registerEnglish({ common: en_common, overlay: en_overlay })

const THAANA = /[ހ-޿]/

export interface ConfirmOptions {
  /** Question to ask. Default "Are you sure?". */
  title?: React.ReactNode
  /** What will happen, e.g. "Aishath Ali will lose access to the portal." */
  description?: React.ReactNode
  /** Label of the confirm button. Default "Confirm" ("Delete" for destructive). */
  confirmLabel?: React.ReactNode
  /** Label of the cancel button. Default "Cancel". */
  cancelLabel?: React.ReactNode
  /** `destructive` colours the confirm button and shows a warning icon. */
  variant?: "default" | "destructive"
  /** Icon beside the title. `false` hides it. Default `warning` for destructive dialogs. */
  icon?: SemanticIconName | (string & {}) | false
  /**
   * Text the user must type before confirming (e.g. a record's name). Thaana
   * text switches the field to the Thaana keyboard.
   */
  confirmText?: string
  /**
   * Runs when the user confirms. If it returns a promise the button shows a
   * spinner, both buttons are disabled and the dialog stays open until it
   * settles. A rejected promise keeps the dialog open and shows the error.
   */
  onConfirm?: () => unknown
  /** Message shown when `onConfirm` fails. Defaults to the error's message or a generic one. */
  errorMessage?: React.ReactNode
}

export interface ConfirmDialogProps extends ConfirmOptions, Omit<React.ComponentProps<"div">, "title"> {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /** Element that opens the dialog (rendered with `asChild`). */
  trigger?: React.ReactNode
  /** Runs when the user cancels (button, Escape). */
  onCancel?: () => void
  /** Extra content under the description. */
  children?: React.ReactNode
  classNames?: {
    content?: string
    icon?: string
    title?: string
    description?: string
    input?: string
    footer?: string
    confirm?: string
    cancel?: string
  }
}

/**
 * Asks the user to confirm an action (alert dialog pattern). Supports a
 * destructive variant, "type the name to confirm", and async actions with a
 * spinner. For a promise-based API use `useConfirm()` with a `ConfirmProvider`.
 */
export function ConfirmDialog({
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  trigger,
  title,
  description,
  confirmLabel,
  cancelLabel,
  variant = "default",
  icon,
  confirmText,
  onConfirm,
  onCancel,
  errorMessage,
  children,
  className,
  classNames,
  ref,
  ...props
}: ConfirmDialogProps) {
  const { t } = useTranslation()
  const restore = useRestoreFocus(ref)
  const [open, setOpen] = useControllableState(openProp, defaultOpen, onOpenChange)
  const [pending, setPending] = React.useState(false)
  const [error, setError] = React.useState<React.ReactNode>(null)
  const [typed, setTyped] = React.useState("")
  const inputRef = React.useRef<HTMLInputElement>(null)
  const inputId = React.useId()
  const destructive = variant === "destructive"
  const iconName = icon === undefined ? (destructive ? "warning" : false) : icon
  const matches = !confirmText || typed.trim() === confirmText.trim()

  // Start fresh every time the dialog closes.
  const [wasOpen, setWasOpen] = React.useState(open)
  if (open !== wasOpen) {
    setWasOpen(open)
    if (!open) {
      setTyped("")
      setError(null)
      setPending(false)
    }
  }

  const handleOpenChange = (next: boolean) => {
    if (pending) return
    if (!next) onCancel?.()
    setOpen(next)
  }

  const handleConfirm = async () => {
    if (!matches || pending) return
    setError(null)
    let result: unknown
    try {
      result = onConfirm?.()
    } catch (e) {
      setError(errorMessage ?? messageOf(e) ?? t("overlay.confirmFailed"))
      return
    }
    if (isPromiseLike(result)) {
      setPending(true)
      try {
        await result
      } catch (e) {
        setPending(false)
        setError(errorMessage ?? messageOf(e) ?? t("overlay.confirmFailed"))
        return
      }
      setPending(false)
    }
    setOpen(false)
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      {trigger ? <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger> : null}
      <AlertDialogContent
        data-slot="confirm-dialog"
        data-variant={variant}
        aria-busy={pending || undefined}
        className={cn("max-w-[calc(100%-2rem)]", className, classNames?.content)}
        onOpenAutoFocus={(e) => {
          if (confirmText) {
            e.preventDefault()
            inputRef.current?.focus()
          }
        }}
        {...(description ? {} : { "aria-describedby": undefined })}
        {...props}
        {...restore}
      >
        <AlertDialogHeader>
          {iconName ? (
            <AlertDialogMedia
              className={cn(destructive && "bg-destructive/10 text-destructive", classNames?.icon)}
              data-slot="confirm-dialog-icon"
            >
              <Icon name={iconName} />
            </AlertDialogMedia>
          ) : null}
          <AlertDialogTitle className={classNames?.title}>{title ?? t("overlay.confirmTitle")}</AlertDialogTitle>
          {description ? (
            <AlertDialogDescription className={classNames?.description}>{description}</AlertDialogDescription>
          ) : null}
        </AlertDialogHeader>
        {children}
        {confirmText ? (
          <div className="gap-2 grid" data-slot="confirm-dialog-type">
            <Label htmlFor={inputId} className="font-normal text-muted-foreground">
              {t("overlay.typeToConfirm", { text: confirmText })}
            </Label>
            <TextInput
              ref={inputRef}
              id={inputId}
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  void handleConfirm()
                }
              }}
              autoComplete="off"
              spellCheck={false}
              disabled={pending}
              thaana={THAANA.test(confirmText)}
              className={classNames?.input}
            />
          </div>
        ) : null}
        {error ? (
          <p role="alert" data-slot="confirm-dialog-error" className="gap-2 text-sm flex items-start text-destructive">
            <Icon name="error" className="mt-0.5 size-4 shrink-0" />
            <span>{error}</span>
          </p>
        ) : null}
        <AlertDialogFooter className={classNames?.footer}>
          <AlertDialogCancel disabled={pending} className={classNames?.cancel}>
            {cancelLabel ?? t("common.cancel")}
          </AlertDialogCancel>
          <Button
            type="button"
            data-slot="confirm-dialog-confirm"
            variant={destructive ? "destructive" : "default"}
            disabled={!matches || pending}
            onClick={() => void handleConfirm()}
            className={cn(
              destructive && "bg-destructive text-destructive-foreground hover:bg-destructive/90 dark:bg-destructive",
              classNames?.confirm,
            )}
          >
            {pending ? <Spinner size="sm" label={t("overlay.working")} /> : null}
            {confirmLabel ?? (destructive ? t("common.delete") : t("common.confirm"))}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

function isPromiseLike(value: unknown): value is PromiseLike<unknown> {
  return !!value && typeof (value as PromiseLike<unknown>).then === "function"
}

function messageOf(e: unknown): string | undefined {
  return e instanceof Error && e.message ? e.message : undefined
}

/* ------------------------------------------------------------------------ */
/* Promise-based API                                                         */
/* ------------------------------------------------------------------------ */

/** Ask for confirmation; resolves `true` when confirmed, `false` when cancelled. */
export type ConfirmFunction = (options?: ConfirmOptions | string) => Promise<boolean>

interface Request {
  options: ConfirmOptions
  resolve: (value: boolean) => void
  key: number
}

export interface ConfirmProviderProps {
  children?: React.ReactNode
  /** Defaults applied to every confirmation, e.g. `{ variant: "destructive" }`. */
  defaults?: ConfirmOptions
}

/**
 * Mount once near the root of the app. Enables `useConfirm()` and the
 * standalone `confirm()` function, which render a `ConfirmDialog` and resolve
 * with the user's answer.
 */
export function ConfirmProvider({ children, defaults }: ConfirmProviderProps) {
  const [request, setRequest] = React.useState<Request | null>(null)
  const [open, setOpen] = React.useState(false)
  const confirmed = React.useRef(false)
  const counter = React.useRef(0)
  const current = React.useRef<Request | null>(null)

  const confirmFn = React.useCallback<ConfirmFunction>((options) => {
    const opts = typeof options === "string" ? { title: options } : (options ?? {})
    return new Promise<boolean>((resolve) => {
      // A new request cancels one that is still open.
      current.current?.resolve(false)
      counter.current += 1
      confirmed.current = false
      const next = { options: opts, resolve, key: counter.current }
      current.current = next
      setRequest(next)
      setOpen(true)
    })
  }, [])

  React.useEffect(() => {
    activeConfirm.set(confirmFn)
    return () => {
      if (activeConfirm.get() === confirmFn) activeConfirm.set(null)
    }
  }, [confirmFn])

  const options = { ...defaults, ...request?.options }

  return (
    <ConfirmContext.Provider value={confirmFn}>
      {children}
      {request ? (
        <ConfirmDialog
          key={request.key}
          {...options}
          open={open}
          onOpenChange={(next) => {
            setOpen(next)
            if (!next && current.current === request) {
              request.resolve(confirmed.current)
              current.current = null
            }
          }}
          onConfirm={() => {
            const result = options.onConfirm?.()
            if (isPromiseLike(result)) {
              return Promise.resolve(result).then(() => {
                confirmed.current = true
              })
            }
            confirmed.current = true
            return result
          }}
        />
      ) : null}
    </ConfirmContext.Provider>
  )
}

/** Falls back to the browser's `window.confirm` when no `ConfirmProvider` is mounted. */
const fallbackConfirm: ConfirmFunction = async (options) => {
  const opts = typeof options === "string" ? { title: options } : (options ?? {})
  const text = [opts.title, opts.description].filter((part) => typeof part === "string").join("\n\n")
  const ok = typeof window !== "undefined" && window.confirm(text || "Are you sure?")
  if (ok) await opts.onConfirm?.()
  return ok
}

/**
 * Returns `confirm(options)`, which opens a confirmation dialog and resolves
 * with `true` or `false`.
 *
 * ```tsx
 * const confirm = useConfirm()
 * if (await confirm({ title: "Delete Aishath Ali?", variant: "destructive" })) remove()
 * ```
 */
export function useConfirm(): ConfirmFunction {
  return React.useContext(ConfirmContext) ?? confirm
}

/**
 * Opens a confirmation dialog from anywhere (event handlers, stores, router
 * guards). Needs a mounted `ConfirmProvider`; without one it uses `window.confirm`.
 */
export const confirm: ConfirmFunction = (options) => (activeConfirm.get() ?? fallbackConfirm)(options)
