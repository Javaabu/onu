// Mock data and helpers for the auth sample pages.
import { ValidationError } from "@javaabu/onu"

export const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

/** The demo account: any other password fails. */
export const DEMO_EMAIL = "ahmed.ali@example.mv"
export const DEMO_PASSWORD = "secret123"

/** Emails that are "already registered". */
export const TAKEN_EMAILS = [DEMO_EMAIL, "aishath.shifa@example.mv"]

/** The six-digit code the two-factor page accepts. */
export const DEMO_CODE = "482913"

export const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)

/** "ahmed.ali@example.mv" → "a********@example.mv" */
export function maskEmail(email: string) {
  const [user = "", domain = ""] = email.split("@")
  return `${user.slice(0, 1)}${"*".repeat(Math.max(user.length - 1, 3))}@${domain}`
}

/**
 * Collects field errors and throws them as Laravel's 422 body
 * (`{ message, errors: { field: ["…"] } }`), the way the fake server responds.
 */
export class Validator {
  errors: Record<string, string[]> = {}
  add(field: string, message: string) {
    ;(this.errors[field] ??= []).push(message)
    return this
  }
  get failed() {
    return Object.keys(this.errors).length > 0
  }
  throwIfFailed(message: string) {
    if (this.failed) throw new ValidationError({ message, errors: this.errors })
  }
}
