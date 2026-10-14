import type { MessageDict, Namespace, PartialMessages } from "./types"

/**
 * English text for the namespaces in use. Every module that has built-in strings
 * registers the English namespaces it needs (`registerEnglish({ form })`) at the top
 * level, so a bundle only carries the English text of the components it imports,
 * instead of the whole English locale. Translators fall back to it after the active
 * locale (and its overrides), so `t("form.required")` keeps working everywhere.
 *
 * The call runs when the module is evaluated, which bundlers keep for every module
 * they include; `english-registry.test.ts` checks each module registers what it uses.
 */
const english: PartialMessages = {}

/** Makes English namespaces available as the fallback text of every translator. */
export function registerEnglish(messages: PartialMessages) {
  for (const ns of Object.keys(messages) as Namespace[]) english[ns] = messages[ns]
}

/** English message dictionary for a namespace, when a loaded module has registered it. */
export function englishNamespace(ns: Namespace): MessageDict | undefined {
  return english[ns]
}
