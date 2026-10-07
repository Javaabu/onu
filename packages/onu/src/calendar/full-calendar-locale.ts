import type { FormatterInput, LocaleInput } from "@fullcalendar/core"
import { format } from "date-fns"

import { createTranslator } from "../i18n/translate"
import type { OnuLocale } from "../i18n/types"
import { dv, en } from "../locales"

interface FormatArg {
  date: { year: number; month: number; day: number; hour: number; minute: number }
}

/** A FullCalendar formatter that formats with date-fns, so Dhivehi month and day names work. */
function formatter(locale: OnuLocale, pattern: string): FormatterInput {
  return ((arg: FormatArg) => {
    const { year, month, day, hour, minute } = arg.date
    return format(new Date(year, month, day, hour, minute), pattern, { locale: locale.dateFns })
  }) as FormatterInput
}

export interface FullCalendarLocaleOptions {
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6
  hourCycle?: 12 | 24
}

/**
 * Builds a FullCalendar locale from an Onu locale: direction, week start,
 * button and list texts, and date formats (via date-fns, since browsers have
 * no Dhivehi date data).
 */
export function fullCalendarLocale(locale: OnuLocale, options: FullCalendarLocaleOptions = {}): LocaleInput {
  const t = createTranslator(locale, en)
  const twelve = (options.hourCycle ?? locale.hourCycle) === 12
  return {
    code: locale.code,
    direction: locale.dir,
    firstDay: options.weekStartsOn ?? locale.weekStartsOn,
    buttonText: {
      prev: t("date.previousPeriod"),
      next: t("date.nextPeriod"),
      today: t("date.today"),
      month: t("date.monthView"),
      week: t("date.weekView"),
      day: t("date.dayView"),
      list: t("date.agendaView"),
    },
    weekText: t("date.weekShort"),
    weekTextLong: t("date.week"),
    allDayText: t("date.allDay"),
    moreLinkText: (count: number) => t("date.moreEvents", { count }),
    noEventsText: t("date.noEvents"),
    dayHeaderFormat: formatter(locale, "EEE"),
    dayPopoverFormat: formatter(locale, "PPPP"),
    slotLabelFormat: formatter(locale, twelve ? "h a" : "HH:mm"),
    eventTimeFormat: formatter(locale, twelve ? "h:mm a" : "HH:mm"),
    listDayFormat: formatter(locale, "EEEE"),
    listDaySideFormat: formatter(locale, "d MMMM yyyy"),
    weekNumberFormat: { week: "numeric" },
  }
}

/** Dhivehi FullCalendar locale (RTL, Sunday week start, Dhivehi names). */
export const dvFullCalendarLocale: LocaleInput = fullCalendarLocale(dv)
