import { toArray, toDotNotation, type FormErrors } from "./form-context"

/** Laravel's 422 response body: `{ message, errors: { "items.0.name": ["…"] } }` (R16.3). */
export interface ValidationPayload {
  message?: string
  errors: FormErrors
}

/** Throw this from a submit handler to show field errors without an HTTP client. */
export class ValidationError extends Error {
  readonly errors: FormErrors
  constructor(payload: ValidationPayload | FormErrors, message?: string) {
    const body = isValidationPayload(payload) ? payload : { errors: payload }
    super(message ?? body.message ?? "The given data was invalid.")
    this.name = "ValidationError"
    this.errors = body.errors
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

/** True for `{ errors: { field: string | string[] } }`, Laravel's 422 shape. */
export function isValidationPayload(value: unknown): value is ValidationPayload {
  if (!isRecord(value) || !isRecord(value.errors) || Array.isArray(value.errors)) return false
  return Object.values(value.errors).every(
    (v) => v === undefined || typeof v === "string" || (Array.isArray(v) && v.every((m) => typeof m === "string")),
  )
}

/**
 * Finds a Laravel validation payload in a thrown value or a parsed response:
 * the payload itself, a `ValidationError`, an axios-style error
 * (`error.response.data`), `{ data }`, `{ body }` or `{ cause }`.
 * Returns `null` when there is none. Use `readValidationErrors` for a fetch `Response`.
 */
export function getValidationErrors(value: unknown): ValidationPayload | null {
  if (value instanceof ValidationError) return { message: value.message, errors: value.errors }
  if (isValidationPayload(value)) return value
  if (!isRecord(value)) return null
  for (const key of ["response", "data", "body", "cause"] as const) {
    const found: unknown = key === "response" && isRecord(value.response) ? value.response.data : value[key]
    if (found !== undefined && found !== value) {
      const nested = getValidationErrors(found)
      if (nested) return nested
    }
  }
  return null
}

/** Like `getValidationErrors`, and also reads the JSON body of a fetch `Response` (status 422). */
export async function readValidationErrors(value: unknown): Promise<ValidationPayload | null> {
  if (typeof Response !== "undefined" && value instanceof Response) {
    if (value.status !== 422) return null
    try {
      return getValidationErrors(await value.clone().json())
    } catch {
      return null
    }
  }
  return getValidationErrors(value)
}

/** Flattens errors to `[name, messages]` pairs, dropping empty entries. */
export function errorEntries(errors: FormErrors | null | undefined): [string, string[]][] {
  if (!errors) return []
  return Object.entries(errors)
    .map(([name, messages]) => [name, toArray(messages)] as [string, string[]])
    .filter(([, messages]) => messages.length > 0)
}

/**
 * Flattens react-hook-form's nested `formState.errors` into dot-notation keys
 * (`items.0.name`), the same shape as Laravel's errors.
 */
export function flattenFieldErrors(errors: unknown, prefix = "", out: FormErrors = {}): FormErrors {
  if (!isRecord(errors)) return out
  for (const [key, value] of Object.entries(errors)) {
    if (!isRecord(value) || key === "ref") continue
    const name = prefix ? `${prefix}.${key}` : key
    if (typeof value.message === "string" && value.message) {
      out[name] = [value.message]
    } else if (isRecord(value.types)) {
      const messages = Object.values(value.types).flatMap((m) => (typeof m === "string" ? [m] : []))
      if (messages.length) out[name] = messages
    }
    flattenFieldErrors(value, name, out)
  }
  return out
}

type Focusable = HTMLElement & { name?: string; disabled?: boolean }

/** Finds the control for an error key (`items.0.name`) inside `root`: by `name` (dot or bracket form), then by `id`. */
export function findField(root: ParentNode | null | undefined, name: string): HTMLElement | null {
  if (!root) return null
  const target = toDotNotation(name)
  const named = Array.from(root.querySelectorAll<Focusable>("[name]")).find(
    (el) => el.getAttribute("type") !== "hidden" && toDotNotation(el.getAttribute("name") ?? "") === target,
  )
  if (named) return named
  const byId = Array.from(root.querySelectorAll<HTMLElement>("[id]")).find((el) => el.id === name)
  return byId ?? null
}

/**
 * Asks collapsed containers (a closed `Fieldset`, an inactive tab…) to show
 * `el`, so it can be focused. Containers listen for the `onu:reveal` event.
 */
export function revealField(el: HTMLElement) {
  el.dispatchEvent(new CustomEvent("onu:reveal", { bubbles: true }))
}

/**
 * Reveals, scrolls to and focuses a control. When a container has to open
 * first (it re-renders), focus follows on the next frames. Returns `true`
 * when focus moved or is scheduled.
 */
export function focusField(el: HTMLElement | null | undefined): boolean {
  if (!el) return false
  revealField(el)
  // A Radix checkbox / select keeps a hidden native input; focus its visible sibling instead.
  const target =
    el instanceof HTMLInputElement && el.getAttribute("aria-hidden") === "true"
      ? ((el.parentElement?.querySelector<HTMLElement>("button, [tabindex]") ?? el) as HTMLElement)
      : el
  const focus = () => {
    target.scrollIntoView?.({ block: "center", behavior: "smooth" })
    target.focus({ preventScroll: true })
  }
  if (!target.closest("[hidden]")) {
    focus()
    return document.activeElement === target
  }
  let tries = 0
  const retry = () => {
    if (!target.isConnected) return
    if (!target.closest("[hidden]")) focus()
    else if (++tries < 10) setTimeout(retry, 16)
  }
  setTimeout(retry, 0)
  return true
}

/** Focuses the first invalid control in `root`, in document order (§25.9 "On error"). */
export function focusFirstInvalid(root: HTMLElement | null, errors?: FormErrors | null): boolean {
  if (!root) return false
  const keys = new Set(errorEntries(errors).map(([name]) => toDotNotation(name)))
  const controls = Array.from(root.querySelectorAll<Focusable>("input, select, textarea, button, [aria-invalid]"))
  const first = controls.find((el) => {
    if (el.getAttribute("type") === "hidden" || el.getAttribute("type") === "submit") return false
    if (el.getAttribute("aria-invalid") === "true") return true
    const name = el.getAttribute("name")
    return !!name && keys.has(toDotNotation(name))
  })
  return focusField(first)
}
