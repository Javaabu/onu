"use server"

import { getLocale } from "@/lib/get-locale"
import { getMessages } from "@/lib/locale"

export interface ContactResult {
  ok: boolean
  /** Laravel's 422 shape, so Onu's `Form` can show each message under its field. */
  message?: string
  errors?: Record<string, string[]>
}

/** A Server Action that validates like a Laravel controller would. */
export async function sendContactMessage(values: Record<string, unknown>): Promise<ContactResult> {
  const t = getMessages(await getLocale())
  const name = String(values.name ?? "").trim()
  const email = String(values.email ?? "").trim()
  const message = String(values.message ?? "").trim()

  const errors: Record<string, string[]> = {}
  if (!name) errors.name = [t.nameRequired]
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = [t.emailInvalid]
  if (message.length < 10) errors.message = [t.messageMin]

  if (Object.keys(errors).length) return { ok: false, message: Object.values(errors)[0]![0], errors }

  // Save or send the message here.
  return { ok: true }
}
