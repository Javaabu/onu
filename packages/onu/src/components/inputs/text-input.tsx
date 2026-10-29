"use client"

import * as React from "react"

import { cn } from "../../lib/utils"
import { useThaanaField, type ThaanaProp } from "../../thaana/use-thaana-field"
import { Input } from "../../ui/input"
import { InputGroup, InputGroupAddon, InputGroupInput } from "../../ui/input-group"
import { useFormFieldControl } from "../form/form-field"
import { ThaanaToggle } from "./thaana-toggle"

export interface TextInputProps extends Omit<React.ComponentProps<"input">, "size"> {
  /** Type Thaana from a Latin keyboard (R13.3). `true` or keyboard options. Ignored for `type="email"` and `type="url"`. */
  thaana?: ThaanaProp
  /** Show a Thaana/Latin toggle button when `thaana` is on (R13.5). */
  thaanaToggle?: boolean
  /**
   * `type="url"`: added on blur when the URL has no scheme (`example.mv` →
   * `https://example.mv`). `false` keeps the value as typed. Default `"https://"`.
   */
  urlProtocol?: string | false
  /** Content before the input (icon, text, button). Rendered at the inline start. */
  startAddon?: React.ReactNode
  /** Content after the input. Rendered at the inline end. */
  endAddon?: React.ReactNode
  classNames?: { root?: string; input?: string; startAddon?: string; endAddon?: string }
}

function setRef<T>(ref: React.Ref<T> | undefined, node: T | null) {
  if (typeof ref === "function") ref(node)
  else if (ref) (ref as React.RefObject<T | null>).current = node
}

/** Merges a forwarded ref with a local one. */
export function useMergedRef<T>(a: React.Ref<T> | undefined, b?: React.Ref<T>) {
  return React.useCallback(
    (node: T | null) => {
      setRef(a, node)
      setRef(b, node)
    },
    [a, b],
  )
}

/** The props `TextInput` passes on to the `<input>`. */
type InputProps = Omit<
  TextInputProps,
  "thaana" | "thaanaToggle" | "urlProtocol" | "startAddon" | "endAddon" | "className" | "classNames" | "ref"
>

const HAS_SCHEME = /^[a-z][a-z\d+.-]*:/i

/** Adds `protocol` to a URL that has no scheme (`example.mv` → `https://example.mv`). */
export function normalizeUrl(value: string, protocol = "https://"): string {
  const trimmed = value.trim()
  if (!trimmed || HAS_SCHEME.test(trimmed)) return trimmed
  return protocol + trimmed.replace(/^\/\//, "")
}

/**
 * Sets the value the way typing does (a native input event), so `onChange`,
 * controlled state and react-hook-form see it. Same as `setNativeValue` in
 * `_shared`, which TextInput doesn't import to keep its bundle small.
 */
function typeValue(el: HTMLInputElement, value: string) {
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set?.call(el, value)
  el.dispatchEvent(new Event("input", { bubbles: true }))
}

/**
 * Email and URL fields: the matching keyboard on phones, autofill, no
 * autocorrect, and always left-to-right, even on a Dhivehi page (R11.7).
 * A URL without a scheme gets `urlProtocol` on blur.
 */
function latinProps(props: InputProps, urlProtocol: string | false): InputProps {
  const type = props.type as "email" | "url"
  const { onBlur } = props
  return {
    ...props,
    inputMode: props.inputMode ?? type,
    autoComplete: props.autoComplete ?? type,
    autoCapitalize: props.autoCapitalize ?? "none",
    autoCorrect: props.autoCorrect ?? "off",
    spellCheck: props.spellCheck ?? false,
    onBlur:
      type === "url" && urlProtocol !== false
        ? (e: React.FocusEvent<HTMLInputElement>) => {
            const next = normalizeUrl(e.currentTarget.value, urlProtocol)
            if (next !== e.currentTarget.value) typeValue(e.currentTarget, next)
            onBlur?.(e)
          }
        : onBlur,
    dir: "ltr",
  }
}

/**
 * Single-line text input with optional addons and Thaana keyboard support.
 * Inside a `FormField` it wires id, name and ARIA automatically. With
 * `type="email"` or `type="url"` it is always Latin and left-to-right.
 */
export function TextInput({
  thaana,
  thaanaToggle = false,
  urlProtocol = "https://",
  startAddon,
  endAddon,
  className,
  classNames,
  ref,
  ...props
}: TextInputProps) {
  const local = React.useRef<HTMLInputElement>(null)
  const merged = useMergedRef(local, ref)
  const latin = props.type === "email" || props.type === "url"
  const { fieldProps, active, enabled, toggle } = useThaanaField(local, latin ? undefined : thaana)
  const controlProps = useFormFieldControl(latin ? latinProps(props, urlProtocol) : props)
  const showToggle = active && thaanaToggle
  const end =
    showToggle || endAddon ? (
      <>
        {endAddon}
        {showToggle ? <ThaanaToggle enabled={enabled} onToggle={toggle} /> : null}
      </>
    ) : null

  if (!startAddon && !end) {
    return (
      <Input
        ref={merged}
        data-slot="input"
        className={cn(classNames?.input, className)}
        {...fieldProps}
        {...controlProps}
      />
    )
  }

  return (
    <InputGroup className={cn(classNames?.root, className)} data-disabled={controlProps.disabled || undefined}>
      {startAddon ? (
        <InputGroupAddon align="inline-start" className={classNames?.startAddon}>
          {startAddon}
        </InputGroupAddon>
      ) : null}
      <InputGroupInput ref={merged} className={classNames?.input} {...fieldProps} {...controlProps} />
      {end ? (
        <InputGroupAddon align="inline-end" className={classNames?.endAddon}>
          {end}
        </InputGroupAddon>
      ) : null}
    </InputGroup>
  )
}
