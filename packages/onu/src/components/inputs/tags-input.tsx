"use client"

import * as React from "react"

import { LiveRegion } from "../../a11y/live-region"
import { Icon } from "../../icons/icon"
import { cn } from "../../lib/utils"
import { useTranslation } from "../../providers/onu-provider"
import { useThaanaField, type ThaanaProp } from "../../thaana/use-thaana-field"
import { Badge } from "../../ui/badge"
import { useFormFieldControl } from "../form/form-field"
import { useControllableState } from "./_shared"
import {
  SuggestionList,
  suggestionsShown,
  useComboboxState,
  useSuggestions,
  type SuggestionSource,
} from "./_suggestions"
import { ThaanaToggle } from "./thaana-toggle"
import { useMergedRef } from "./text-input"
import { registerEnglish } from "../../i18n/english"
import { input as en_input } from "../../locales/en/input"

registerEnglish({ input: en_input })

export interface TagsInputProps extends Omit<
  React.ComponentProps<"input">,
  "value" | "defaultValue" | "onChange" | "size" | "max"
> {
  value?: string[]
  defaultValue?: string[]
  onValueChange?: (tags: string[]) => void
  /** Static suggestions, or `async (query, { signal }) => options`. */
  suggestions?: SuggestionSource
  /** Maximum number of tags. */
  max?: number
  /** Allow the same tag twice. Default `false`. */
  allowDuplicates?: boolean
  /** Keys / characters that add the typed tag. Default `[",", "Enter"]` (the Thaana comma `،` too). */
  delimiters?: string[]
  /** Normalise or reject a tag; return `null` to reject. Default: trims whitespace. */
  transform?: (tag: string) => string | null
  /** Type Thaana from a Latin keyboard (R13.3). */
  thaana?: ThaanaProp
  thaanaToggle?: boolean
  /** Debounce for async suggestions, in ms. */
  debounce?: number
  classNames?: { root?: string; tag?: string; input?: string; list?: string; option?: string }
}

const DEFAULT_DELIMITERS = [",", "Enter"]

/**
 * Chips input: Enter or comma adds a tag, Backspace in an empty field removes
 * the last one, pasting a comma or newline separated list adds them all.
 * Suggestions, a maximum and Thaana typing are supported.
 */
export function TagsInput({
  value: valueProp,
  defaultValue = [],
  onValueChange,
  suggestions,
  max,
  allowDuplicates = false,
  delimiters = DEFAULT_DELIMITERS,
  transform = (tag) => tag.trim() || null,
  thaana,
  thaanaToggle = false,
  debounce,
  placeholder,
  className,
  classNames,
  disabled: disabledProp,
  readOnly,
  onKeyDown,
  onPaste,
  onBlur,
  ref,
  ...props
}: TagsInputProps) {
  const { t } = useTranslation()
  const local = React.useRef<HTMLInputElement>(null)
  const anchorRef = React.useRef<HTMLDivElement>(null)
  const merged = useMergedRef(local, ref)
  const [tags, setTags] = useControllableState(valueProp, defaultValue, onValueChange)
  const [text, setText] = React.useState("")
  const [announce, setAnnounce] = React.useState<string | null>(null)
  const { fieldProps, active: thaanaActive, enabled: thaanaOn, toggle } = useThaanaField(local, thaana)
  const { name, ...control } = useFormFieldControl({ ...props, disabled: disabledProp })
  const disabled = !!control.disabled
  const full = max !== undefined && tags.length >= max
  const [listOpen, setListOpen] = React.useState(false)

  const { items, loading, error, retry } = useSuggestions({
    source: suggestions,
    query: text,
    enabled: listOpen && !full,
    debounce,
    minChars: typeof suggestions === "function" ? 1 : 0,
    exclude: allowDuplicates ? undefined : tags,
  })

  const add = (raw: string[]) => {
    const next = [...tags]
    const added: string[] = []
    for (const r of raw) {
      const tag = transform(r)
      if (!tag) continue
      if (max !== undefined && next.length >= max) break
      if (!allowDuplicates && next.includes(tag)) continue
      next.push(tag)
      added.push(tag)
    }
    if (added.length) {
      setTags(next)
      setAnnounce(t("input.tagAdded", { tag: added.join(", ") }))
    }
    return added.length > 0
  }

  const remove = (index: number) => {
    const tag = tags[index]
    if (tag === undefined) return
    setTags(tags.filter((_, i) => i !== index))
    setAnnounce(t("input.tagRemoved", { tag }))
    local.current?.focus()
  }

  const combobox = useComboboxState(items.length)
  const pick = (index: number) => {
    const option = items[index]
    if (!option) return
    add([option.value])
    setText("")
    combobox.setActive(-1)
  }
  if (listOpen !== combobox.open) setListOpen(combobox.open)

  const splitter = React.useMemo(() => {
    const chars = delimiters.filter((d) => d.length === 1).concat(delimiters.includes(",") ? ["،"] : [])
    const escaped = chars.map((c) => c.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("")
    return new RegExp(`[${escaped}\\n\\r\\t]+`)
  }, [delimiters])

  return (
    <SuggestionList
      anchorRef={anchorRef}
      anchor={
        <div
          ref={anchorRef}
          data-slot="tags-input"
          data-disabled={disabled || undefined}
          data-invalid={control["aria-invalid"] || undefined}
          onPointerDown={(e) => {
            if (e.target === e.currentTarget) {
              e.preventDefault()
              local.current?.focus()
            }
          }}
          className={cn(
            "min-h-8 gap-1 px-1.5 py-1 text-sm flex w-full flex-wrap items-center rounded-lg border border-input bg-card transition-colors hover:border-primary-5",
            "focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20",
            "data-invalid:border-destructive data-invalid:ring-3 data-invalid:ring-destructive/20 dark:data-invalid:ring-destructive/40",
            "data-disabled:cursor-not-allowed data-disabled:bg-input/50 data-disabled:opacity-50",
            "touch:min-h-11",
            classNames?.root,
            className,
          )}
        >
          <ul className="contents">
            {tags.map((tag, i) => (
              <li key={`${i}-${tag}`} className="contents">
                <Badge
                  variant="secondary"
                  data-slot="tag"
                  dir="auto"
                  className={cn("h-6 gap-0.5 pe-0.5 text-sm font-normal max-w-full", classNames?.tag)}
                >
                  <span className="truncate">{tag}</span>
                  {!disabled && !readOnly ? (
                    <button
                      type="button"
                      tabIndex={-1}
                      aria-label={t("input.removeTag", { tag })}
                      onClick={() => remove(i)}
                      className="size-5 touch:size-8 inline-flex items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
                    >
                      <Icon name="close" className="size-3" />
                    </button>
                  ) : null}
                </Badge>
              </li>
            ))}
          </ul>
          <input
            ref={merged}
            type="text"
            autoComplete="off"
            enterKeyHint="enter"
            {...control}
            {...combobox.inputProps(combobox.open && !full && suggestionsShown(items.length, loading, error))}
            {...fieldProps}
            disabled={disabled}
            readOnly={readOnly}
            placeholder={tags.length ? undefined : placeholder}
            aria-describedby={
              [control["aria-describedby"], full ? `${combobox.listId}-max` : null].filter(Boolean).join(" ") ||
              undefined
            }
            value={text}
            onChange={(e) => {
              const v = e.target.value
              if (splitter.test(v)) {
                const parts = v.split(splitter)
                const rest = parts.pop() ?? ""
                add(parts)
                setText(rest)
              } else setText(v)
              if (!full) combobox.setOpen(true)
              combobox.setActive(-1)
            }}
            onKeyDown={(e) => {
              onKeyDown?.(e)
              if (e.defaultPrevented || e.nativeEvent.isComposing) return
              if (combobox.onKeyDown(e, pick)) return
              if (delimiters.includes(e.key) || (e.key === "," && delimiters.includes(","))) {
                if (text.trim()) {
                  e.preventDefault()
                  if (add([text])) setText("")
                } else if (e.key !== "Enter") e.preventDefault()
                return
              }
              if (e.key === "Backspace" && !text && tags.length && !readOnly) {
                e.preventDefault()
                remove(tags.length - 1)
              }
            }}
            onPaste={(e) => {
              onPaste?.(e)
              const pasted = e.clipboardData.getData("text")
              if (!e.defaultPrevented && splitter.test(pasted)) {
                e.preventDefault()
                add(pasted.split(splitter))
              }
            }}
            onBlur={(e) => {
              combobox.setOpen(false)
              onBlur?.(e)
            }}
            className={cn(
              "h-6 min-w-20 px-1 flex-1 bg-transparent outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed",
              classNames?.input,
            )}
          />
          {thaanaActive && thaanaToggle ? <ThaanaToggle enabled={thaanaOn} onToggle={toggle} /> : null}
          {name
            ? tags.map((tag, i) => <input key={`${i}-${tag}`} type="hidden" name={`${name}[]`} value={tag} />)
            : null}
          {full ? (
            <span id={`${combobox.listId}-max`} className="sr-only">
              {t("input.tagLimit", { count: max })}
            </span>
          ) : null}
          <LiveRegion>{announce}</LiveRegion>
        </div>
      }
      open={combobox.open && !full}
      onOpenChange={combobox.setOpen}
      items={items}
      loading={loading}
      error={error}
      onRetry={retry}
      active={combobox.active}
      onActiveChange={combobox.setActive}
      onPick={pick}
      listId={combobox.listId}
      optionId={combobox.optionId}
      dir={thaanaOn ? "rtl" : undefined}
      lang={thaanaOn ? "dv" : undefined}
      classNames={{ list: classNames?.list, option: classNames?.option }}
    />
  )
}
