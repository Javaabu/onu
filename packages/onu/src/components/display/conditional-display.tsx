"use client"

import * as React from "react"
import { useWatch, type Control, type FieldPath, type FieldValues } from "react-hook-form"

import { cn } from "../../lib/utils"

/** What happens to the children when the condition matches. */
export type ConditionalAction = "show" | "hide" | "enable" | "disable"

/** A value to compare with, a list of allowed values, or a predicate. */
export type ConditionalMatcher =
  string | number | boolean | null | ReadonlyArray<unknown> | ((value: unknown) => boolean)

function isEmpty(value: unknown) {
  return (
    value === undefined ||
    value === null ||
    value === "" ||
    value === false ||
    value === 0 ||
    value === "0" ||
    (Array.isArray(value) && value.length === 0)
  )
}

/**
 * Whether a field value matches. Values are compared as strings (form values
 * are strings, so `1` matches `"1"`). Array values (checkbox groups,
 * multi-selects) match when any item matches. With no matcher, any non-empty
 * value matches.
 */
export function matchesCondition(value: unknown, when?: ConditionalMatcher): boolean {
  if (typeof when === "function") return when(value)
  if (when === undefined) return !isEmpty(value)
  const accepted = (Array.isArray(when) ? when : [when]).map((v) => String(v))
  const values = Array.isArray(value) ? value : [value]
  return values.some((v) => accepted.includes(String(v)))
}

/** Resolves `{ visible, enabled }` for an action and a match result. */
export function resolveConditional(action: ConditionalAction, matched: boolean) {
  switch (action) {
    case "show":
      return { visible: matched, enabled: matched }
    case "hide":
      return { visible: !matched, enabled: !matched }
    case "enable":
      return { visible: true, enabled: matched }
    case "disable":
      return { visible: true, enabled: !matched }
  }
}

interface BaseProps extends Omit<React.ComponentProps<"fieldset">, "disabled"> {
  /** Value to match against. Default: any non-empty value. */
  when?: ConditionalMatcher
  /** Inverts the match (`when` becomes "when not"). */
  not?: boolean
  /** Default `show`: shown (and enabled) only when the condition matches. */
  action?: ConditionalAction
  /**
   * Unmount hidden children instead of hiding them. By default hidden children
   * stay mounted (keeping their state) but are `disabled`, so they don't submit.
   */
  unmount?: boolean
}

export interface ConditionalDisplayProps<T extends FieldValues = FieldValues> extends BaseProps {
  /** The value of the field this depends on (e.g. from `watch("type")` or state). */
  value?: unknown
  /** react-hook-form `control`; with `name`, the value is watched for you. */
  control?: Control<T>
  /** Name of the react-hook-form field to watch (needs `control` or a `FormProvider`). */
  name?: FieldPath<T>
}

function Display({
  value,
  when,
  not = false,
  action = "show",
  unmount = false,
  className,
  children,
  ...props
}: BaseProps & { value: unknown }) {
  const matched = matchesCondition(value, when) !== not
  const { visible, enabled } = resolveConditional(action, matched)
  if (!visible && unmount) return null
  return (
    <fieldset
      data-slot="conditional-display"
      data-state={visible ? (enabled ? "enabled" : "disabled") : "hidden"}
      hidden={!visible}
      disabled={!enabled}
      className={cn(visible ? "contents" : "hidden", className)}
      {...props}
    >
      {children}
    </fieldset>
  )
}

function WatchedDisplay<T extends FieldValues>({
  control,
  name,
  ...props
}: BaseProps & { control?: Control<T>; name: FieldPath<T> }) {
  const value = useWatch({ control, name })
  return <Display value={value} {...props} />
}

/**
 * Shows/hides or enables/disables part of a form depending on another field's
 * value. React port of Javaabu's `conditionalDisplay` (js-utilities).
 *
 * ```tsx
 * <ConditionalDisplay control={control} name="type" when="company">
 *   <FormField label="Company name" name="company_name">…</FormField>
 * </ConditionalDisplay>
 * ```
 *
 * Hidden content is wrapped in a `disabled` fieldset, so its fields are not
 * submitted with a native form.
 */
export function ConditionalDisplay<T extends FieldValues = FieldValues>({
  value,
  control,
  name,
  ...props
}: ConditionalDisplayProps<T>) {
  if (name !== undefined) return <WatchedDisplay control={control} name={name} {...props} />
  return <Display value={value} {...props} />
}
