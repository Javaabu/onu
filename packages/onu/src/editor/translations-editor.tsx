"use client"

import * as React from "react"

import { TextInput } from "../components/inputs/text-input"
import { Textarea } from "../components/inputs/textarea"
import { Icon } from "../icons/icon"
import { cn } from "../lib/utils"
import { useTranslation } from "../providers/onu-provider"
import type { ThaanaProp } from "../thaana/use-thaana-field"
import { Button } from "../ui/button"
import { Label } from "../ui/label"
import { Switch } from "../ui/switch"

/** A language column. */
export interface TranslationLocale {
  /** Locale code used as the key in `values`, e.g. `en` or `dv`. */
  code: string
  /** Column heading. Defaults to the built-in name for `en` and `dv`. */
  label?: string
  /** Type this column in Thaana. Default `true` for `dv`. */
  thaana?: boolean
}

/** One translation key and its text in each locale. */
export interface TranslationEntry {
  key: string
  values: Record<string, string | null | undefined>
  /** Context for translators, shown under the key. */
  description?: string
}

/** What `onSave` receives for one edited cell. */
export interface TranslationChange {
  key: string
  locale: string
  value: string
  entry: TranslationEntry
}

type SaveStatus = "saving" | "saved" | "error"

export interface TranslationsEditorProps extends Omit<React.ComponentProps<"div">, "onChange" | "defaultValue"> {
  /** Controlled entries. */
  value?: TranslationEntry[]
  /** Initial entries when uncontrolled. */
  defaultValue?: TranslationEntry[]
  /** Called with all entries whenever a cell changes. */
  onChange?: (entries: TranslationEntry[]) => void
  /** Language columns. Default English and Dhivehi. */
  locales?: TranslationLocale[]
  /**
   * Saves one cell. Called on blur (when `saveOnBlur`), on Ctrl/⌘+Enter and
   * from the cell's Save button. Reject to show an error with Retry.
   */
  onSave?: (change: TranslationChange) => void | Promise<void>
  /** Save a changed cell when it loses focus. Default `true`. */
  saveOnBlur?: boolean
  /** Start with "Missing only" on. */
  defaultMissingOnly?: boolean
  /** Initial search text. */
  defaultSearch?: string
  /** Thaana keyboard options for Thaana columns, or `false` to turn it off. Default `true`. */
  thaana?: ThaanaProp
  readOnly?: boolean
  classNames?: { toolbar?: string; list?: string; row?: string; key?: string; cell?: string }
}

const isMissing = (value: string | null | undefined) => !value || !value.trim()
const cellId = (key: string, locale: string) => `${key}\u0000${locale}`

/**
 * Edit translation keys side by side in English and Dhivehi (or any
 * languages). The Dhivehi column types Thaana. Search, a "missing only"
 * filter, and inline saving per cell. Rows become cards in narrow containers.
 */
export function TranslationsEditor({
  value,
  defaultValue,
  onChange,
  locales: localesProp,
  onSave,
  saveOnBlur = true,
  defaultMissingOnly = false,
  defaultSearch = "",
  thaana = true,
  readOnly = false,
  className,
  classNames,
  ...props
}: TranslationsEditorProps) {
  const { t } = useTranslation()
  const locales = React.useMemo<Required<TranslationLocale>[]>(
    () =>
      (localesProp ?? [{ code: "en" }, { code: "dv" }]).map((l) => ({
        code: l.code,
        label: l.label ?? (l.code === "en" ? t("editor.english") : l.code === "dv" ? t("editor.dhivehi") : l.code),
        thaana: l.thaana ?? l.code === "dv",
      })),
    [localesProp, t],
  )

  const [internal, setInternal] = React.useState<TranslationEntry[]>(() => defaultValue ?? [])
  const entries = value ?? internal
  // Last saved text per cell: drives "dirty" and keeps filtered rows stable while typing.
  const [saved, setSaved] = React.useState<Record<string, string>>(() => baseline(value ?? defaultValue ?? []))
  const [status, setStatus] = React.useState<Record<string, SaveStatus>>({})
  const [search, setSearch] = React.useState(defaultSearch)
  const [missingOnly, setMissingOnly] = React.useState(defaultMissingOnly)
  const [announcement, setAnnouncement] = React.useState("")
  const searchId = React.useId()
  const switchId = React.useId()
  const baseId = React.useId()

  // New keys from a controlled value get a baseline.
  const known = React.useMemo(() => baseline(entries), [entries])
  const savedValue = (key: string, locale: string) => saved[cellId(key, locale)] ?? known[cellId(key, locale)] ?? ""

  const update = (key: string, locale: string, text: string) => {
    const next = entries.map((e) => (e.key === key ? { ...e, values: { ...e.values, [locale]: text } } : e))
    if (value === undefined) setInternal(next)
    onChange?.(next)
    setStatus((s) => {
      const { [cellId(key, locale)]: _drop, ...rest } = s
      return rest
    })
  }

  const save = async (entry: TranslationEntry, locale: string) => {
    const id = cellId(entry.key, locale)
    const text = entry.values[locale] ?? ""
    if (status[id] === "saving") return
    if (text === savedValue(entry.key, locale) && status[id] !== "error") return
    if (!onSave) {
      setSaved((s) => ({ ...s, [id]: text }))
      return
    }
    setStatus((s) => ({ ...s, [id]: "saving" }))
    try {
      await onSave({ key: entry.key, locale, value: text, entry })
      setSaved((s) => ({ ...s, [id]: text }))
      setStatus((s) => ({ ...s, [id]: "saved" }))
      setAnnouncement(`${entry.key}: ${t("common.saved")}`)
    } catch {
      setStatus((s) => ({ ...s, [id]: "error" }))
      setAnnouncement(`${entry.key}: ${t("editor.saveFailed")}`)
    }
  }

  const query = search.trim().toLocaleLowerCase()
  const rows = entries.filter((entry) => {
    if (missingOnly && !locales.some((l) => isMissing(savedValue(entry.key, l.code)))) return false
    if (!query) return true
    return (
      entry.key.toLocaleLowerCase().includes(query) ||
      locales.some((l) => (entry.values[l.code] ?? "").toLocaleLowerCase().includes(query))
    )
  })
  const missingCount = entries.filter((e) => locales.some((l) => isMissing(e.values[l.code]))).length
  const columns = `minmax(10rem, 1fr) repeat(${locales.length}, minmax(0, 2fr))`

  return (
    <div
      data-slot="translations-editor"
      className={cn("gap-3 min-w-0 @container/translations grid w-full", className)}
      {...props}
    >
      <div
        className={cn(
          "gap-x-4 gap-y-2 @2xl/translations:flex-nowrap flex flex-wrap items-center justify-between",
          classNames?.toolbar,
        )}
      >
        <div className="max-w-sm min-w-48 flex-1">
          <label htmlFor={searchId} className="sr-only">
            {t("editor.searchTranslations")}
          </label>
          <TextInput
            id={searchId}
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t("editor.searchTranslations")}
            startAddon={<Icon name="search" />}
          />
        </div>
        <div className="gap-4 text-sm flex items-center text-muted-foreground">
          <span aria-live="polite" className="tabular-nums">
            {t("editor.keyCount", { count: rows.length })} · {t("editor.missingCount", { count: missingCount })}
          </span>
          <div className="gap-2 flex items-center">
            <Switch id={switchId} checked={missingOnly} onCheckedChange={setMissingOnly} />
            <Label htmlFor={switchId} className="text-foreground">
              {t("editor.missingOnly")}
            </Label>
          </div>
        </div>
      </div>

      <div
        role="list"
        aria-label={t("editor.translations")}
        className={cn("overflow-hidden rounded-lg border border-border", classNames?.list)}
      >
        <div
          aria-hidden="true"
          className={cn(
            "gap-4 px-4 py-2 text-xs font-medium hidden border-b border-border bg-muted/50 text-muted-foreground",
            "@2xl/translations:grid",
          )}
          style={{ gridTemplateColumns: columns }}
        >
          <span>{t("editor.translationKey")}</span>
          {locales.map((l) => (
            <span key={l.code}>{l.label}</span>
          ))}
        </div>
        {rows.length === 0 ? (
          <p className="px-4 py-8 text-sm text-center text-muted-foreground">{t("editor.noTranslations")}</p>
        ) : (
          rows.map((entry, index) => {
            const keyId = `${baseId}-key-${index}`
            return (
              <div
                key={entry.key}
                role="listitem"
                aria-labelledby={keyId}
                data-slot="translation-row"
                className={cn(
                  "gap-3 p-4 grid border-b border-border last:border-b-0",
                  "@2xl/translations:grid-cols-(--onu-translation-cols) @2xl/translations:gap-4 @2xl/translations:py-3",
                  classNames?.row,
                )}
                style={{ "--onu-translation-cols": columns } as React.CSSProperties}
              >
                <div className={cn("min-w-0 @2xl/translations:pt-1.5", classNames?.key)}>
                  <code id={keyId} dir="ltr" className="text-sm font-mono break-all text-foreground">
                    {entry.key}
                  </code>
                  {entry.description ? (
                    <p className="mt-1 text-xs text-muted-foreground" dir="auto">
                      {entry.description}
                    </p>
                  ) : null}
                </div>
                {locales.map((locale) => (
                  <TranslationCell
                    key={locale.code}
                    entry={entry}
                    locale={locale}
                    keyId={keyId}
                    thaana={locale.thaana ? thaana : false}
                    readOnly={readOnly}
                    dirty={(entry.values[locale.code] ?? "") !== savedValue(entry.key, locale.code)}
                    status={status[cellId(entry.key, locale.code)]}
                    onChange={(text) => update(entry.key, locale.code, text)}
                    onSave={() => void save(entry, locale.code)}
                    saveOnBlur={saveOnBlur}
                    className={classNames?.cell}
                  />
                ))}
              </div>
            )
          })
        )}
      </div>
      <span className="sr-only" aria-live="polite">
        {announcement}
      </span>
    </div>
  )
}

function baseline(entries: TranslationEntry[]) {
  const out: Record<string, string> = {}
  for (const entry of entries) {
    for (const [locale, text] of Object.entries(entry.values)) out[cellId(entry.key, locale)] = text ?? ""
  }
  return out
}

function TranslationCell({
  entry,
  locale,
  keyId,
  thaana,
  readOnly,
  dirty,
  status,
  onChange,
  onSave,
  saveOnBlur,
  className,
}: {
  entry: TranslationEntry
  locale: Required<TranslationLocale>
  keyId: string
  thaana: ThaanaProp
  readOnly: boolean
  dirty: boolean
  status?: SaveStatus
  onChange: (text: string) => void
  onSave: () => void
  saveOnBlur: boolean
  className?: string
}) {
  const { t } = useTranslation()
  const id = React.useId()
  const text = entry.values[locale.code] ?? ""
  const missing = isMissing(text)

  return (
    <div className={cn("min-w-0 gap-1.5 grid content-start", className)} data-missing={missing || undefined}>
      <div className="gap-2 @2xl/translations:hidden flex items-center justify-between">
        <Label htmlFor={id} className="text-xs text-muted-foreground">
          {locale.label}
        </Label>
      </div>
      <Textarea
        id={id}
        rows={1}
        value={text}
        readOnly={readOnly}
        aria-label={t("editor.translationFor", { key: entry.key, language: locale.label })}
        aria-describedby={keyId}
        aria-invalid={status === "error" || undefined}
        thaana={thaana || undefined}
        // A Thaana field sets its own dir/lang (R13.4).
        {...(thaana ? {} : { dir: "auto", lang: locale.code })}
        className={cn("min-h-9 resize-none", missing && "border-warning/60 bg-warning/5")}
        onChange={(event) => onChange(event.target.value)}
        onBlur={() => {
          if (saveOnBlur && dirty) onSave()
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
            event.preventDefault()
            onSave()
          }
        }}
      />
      <div className="gap-2 text-xs min-h-5 flex flex-wrap items-center empty:hidden">
        {missing ? (
          <span className="gap-1 font-medium inline-flex items-center text-warning-foreground dark:text-warning">
            <Icon name="warning" className="size-3.5" />
            {t("editor.missing")}
          </span>
        ) : null}
        {status === "saving" ? (
          <span className="gap-1 inline-flex items-center text-muted-foreground">
            <Icon name="loading" className="size-3.5 animate-spin motion-reduce:animate-none" />
            {t("common.saving")}
          </span>
        ) : null}
        {status === "saved" && !dirty ? (
          <span className="gap-1 inline-flex items-center text-success-foreground dark:text-success">
            <Icon name="check" className="size-3.5" />
            {t("common.saved")}
          </span>
        ) : null}
        {status === "error" ? (
          <span className="gap-1 inline-flex items-center text-destructive">
            <Icon name="error" className="size-3.5" />
            {t("editor.saveFailed")}
            <Button type="button" variant="link" size="xs" className="px-1 h-auto" onClick={onSave}>
              {t("common.retry")}
            </Button>
          </span>
        ) : null}
        {dirty && status !== "saving" && status !== "error" && !readOnly ? (
          <Button type="button" variant="outline" size="xs" className="touch:h-11 ms-auto" onClick={onSave}>
            {t("editor.saveTranslation")}
          </Button>
        ) : null}
      </div>
    </div>
  )
}
