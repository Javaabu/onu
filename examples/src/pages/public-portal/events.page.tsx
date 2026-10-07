import * as React from "react"
import { useNavigate } from "react-router"
import { Card, IconText, Select, Tag } from "@javaabu/onu"
import { FullCalendar, type CalendarEvent } from "@javaabu/onu/calendar"

import { useTr } from "../_shared/i18n"
import { routes } from "../_shared/routes"
import { PortalShell } from "../_shared/shells"
import { events } from "./_data"
import { toDate, useDates, useL } from "./_i18n"
import { Container, PortalPageHeader } from "./_ui"

export const meta = { title: "Events calendar", group: "Public portal", layout: "bare", order: 7 }

export default function EventsCalendarPage() {
  const tr = useTr()
  const l = useL()
  const dates = useDates()
  const navigate = useNavigate()
  const [where, setWhere] = React.useState("all")

  const places = [
    { value: "all", label: tr("All islands", "ހުރިހާ ރަށެއް") },
    { value: "greater-male", label: tr("Greater Malé", "ބޮޑު މާލެ") },
    { value: "north", label: tr("North", "އުތުރު") },
    { value: "south", label: tr("South", "ދެކުނު") },
  ]
  const region = (lat: number) => (lat > 5 ? "north" : lat > 3.5 ? "greater-male" : "south")
  const visible = events.filter((e) => where === "all" || region(e.position.lat) === where)

  const calendarEvents: CalendarEvent[] = visible.map((e) => ({
    id: e.id,
    title: l(e.title),
    start: toDate(e.start),
    end: toDate(e.end),
    color: e.color,
  }))
  const upcoming = [...visible].sort((a, b) => a.start.localeCompare(b.start))

  return (
    <PortalShell>
      <PortalPageHeader
        crumbs={[{ label: tr("Events", "ހަރަކާތްތައް") }]}
        title={tr("Events calendar", "ހަރަކާތްތަކުގެ ކެލެންޑަރު")}
        description={tr(
          "Information sessions, job fairs and community events near you.",
          "ކައިރީގައި ބާއްވާ މަޢުލޫމާތު ދިނުމުގެ ސެޝަންތަކާއި ޖޮބް ފެއާތަކާއި މުޖުތަމަޢު ހަރަކާތްތައް.",
        )}
      >
        <div className="max-w-xs">
          <label htmlFor="event-region" className="mb-1.5 text-sm font-medium block">
            {tr("Where", "ކޮންތާކު")}
          </label>
          <Select id="event-region" value={where} onValueChange={setWhere} options={places} className="bg-background" />
        </div>
      </PortalPageHeader>

      <Container className="py-10 gap-8 lg:grid-cols-[1fr_20rem] grid items-start">
        <section aria-label={tr("Calendar", "ކެލެންޑަރު")} className="min-w-0 overflow-x-clip">
          <FullCalendar
            events={calendarEvents}
            initialDate={new Date(2026, 9, 7)}
            onEventClick={() => navigate(routes.public.eventDetail)}
            hourCycle={24}
          />
        </section>

        <aside className="lg:sticky lg:top-20" aria-labelledby="upcoming-heading">
          <h2 id="upcoming-heading" className="text-lg font-semibold">
            {tr("Upcoming", "ކުރިއަށް އޮތް")}
          </h2>
          <ul className="mt-4 gap-3 grid">
            {upcoming.map((e) => (
              <li key={e.id}>
                <Card href={routes.public.eventDetail} size="sm" className="transition-colors hover:bg-muted/40">
                  <div className="gap-3 px-4 flex items-start">
                    <div aria-hidden className="w-12 py-1.5 shrink-0 rounded-md bg-muted text-center tabular-nums">
                      <div className="font-medium text-[0.7rem] text-muted-foreground uppercase">
                        {dates.monthShort(e.start)}
                      </div>
                      <div className="text-lg font-semibold leading-none">{dates.day(e.start)}</div>
                    </div>
                    <div className="min-w-0 gap-1 grid">
                      <h3 className="text-sm font-medium leading-snug">{l(e.title)}</h3>
                      <IconText icon="clock" size="sm" tone="muted">
                        <time dateTime={e.start}>{dates.dateTime(e.start)}</time>
                      </IconText>
                      <IconText icon="map-pin" size="sm" tone="muted">
                        {l(e.venue)}
                      </IconText>
                      {e.free ? (
                        <Tag size="sm" variant="primary" className="w-fit">
                          {tr("Free entry", "ހިލޭ")}
                        </Tag>
                      ) : null}
                    </div>
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        </aside>
      </Container>
    </PortalShell>
  )
}
