// Server only: `next/headers` cannot be imported from a client component.
import { cookies } from "next/headers"

import { LOCALE_COOKIE, parseLocale, type Locale } from "./locale"

/** The visitor's locale, from the cookie the language switcher sets. */
export async function getLocale(): Promise<Locale> {
  return parseLocale((await cookies()).get(LOCALE_COOKIE)?.value)
}
