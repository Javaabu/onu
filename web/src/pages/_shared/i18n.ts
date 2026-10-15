import { useOnu } from "@javaabu/onu"

/** True when the showcase is in Dhivehi. */
export function useDv() {
  return useOnu().locale.code === "dv"
}

/** Picks the English or Dhivehi string: `tr("Users", "މެމްބަރުން")`. */
export function useTr() {
  const dv = useDv()
  return (en: string, dvText: string) => (dv ? dvText : en)
}
