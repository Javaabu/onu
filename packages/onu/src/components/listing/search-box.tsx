"use client"

import * as React from "react"

import { Icon } from "../../icons/icon"
import { cn } from "../../lib/utils"
import { useTranslation } from "../../providers/onu-provider"
import { useThaanaField, type ThaanaProp } from "../../thaana/use-thaana-field"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "../../ui/input-group"
import { useFormFieldControl } from "../form/form-field"
import { useMergedRef } from "../inputs/text-input"

export interface SearchBoxProps extends Omit<
  React.ComponentProps<"input">,
  "value" | "defaultValue" | "onChange" | "size" | "type"
> {
  /** The applied search. The box shows it and resets to it when it changes. */
  value?: string
  defaultValue?: string
  /**
   * Called when the user submits: Enter, or leaving the box after changing the
   * text (§25.6). Typing alone does nothing. An empty string means "show everything".
   */
  onSearch?: (value: string) => void
  /** Called on every keystroke with the draft text. */
  onValueChange?: (value: string) => void
  /** Submit when the box loses focus after a change. Default `true`. */
  submitOnBlur?: boolean
  /** Show a ✕ button that clears the box and submits. Default `true`. */
  clearable?: boolean
  /** Type Thaana from a Latin keyboard (R13.3). */
  thaana?: ThaanaProp
  /** Wrap the box in a `<form role="search">` landmark. Default `true`. */
  landmark?: boolean
  classNames?: { root?: string; input?: string; icon?: string; clear?: string }
}

/**
 * The search box of an index page. The list only updates when the user presses
 * Enter or leaves the box after changing the text, so every keystroke does not
 * trigger a request (§25.6).
 */
export function SearchBox({
  value,
  defaultValue = "",
  onSearch,
  onValueChange,
  submitOnBlur = true,
  clearable = true,
  thaana,
  landmark = true,
  placeholder,
  className,
  classNames,
  ref,
  onKeyDown,
  onBlur,
  ...props
}: SearchBoxProps) {
  const { t } = useTranslation()
  const local = React.useRef<HTMLInputElement>(null)
  const merged = useMergedRef(local, ref)
  const { fieldProps } = useThaanaField(local, thaana)
  const controlProps = useFormFieldControl(props)

  const [applied, setApplied] = React.useState(value ?? defaultValue)
  const [draft, setDraft] = React.useState(value ?? defaultValue)
  const [prevValue, setPrevValue] = React.useState(value)
  if (value !== undefined && value !== prevValue) {
    setPrevValue(value)
    setApplied(value)
    setDraft(value)
  }

  const submit = (text: string) => {
    const next = text.trim()
    setApplied(next)
    onSearch?.(next)
  }

  const change = (text: string) => {
    setDraft(text)
    onValueChange?.(text)
  }

  const box = (
    <InputGroup
      className={cn("w-full", !landmark && "sm:max-w-xs", classNames?.root, !landmark && className)}
      data-slot="search-box"
    >
      <InputGroupAddon align="inline-start" className={classNames?.icon}>
        <Icon name="search" />
      </InputGroupAddon>
      <InputGroupInput
        ref={merged}
        type="search"
        enterKeyHint="search"
        autoComplete="off"
        aria-label={props["aria-label"] ?? (props["aria-labelledby"] ? undefined : t("listing.search"))}
        placeholder={placeholder ?? t("listing.searchPlaceholder")}
        value={draft}
        className={cn("[&::-webkit-search-cancel-button]:appearance-none", classNames?.input)}
        {...fieldProps}
        {...controlProps}
        onChange={(e) => change(e.target.value)}
        onKeyDown={(e) => {
          onKeyDown?.(e)
          if (e.defaultPrevented) return
          if (e.key === "Enter") {
            e.preventDefault()
            submit(draft)
          } else if (e.key === "Escape" && draft !== applied) {
            e.preventDefault()
            change(applied)
          }
        }}
        onBlur={(e) => {
          onBlur?.(e)
          if (submitOnBlur && draft.trim() !== applied) submit(draft)
        }}
      />
      {clearable && draft ? (
        <InputGroupAddon align="inline-end" className={classNames?.clear}>
          <InputGroupButton
            size="icon-xs"
            aria-label={t("listing.clearSearchInput")}
            className="touch:size-11"
            onClick={() => {
              change("")
              if (applied !== "") submit("")
              local.current?.focus()
            }}
          >
            <Icon name="close" />
          </InputGroupButton>
        </InputGroupAddon>
      ) : null}
    </InputGroup>
  )

  if (!landmark) return box
  return (
    <form
      role="search"
      data-slot="search-box-form"
      className={cn("sm:max-w-xs w-full", className)}
      onSubmit={(e) => {
        e.preventDefault()
        submit(draft)
      }}
    >
      {box}
    </form>
  )
}
