"use client"

import * as React from "react"

import { useOnu, type LabelLayout } from "../../providers/onu-provider"

/** Field errors keyed by field name, using Laravel's dot notation (`items.0.name`). */
export type FormErrors = Record<string, string[] | string | undefined>

interface FormLayoutContextValue {
  labelLayout?: LabelLayout
  disabled?: boolean
}

const FormLayoutContext = React.createContext<FormLayoutContextValue>({})
const FormErrorsContext = React.createContext<FormErrors | null>(null)

export interface FormLayoutProviderProps extends FormLayoutContextValue {
  children?: React.ReactNode
}

/** Sets the label layout (and disabled state) for every field inside (R3.32). Nested providers win. */
export function FormLayoutProvider({ children, labelLayout, disabled }: FormLayoutProviderProps) {
  const parent = React.useContext(FormLayoutContext)
  const value = React.useMemo(
    () => ({ labelLayout: labelLayout ?? parent.labelLayout, disabled: disabled ?? parent.disabled }),
    [labelLayout, disabled, parent.labelLayout, parent.disabled],
  )
  return <FormLayoutContext.Provider value={value}>{children}</FormLayoutContext.Provider>
}

/** Effective label layout: explicit prop → nearest form/fieldset → OnuProvider default. */
export function useLabelLayout(explicit?: LabelLayout): LabelLayout {
  const { labelLayout } = React.useContext(FormLayoutContext)
  const { labelLayout: global } = useOnu()
  return explicit ?? labelLayout ?? global
}

export function useFormDisabled() {
  return React.useContext(FormLayoutContext).disabled ?? false
}

/** Provides server-side errors (e.g. a Laravel 422 response) to every field by name. */
export function FormErrorsProvider({ errors, children }: { errors?: FormErrors | null; children?: React.ReactNode }) {
  return <FormErrorsContext.Provider value={errors ?? null}>{children}</FormErrorsContext.Provider>
}

/** Errors for one field name from the nearest FormErrorsProvider. */
export function useFieldErrors(name?: string): string[] {
  const errors = React.useContext(FormErrorsContext)
  if (!name || !errors) return []
  return toArray(errors[name] ?? errors[toDotNotation(name)])
}

export function toArray(value: string[] | string | null | undefined): string[] {
  if (!value) return []
  return Array.isArray(value) ? value.filter(Boolean) : [value]
}

/** `items[0][name]` → `items.0.name`, the key format Laravel uses for errors. */
export function toDotNotation(name: string): string {
  return name.replace(/\[(\w*)\]/g, ".$1").replace(/\.$/, "")
}
