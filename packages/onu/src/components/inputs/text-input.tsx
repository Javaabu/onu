"use client"

import * as React from "react"

import { cn } from "../../lib/utils"
import { useThaanaField, type ThaanaProp } from "../../thaana/use-thaana-field"
import { Input } from "../../ui/input"
import { InputGroup, InputGroupAddon, InputGroupInput } from "../../ui/input-group"
import { useFormFieldControl } from "../form/form-field"
import { ThaanaToggle } from "./thaana-toggle"

export interface TextInputProps extends Omit<React.ComponentProps<"input">, "size"> {
  /** Type Thaana from a Latin keyboard (R13.3). `true` or keyboard options. */
  thaana?: ThaanaProp
  /** Show a Thaana/Latin toggle button when `thaana` is on (R13.5). */
  thaanaToggle?: boolean
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

/**
 * Single-line text input with optional addons and Thaana keyboard support.
 * Inside a `FormField` it wires id, name and ARIA automatically.
 */
export function TextInput({
  thaana,
  thaanaToggle = false,
  startAddon,
  endAddon,
  className,
  classNames,
  ref,
  ...props
}: TextInputProps) {
  const local = React.useRef<HTMLInputElement>(null)
  const merged = useMergedRef(local, ref)
  const { fieldProps, active, enabled, toggle } = useThaanaField(local, thaana)
  const controlProps = useFormFieldControl(props)
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
