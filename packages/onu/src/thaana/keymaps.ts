/**
 * Thaana keymaps. Character tables from JTK (Javascript Thaana Keyboard) 4.2.2,
 * Copyright (c) 2014 Jawish Hameed, MIT licence: https://github.com/jawish/jtk
 */

export type Keymap = Readonly<Record<string, string>>

/** Latin keys, in the order of the JTK tables below. */
const FROM = "qwertyuiop[]\\asdfghjkl;'zxcvbnm,./QWERTYUIOP{}|ASDFGHJKL:\"ZXCVBNM<>?()"

const TABLES = {
  /** Phonetic (Segha version): the most common layout. Default. */
  phonetic: "ްއެރތޔުިޮޕ][\\ަސދފގހޖކލ؛'ޒ×ޗވބނމ،./ޤޢޭޜޓޠޫީޯ÷}{|ާށޑﷲޣޙޛޚޅ:\"ޡޘޝޥޞޏޟ><؟)(",
  /** Phonetic (Hassan Hameed version): differs for alifu, abafili, aabaafili, gaafu and sukun. */
  "phonetic-hh": "ޤަެރތޔުިޮޕ][\\އސދފގހޖކލ؛'ޒޝްވބނމ،./ﷲާޭޜޓޠޫީޯޕ}{|ޢށޑޟޣޙޛޚޅ:\"ޡޘޗޥޞޏމ><؟)(",
  /** Typewriter: the standardised layout used on Thaana typewriters. */
  typewriter: 'ޫޮާީޭގރމތހލ[]ިުްަެވއނކފﷲޒޑސޔޅދބށޓޯ×’“/:ޤޜޣޠޙ÷{}<>.،"ޥޢޘޚޡ؛ޖޕޏޗޟޛޝ\\ޞ؟)(',
} as const

export type KeymapName = keyof typeof TABLES

/** Builds a keymap from two equal-length strings of keys and characters. */
export function createKeymap(from: string, to: string): Keymap {
  const keys = Array.from(from)
  const chars = Array.from(to)
  if (keys.length !== chars.length) {
    throw new Error(`Keymap length mismatch: ${keys.length} keys, ${chars.length} characters`)
  }
  const map: Record<string, string> = {}
  keys.forEach((key, i) => {
    if (key !== chars[i]) map[key] = chars[i]!
  })
  return Object.freeze(map)
}

export const keymaps: Readonly<Record<KeymapName, Keymap>> = {
  phonetic: createKeymap(FROM, TABLES.phonetic),
  "phonetic-hh": createKeymap(FROM, TABLES["phonetic-hh"]),
  typewriter: createKeymap(FROM, TABLES.typewriter),
}
