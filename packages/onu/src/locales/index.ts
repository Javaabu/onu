import { dv } from "./dv/dv"
import { en } from "./en"

export { en, dv }
export { dv as dvDateFns } from "./date-fns-dv"
export { baseEn, BUILT_IN_LOCALES, type BuiltInLocaleCode } from "./base"

/**
 * Both built-in locales with all their text. Importing this bundles every English and
 * Dhivehi string; pass one locale (or its code) to `OnuProvider` instead.
 */
export const locales = { en, dv } as const
