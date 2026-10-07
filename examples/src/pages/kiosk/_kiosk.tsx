import { useSettings } from "../../settings"

/**
 * Kiosk sizing: on top of KioskShell's touch density, primary actions are made
 * very large (≥ 64px tall) so they are easy to hit standing up.
 */
export const BIG = "h-16 sm:h-20 px-8 text-lg sm:text-xl gap-3 [&_svg]:size-6"
export const HUGE = "h-24 sm:h-28 px-10 text-2xl sm:text-3xl gap-4 [&_svg]:size-8"

/** Switches the kiosk language (the showcase's locale setting). */
export function useKioskLanguage() {
  const { settings, update } = useSettings()
  return { locale: settings.locale, setLocale: (locale: "en" | "dv") => update({ locale }) }
}

/** The bill paid at the kiosk. */
export const kioskBill = {
  ref: "INV-2026-11702",
  payer: ["Ahmed Ali", "އަޙްމަދު ޢަލީ"] as const,
  service: ["Hulhumalé parking permit", "ހުޅުމާލޭގެ ޕާކިންގ ހުއްދަ"] as const,
  amount: 300,
  receipt: "KSK-2026-01937",
  transaction: "BMLC-9C41E07D",
  kiosk: "KSK-HM-02",
}
