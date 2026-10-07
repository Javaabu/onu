/**
 * Thaana → Latin transliteration for slugs and other Latin-only identifiers.
 * Follows the common Maldivian romanisation (މާލެ → maale, ހުޅުމާލެ → hulhumaale).
 * It is a readable approximation, not a reversible scheme.
 */

const CONSONANTS: Record<string, string> = {
  ހ: "h", // ހ
  ށ: "sh", // ށ
  ނ: "n", // ނ
  ރ: "r", // ރ
  ބ: "b", // ބ
  ޅ: "lh", // ޅ
  ކ: "k", // ކ
  އ: "", // އ alifu: carries the vowel
  ވ: "v", // ވ
  މ: "m", // މ
  ފ: "f", // ފ
  ދ: "dh", // ދ
  ތ: "th", // ތ
  ލ: "l", // ލ
  ގ: "g", // ގ
  ޏ: "gn", // ޏ
  ސ: "s", // ސ
  ޑ: "d", // ޑ
  ޒ: "z", // ޒ
  ޓ: "t", // ޓ
  ޔ: "y", // ޔ
  ޕ: "p", // ޕ
  ޖ: "j", // ޖ
  ޗ: "ch", // ޗ
  ޘ: "th", // ޘ
  ޙ: "h", // ޙ
  ޚ: "kh", // ޚ
  ޛ: "dh", // ޛ
  ޜ: "z", // ޜ
  ޝ: "sh", // ޝ
  ޞ: "s", // ޞ
  ޟ: "d", // ޟ
  ޠ: "t", // ޠ
  ޡ: "z", // ޡ
  ޢ: "", // ޢ
  ޣ: "gh", // ޣ
  ޤ: "q", // ޤ
  ޥ: "w", // ޥ
  ޱ: "n", // ޱ
}

const VOWELS: Record<string, string> = {
  "ަ": "a", // ަ
  "ާ": "aa", // ާ
  "ި": "i", // ި
  "ީ": "ee", // ީ
  "ު": "u", // ު
  "ޫ": "oo", // ޫ
  "ެ": "e", // ެ
  "ޭ": "ey", // ޭ
  "ޮ": "o", // ޮ
  "ޯ": "oa", // ޯ
}

const SUKUN = "ް"
const ALIFU = "އ"
const PUNCTUATION: Record<string, string> = { "،": ",", "؛": ";", "؟": "?" }

/** Transliterates Thaana letters to Latin; other characters pass through. */
export function thaanaToLatin(text: string): string {
  let out = ""
  const chars = Array.from(text)
  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i]!
    const next = chars[i + 1]
    if (ch in CONSONANTS) {
      if (next === SUKUN) {
        const after = chars[i + 2]
        const wordEnd = after === undefined || !(after in CONSONANTS)
        if (ch === ALIFU || ch === "ށ") {
          // Alifu/shaviyani + sukun: "h" at the end of a word, otherwise doubles the next consonant.
          out += wordEnd ? "h" : (CONSONANTS[after!] ?? "").charAt(0)
        } else {
          out += CONSONANTS[ch]
        }
        i++
        continue
      }
      out += CONSONANTS[ch]
      continue
    }
    if (ch in VOWELS) {
      out += VOWELS[ch]
      continue
    }
    if (ch === SUKUN) continue
    out += PUNCTUATION[ch] ?? ch
  }
  return out
}
