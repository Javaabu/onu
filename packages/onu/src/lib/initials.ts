export const THAANA = /[ހ-޿]/

function graphemes(word: string): string[] {
  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    const segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" })
    return Array.from(segmenter.segment(word), (s) => s.segment)
  }
  /* v8 ignore next 2 -- every supported browser has Intl.Segmenter */
  return word.match(/[ހ-ޥ][ަ-ް]*|./gu) ?? []
}

/** First letter of a word, keeping Thaana vowel signs (fili) with their consonant. */
function initial(word: string): string {
  const clusters = graphemes(word)
  const first = clusters.find((c) => /\p{L}/u.test(c))
  if (!first) return ""
  if (THAANA.test(first)) {
    // Intl.Segmenter keeps fili with the consonant; the regex fallback does too.
    const index = clusters.indexOf(first)
    let out = first
    for (const next of clusters.slice(index + 1)) {
      if (/^[ަ-ް]+$/.test(next)) out += next
      else break
    }
    return out
  }
  return first.toLocaleUpperCase()
}

/**
 * Initials for a person's name: the first letters of the first and last words.
 * Works with English and Dhivehi (Thaana) names, e.g. "Ahmed Ali" → "AA",
 * "އަޙްމަދު ޢަލީ" → "އަޢަ". Ignores punctuation such as "(Ali)" or "Mr.".
 */
export function getInitials(name: string | null | undefined, max = 2): string {
  const words = (name ?? "")
    .trim()
    .split(/[\s\-_.]+/u)
    .map((w) => w.replace(/[^\p{L}\p{M}\p{N}]/gu, ""))
    .filter(Boolean)
  if (words.length === 0) return ""
  const picked = words.length === 1 || max === 1 ? [words[0]!] : [words[0]!, words[words.length - 1]!]
  return picked
    .map(initial)
    .join("")
    .slice(0, max * 4)
}
