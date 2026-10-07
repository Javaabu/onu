import { useOnu } from "@javaabu/onu"

// Onu doesn't export a locale-aware formatter for static dates (its date-fns
// helpers are internal), and Intl has no Dhivehi month names, so the sample
// pages format dates here.
const DV_MONTHS = [
  "ޖަނަވަރީ",
  "ފެބްރުއަރީ",
  "މާރިޗު",
  "އޭޕްރީލް",
  "މެއި",
  "ޖޫން",
  "ޖުލައި",
  "އޮގަސްޓު",
  "ސެޕްޓެމްބަރު",
  "އޮކްޓޫބަރު",
  "ނޮވެމްބަރު",
  "ޑިސެމްބަރު",
]

/** `formatDate(date, withTime?)` in the active locale: "5 October 2026" / "5 އޮކްޓޫބަރު 2026". */
export function useFormatDate() {
  const { locale } = useOnu()
  return (d: Date, withTime = false) => {
    const time = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`
    if (locale.code === "dv") return `${d.getDate()} ${DV_MONTHS[d.getMonth()]} ${d.getFullYear()}${withTime ? `، ${time}` : ""}`
    return new Intl.DateTimeFormat(locale.numberLocale, {
      day: "numeric",
      month: "long",
      year: "numeric",
      ...(withTime ? { hour: "2-digit", minute: "2-digit", hourCycle: "h23" } : {}),
    }).format(d)
  }
}

/** MVR amounts: "MVR 1,500.00". */
export function useFormatMoney() {
  const { locale } = useOnu()
  return (n: number) =>
    new Intl.NumberFormat(locale.numberLocale, { style: "currency", currency: "MVR", currencyDisplay: "code" }).format(n)
}
