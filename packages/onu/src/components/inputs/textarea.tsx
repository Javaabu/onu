"use client"

import * as React from "react"

import { cn } from "../../lib/utils"
import { useThaanaField, type ThaanaProp } from "../../thaana/use-thaana-field"
import { Textarea as BaseTextarea } from "../../ui/textarea"
import { useFormFieldControl } from "../form/form-field"
import { ThaanaToggle } from "./thaana-toggle"
import { useMergedRef } from "./text-input"

export interface TextareaProps extends React.ComponentProps<"textarea"> {
  thaana?: ThaanaProp
  thaanaToggle?: boolean
  /** Grow with the content (CSS `field-sizing: content` where supported). Default `true`. */
  autoResize?: boolean
  /** Show a character counter; uses `maxLength` when set. */
  showCount?: boolean
  classNames?: { root?: string; textarea?: string; footer?: string }
}

/** Multi-line text input with Thaana support, auto-resize and an optional counter. */
export function Textarea({
  thaana,
  thaanaToggle = false,
  autoResize = true,
  showCount = false,
  className,
  classNames,
  ref,
  onChange,
  ...props
}: TextareaProps) {
  const local = React.useRef<HTMLTextAreaElement>(null)
  const merged = useMergedRef(local, ref)
  const { fieldProps, active, enabled, toggle } = useThaanaField(local, thaana)
  const controlProps = useFormFieldControl(props)
  const [typed, setTyped] = React.useState(() => String(props.defaultValue ?? "").length)
  const count = props.value !== undefined ? String(props.value).length : typed

  const textarea = (
    <BaseTextarea
      ref={merged}
      className={cn(
        !autoResize && "[field-sizing:fixed]",
        classNames?.textarea,
        !showCount && !thaanaToggle && className,
      )}
      onChange={(e) => {
        setTyped(e.target.value.length)
        onChange?.(e)
      }}
      {...fieldProps}
      {...controlProps}
    />
  )

  const showToggle = active && thaanaToggle
  if (!showCount && !showToggle) return textarea

  return (
    <div data-slot="textarea-wrapper" className={cn("gap-1 grid", classNames?.root, className)}>
      {textarea}
      <div className={cn("gap-2 text-xs flex items-center justify-between text-muted-foreground", classNames?.footer)}>
        {showToggle ? <ThaanaToggle enabled={enabled} onToggle={toggle} /> : <span />}
        {showCount ? (
          <span data-numeric dir="ltr" aria-live="polite" className="tabular-nums">
            {props.maxLength ? `${count} / ${props.maxLength}` : count}
          </span>
        ) : null}
      </div>
    </div>
  )
}
