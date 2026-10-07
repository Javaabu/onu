import type { Locale, FormatLongFn, MatchFn } from "date-fns"

/**
 * Dhivehi (`dv`) locale for date-fns. date-fns ships no Dhivehi locale and the
 * platform `Intl` APIs have no Dhivehi data, so this is maintained here and
 * should be contributed upstream (R4.3).
 *
 * Native-speaker review is welcome: open an issue with corrections.
 */

const months = [
  "ޖެނުއަރީ",
  "ފެބްރުއަރީ",
  "މާޗު",
  "އެޕްރީލް",
  "މެއި",
  "ޖޫން",
  "ޖުލައި",
  "އޮގަސްޓު",
  "ސެޕްޓެމްބަރު",
  "އޮކްޓޯބަރު",
  "ނޮވެމްބަރު",
  "ޑިސެމްބަރު",
] as const

const days = ["އާދިއްތަ", "ހޯމަ", "އަންގާރަ", "ބުދަ", "ބުރާސްފަތި", "ހުކުރު", "ހޮނިހިރު"] as const
const shortDays = ["އާދި", "ހޯމަ", "އަން", "ބުދަ", "ބުރާ", "ހުކު", "ހޮނި"] as const
const narrowDays = ["އާ", "ހޯ", "އަ", "ބު", "ބުރ", "ހު", "ހޮ"] as const

const units = {
  second: "ސިކުންތު",
  minute: "މިނެޓު",
  hour: "ގަޑިއިރު",
  day: "ދުވަސް",
  week: "ހަފްތާ",
  month: "މަސް",
  year: "އަހަރު",
} as const

type Token =
  | "lessThanXSeconds"
  | "xSeconds"
  | "halfAMinute"
  | "lessThanXMinutes"
  | "xMinutes"
  | "aboutXHours"
  | "xHours"
  | "xDays"
  | "aboutXWeeks"
  | "xWeeks"
  | "aboutXMonths"
  | "xMonths"
  | "aboutXYears"
  | "xYears"
  | "overXYears"
  | "almostXYears"

const distance: Record<Token, (n: number) => string> = {
  lessThanXSeconds: (n) => `${n} ${units.second}އަށްވުރެ ކުޑަ`,
  xSeconds: (n) => `${n} ${units.second}`,
  halfAMinute: () => `30 ${units.second}`,
  lessThanXMinutes: (n) => `${n} ${units.minute}އަށްވުރެ ކުޑަ`,
  xMinutes: (n) => `${n} ${units.minute}`,
  aboutXHours: (n) => `ގާތްގަނޑަކަށް ${n} ${units.hour}`,
  xHours: (n) => `${n} ${units.hour}`,
  xDays: (n) => `${n} ${units.day}`,
  aboutXWeeks: (n) => `ގާތްގަނޑަކަށް ${n} ${units.week}`,
  xWeeks: (n) => `${n} ${units.week}`,
  aboutXMonths: (n) => `ގާތްގަނޑަކަށް ${n} ${units.month}`,
  xMonths: (n) => `${n} ${units.month}`,
  aboutXYears: (n) => `ގާތްގަނޑަކަށް ${n} ${units.year}`,
  xYears: (n) => `${n} ${units.year}`,
  overXYears: (n) => `${n} ${units.year}އަށްވުރެ ގިނަ`,
  almostXYears: (n) => `ގާތްގަނޑަކަށް ${n} ${units.year}`,
}

const formatLongPatterns = {
  date: { full: "EEEE، d MMMM y", long: "d MMMM y", medium: "d MMM y", short: "dd/MM/yyyy" },
  time: { full: "h:mm:ss a", long: "h:mm:ss a", medium: "h:mm:ss a", short: "h:mm a" },
  dateTime: {
    full: "{{date}} {{time}}",
    long: "{{date}} {{time}}",
    medium: "{{date}} {{time}}",
    short: "{{date}} {{time}}",
  },
}

type Width = "full" | "long" | "medium" | "short"
const longFn =
  (kind: keyof typeof formatLongPatterns): FormatLongFn =>
  (options = {}) =>
    formatLongPatterns[kind][(options.width === "any" || !options.width ? "full" : options.width) as Width]

const relative = {
  lastWeek: "'ފާއިތުވި' eeee p",
  yesterday: "'އިއްޔެ' p",
  today: "'މިއަދު' p",
  tomorrow: "'މާދަމާ' p",
  nextWeek: "eeee p",
  other: "P",
} as const

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function matcher(values: readonly string[]): MatchFn<any> {
  return (str: string) => {
    const index = values.findIndex((v) => str.startsWith(v))
    if (index === -1) return null
    return { value: index, rest: str.slice(values[index]!.length) }
  }
}

export const dv: Locale = {
  code: "dv",
  formatDistance: (token, count, options) => {
    const text = distance[token as Token](count)
    if (!options?.addSuffix) return text
    return (options.comparison ?? 0) > 0 ? `${text} ފަހުން` : `${text} ކުރިން`
  },
  formatLong: {
    date: longFn("date"),
    time: longFn("time"),
    dateTime: longFn("dateTime"),
  },
  formatRelative: (token) => relative[token as keyof typeof relative],
  localize: {
    ordinalNumber: (n) => `${Number(n)}ވަނަ`,
    era: (n) => (Number(n) === 0 ? "މީލާދުން ކުރިން" : "މީލާދީ"),
    quarter: (n) => `${Number(n)}ވަނަ ކުއާޓަރ`,
    month: (n, options) => {
      const name = months[Number(n)]!
      return options?.width === "narrow" ? name.slice(0, 2) : name
    },
    day: (n, options) => {
      const i = Number(n)
      if (options?.width === "narrow") return narrowDays[i]!
      if (options?.width === "short" || options?.width === "abbreviated") return shortDays[i]!
      return days[i]!
    },
    dayPeriod: (period, options) => {
      const am = options?.width === "wide" ? "މެންދުރުކުރިން" : "މކ"
      const pm = options?.width === "wide" ? "މެންދުރުފަހު" : "މފ"
      return String(period).startsWith("a") || period === "morning" ? am : pm
    },
  },
  match: {
    ordinalNumber: (str) => {
      const m = /^(\d+)(ވަނަ)?/.exec(str)
      return m ? { value: Number(m[1]), rest: str.slice(m[0].length) } : null
    },
    era: matcher(["މީލާދުން ކުރިން", "މީލާދީ"]),
    quarter: (str) => {
      const m = /^([1-4])(ވަނަ ކުއާޓަރ)?/.exec(str)
      return m ? { value: Number(m[1]) as 1 | 2 | 3 | 4, rest: str.slice(m[0].length) } : null
    },
    month: matcher(months),
    day: matcher(days),
    dayPeriod: (str) => {
      if (str.startsWith("މކ") || str.startsWith("މެންދުރުކުރިން"))
        return { value: "am", rest: str.slice(str.startsWith("މކ") ? 2 : 14) }
      if (str.startsWith("މފ") || str.startsWith("މެންދުރުފަހު"))
        return { value: "pm", rest: str.slice(str.startsWith("މފ") ? 2 : 12) }
      return null
    },
  },
  options: {
    weekStartsOn: 0,
    firstWeekContainsDate: 1,
  },
}
