"use client"

import * as React from "react"
import slugify from "@sindresorhus/slugify"

import { Icon } from "../../icons/icon"
import { cn } from "../../lib/utils"
import { useTranslation } from "../../providers/onu-provider"
import { InputGroupButton } from "../../ui/input-group"
import { LiveMessage, useControllableState } from "./_shared"
import { thaanaToLatin } from "./_thaana-latin"
import { TextInput, useMergedRef, type TextInputProps } from "./text-input"

export { thaanaToLatin }

export interface ToSlugOptions {
  separator?: string
  /** Keep a trailing separator, for normalising while the user types. */
  preserveTrailing?: boolean
}

/**
 * Turns any text into a URL slug. Thaana is transliterated to Latin first
 * (`މާލެ ސިޓީ` → `maale-sitee`), then `@sindresorhus/slugify` handles accents,
 * symbols and spacing.
 */
export function toSlug(text: string, { separator = "-", preserveTrailing = false }: ToSlugOptions = {}): string {
  return slugify(thaanaToLatin(text), { separator, preserveTrailingDash: preserveTrailing && separator === "-" })
}

export interface SlugInputProps extends Omit<
  TextInputProps,
  "thaana" | "thaanaToggle" | "value" | "defaultValue" | "prefix"
> {
  /** Text the slug is generated from, usually the title field's value. */
  source?: string
  /** Controlled slug. */
  value?: string
  defaultValue?: string
  onValueChange?: (slug: string) => void
  /**
   * Generate the slug from `source` (locked) or let the user edit it. Defaults
   * to automatic when there is no initial value, and manual when editing an
   * existing record so its URL does not change by accident.
   */
  auto?: boolean
  defaultAuto?: boolean
  onAutoChange?: (auto: boolean) => void
  /** URL shown before the slug in the preview, e.g. `https://example.mv/news/`. */
  prefix?: string
  /** Word separator. Default `"-"`. */
  separator?: string
  /** Custom slug function. Defaults to `toSlug`. */
  slugify?: (text: string) => string
  classNames?: TextInputProps["classNames"] & { wrapper?: string; toggle?: string; preview?: string }
}

/**
 * Slug generator: follows a source value (e.g. the title) while locked, can be
 * unlocked to edit by hand, and shows a URL preview. Works with Thaana titles.
 */
export function SlugInput({
  source = "",
  value: valueProp,
  defaultValue,
  onValueChange,
  auto: autoProp,
  defaultAuto,
  onAutoChange,
  prefix,
  separator = "-",
  slugify: slugifyProp,
  className,
  classNames,
  onChange,
  onBlur,
  endAddon,
  ref,
  ...props
}: SlugInputProps) {
  const { t } = useTranslation()
  const local = React.useRef<HTMLInputElement>(null)
  const merged = useMergedRef(local, ref)
  const previewId = React.useId()
  const make = React.useCallback(
    (text: string, typing = false) =>
      slugifyProp ? slugifyProp(text) : toSlug(text, { separator, preserveTrailing: typing }),
    [slugifyProp, separator],
  )
  const initial = valueProp ?? defaultValue
  const [auto, setAuto] = useControllableState(autoProp, defaultAuto ?? !initial, onAutoChange)
  const [slug, setSlug] = useControllableState(valueProp, defaultValue ?? (auto ? make(source) : ""), onValueChange)
  const [announce, setAnnounce] = React.useState<string | null>(null)

  const generated = make(source)
  React.useEffect(() => {
    if (auto && generated !== slug) setSlug(generated)
  }, [auto, generated, slug, setSlug])

  const toggle = () => {
    const next = !auto
    setAuto(next)
    setAnnounce(next ? t("input.slugAutoOn") : t("input.slugAutoOff"))
    if (next) setSlug(generated)
    else local.current?.focus()
  }

  return (
    <div data-slot="slug-input" className={cn("gap-1.5 grid", classNames?.wrapper, className)}>
      <TextInput
        ref={merged}
        value={slug}
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        classNames={classNames}
        className={classNames?.root}
        aria-describedby={[props["aria-describedby"], prefix ? previewId : null].filter(Boolean).join(" ") || undefined}
        onChange={(e) => {
          if (auto) {
            setAuto(false)
            setAnnounce(t("input.slugAutoOff"))
          }
          setSlug(make(e.target.value, true))
          onChange?.(e)
        }}
        onBlur={(e) => {
          const clean = make(slug)
          if (clean !== slug) setSlug(clean)
          onBlur?.(e)
        }}
        endAddon={
          <>
            {endAddon}
            <InputGroupButton
              size="icon-xs"
              data-slot="slug-toggle"
              aria-label={t("input.slugAuto")}
              aria-pressed={auto}
              title={t("input.slugAuto")}
              disabled={props.disabled || props.readOnly}
              onClick={toggle}
              className={cn("touch:size-11", classNames?.toggle)}
            >
              <Icon name={auto ? "lock" : "unlock"} />
            </InputGroupButton>
          </>
        }
        {...props}
        data-auto={auto || undefined}
        dir="ltr"
      />
      {prefix ? (
        <p
          id={previewId}
          dir="ltr"
          data-slot="slug-preview"
          className={cn("text-xs min-w-0 truncate text-start text-muted-foreground", classNames?.preview)}
        >
          <span className="sr-only">{t("input.slugPreview")}: </span>
          {prefix}
          <span className="font-medium text-foreground">{slug}</span>
        </p>
      ) : null}
      <LiveMessage>{announce}</LiveMessage>
    </div>
  )
}
