import { keymaps, type Keymap, type KeymapName } from "./keymaps"

/** Thaana block U+0780–U+07BF plus the Arabic punctuation used with it. */
const THAANA = /[ހ-޿ﷲ،؛؟]/

export function resolveKeymap(keymap: KeymapName | Keymap = "phonetic"): Keymap {
  return typeof keymap === "string" ? keymaps[keymap] : keymap
}

/** Thaana character for one Latin key, or `undefined` if the key is not mapped. */
export function translateKey(key: string, keymap: KeymapName | Keymap = "phonetic"): string | undefined {
  return resolveKeymap(keymap)[key]
}

/** Converts a whole string typed on a Latin keyboard to Thaana. Unmapped characters are kept. */
export function transliterate(text: string, keymap: KeymapName | Keymap = "phonetic"): string {
  const map = resolveKeymap(keymap)
  let out = ""
  for (const ch of text) out += map[ch] ?? ch
  return out
}

/** True when the text contains at least one Thaana character. */
export function containsThaana(text: string): boolean {
  return THAANA.test(text)
}

/** True when every character could have come from a Latin keyboard (printable ASCII). */
export function isLatinKeyboardText(text: string): boolean {
  return /^[\x20-\x7E]*$/.test(text)
}
