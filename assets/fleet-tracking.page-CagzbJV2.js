var e=`import * as React from "react"
import {
  Button,
  Card,
  DescriptionList,
  DescriptionListItem,
  EmptyState,
  Icon,
  LinkButton,
  PageTitle,
  SearchBox,
  SegmentedControl,
  StatusBadge,
  cn,
  type StatusMap,
} from "@javaabu/onu"
import { StatTile, StatTiles } from "@javaabu/onu/charts"
import { LiveMap, MapInfoPanel, MapLegendSwatch, type LiveMapMarker, type MapTone } from "@javaabu/onu/maps"

import { useTr } from "../_shared/i18n"
import { routes } from "../_shared/routes"
import { AdminShell } from "../_shared/shells"
import { VESSELS, stepVessels, type Vessel, type VesselStatus } from "./_data"

export const meta = { title: "Fleet tracking", group: "Maps and operations", layout: "bare", order: 1 }

const TICK = 3 // seconds between fake GPS reports

const TONES: Record<VesselStatus, MapTone> = { underway: "success", docked: "muted", alert: "destructive" }

type Filter = "all" | VesselStatus

export default function FleetTrackingPage() {
  const tr = useTr()
  const [vessels, setVessels] = React.useState(VESSELS)
  const [updatedAt, setUpdatedAt] = React.useState(() => Date.now())
  const [live, setLive] = React.useState(true)
  const [search, setSearch] = React.useState("")
  const [filter, setFilter] = React.useState<Filter>("all")
  const [selectedId, setSelectedId] = React.useState<string | null>(null)
  const [followId, setFollowId] = React.useState<string | null>(null)

  // Fake GPS feed: every few seconds the vessels under way report a new position.
  React.useEffect(() => {
    if (!live) return
    const id = setInterval(() => {
      setVessels((v) => stepVessels(v, TICK))
      setUpdatedAt(Date.now())
    }, TICK * 1000)
    return () => clearInterval(id)
  }, [live])

  const statusMap: StatusMap = {
    underway: { tone: "success", label: tr("Under way", "ދަތުރުކުރަނީ"), icon: "navigation" },
    docked: { tone: "neutral", label: tr("Docked", "ބަނދަރުގައި"), icon: "map-pin" },
    alert: { tone: "danger", label: tr("Alert", "ސަމާލުކަމަށް"), icon: "warning" },
  }

  const name = (v: Vessel) => tr(v.name, v.dvName)
  const q = search.trim().toLowerCase()
  const visible = vessels.filter(
    (v) =>
      (filter === "all" || v.status === filter) &&
      (!q ||
        v.name.toLowerCase().includes(q) ||
        v.dvName.includes(search.trim()) ||
        v.registration.toLowerCase().includes(q)),
  )
  const count = (s: VesselStatus) => vessels.filter((v) => v.status === s).length
  const moving = vessels.filter((v) => v.speed > 0)
  const avgSpeed = moving.length ? moving.reduce((sum, v) => sum + v.speed, 0) / moving.length : 0

  const markers: LiveMapMarker[] = visible.map((v) => ({
    id: v.id,
    title: name(v),
    position: v.position,
    heading: v.status === "docked" ? undefined : v.heading,
    tone: TONES[v.status],
    status: \`\${statusMap[v.status]?.label} · \${v.speed.toFixed(1)} kn\`,
    updatedAt,
  }))

  const selected = vessels.find((v) => v.id === selectedId) ?? null
  const select = (id: string | null) => {
    setSelectedId(id)
    // The map centres on a vessel picked from the list by following it.
    setFollowId(id)
  }

  const knots = (n: number) => tr(\`\${n.toFixed(1)} kn\`, \`\${n.toFixed(1)} ނޮޓް\`)

  return (
    <AdminShell
      contentWidth="full"
      breadcrumbs={[
        { label: tr("Dashboard", "ޑޭޝްބޯޑް"), href: routes.adminRecords.dashboard },
        { label: tr("Operations", "އޮޕަރޭޝަންސް") },
        { label: tr("Fleet tracking", "ފްލީޓް ޓްރެކިން") },
      ]}
    >
      <div className="gap-6 grid">
        <PageTitle
          headingLevel={1}
          title={tr("Fleet tracking", "ފްލީޓް ޓްރެކިން")}
          description={tr(
            "Live positions of ferries, speedboats and cargo vessels in Kaafu Atoll.",
            "ކާފު އަތޮޅުގައި ދަތުރުކުރާ ފެރީ، ސްޕީޑްބޯޓް އަދި ކާގޯ އުޅަނދުތަކުގެ ލައިވް މަޤާމު.",
          )}
          actions={
            <StatusBadge status={live ? "success" : "neutral"} icon={live ? "dot" : "pause"}>
              {live ? tr("Live", "ލައިވް") : tr("Paused", "ހުއްޓާލެވިފައި")}
            </StatusBadge>
          }
          action={
            <Button variant="outline" className="touch:min-h-11" onClick={() => setLive((l) => !l)}>
              <Icon name={live ? "pause" : "play"} data-icon="inline-start" />
              {live ? tr("Pause updates", "އަޕްޑޭޓް ހުއްޓާ") : tr("Resume updates", "އަޕްޑޭޓް ފަށާ")}
            </Button>
          }
        />

        <StatTiles columns={4}>
          <StatTile size="sm" label={tr("Under way", "ދަތުރުކުރަނީ")} value={count("underway")} icon="navigation" />
          <StatTile size="sm" label={tr("Docked", "ބަނދަރުގައި")} value={count("docked")} icon="map-pin" />
          <StatTile size="sm" label={tr("Alerts", "ސަމާލުކަމަށް")} value={count("alert")} icon="warning" />
          <StatTile size="sm" label={tr("Average speed", "އެވްރެޖް ސްޕީޑް")} value={knots(avgSpeed)} icon="clock" />
        </StatTiles>

        <div className="gap-6 lg:grid-cols-[22rem_minmax(0,1fr)] lg:items-start grid">
          <Card
            title={tr("Vessels", "އުޅަނދުތައް")}
            headingLevel={2}
            className="lg:order-none order-last"
            actions={
              <span className="text-sm text-muted-foreground tabular-nums" aria-live="polite">
                {tr(\`\${visible.length} of \${vessels.length}\`, \`\${vessels.length} ން \${visible.length}\`)}
              </span>
            }
          >
            <div className="gap-3 grid">
              <SearchBox
                aria-label={tr("Search vessels", "އުޅަނދު ހޯދާ")}
                placeholder={tr("Name or registration", "ނަން ނުވަތަ ރަޖިސްޓްރީ")}
                value={search}
                onSearch={setSearch}
                landmark={false}
              />
              <SegmentedControl
                aria-label={tr("Status", "ހާލަތު")}
                size="sm"
                fullWidth
                value={filter}
                onValueChange={(v) => v && setFilter(v as Filter)}
                options={[
                  { value: "all", label: tr("All", "ހުރިހާ") },
                  { value: "underway", label: tr("Moving", "ދަތުރުގައި") },
                  { value: "docked", label: tr("Docked", "ބަނދަރުގައި") },
                  { value: "alert", label: tr("Alert", "ސަމާލު") },
                ]}
              />
              {visible.length ? (
                <ul className="divide-y rounded-lg border">
                  {visible.map((v) => {
                    const active = v.id === selectedId
                    return (
                      <li key={v.id}>
                        <button
                          type="button"
                          aria-pressed={active}
                          onClick={() => select(active ? null : v.id)}
                          className={cn(
                            "gap-3 p-3 touch:min-h-11 flex w-full items-center text-start outline-none hover:bg-muted/50 focus-visible:ring-3 focus-visible:ring-ring/50",
                            active && "bg-muted",
                          )}
                        >
                          <MapLegendSwatch tone={TONES[v.status]} shape="pin" />
                          <span className="min-w-0 flex-1">
                            <span className="font-medium text-sm block truncate">{name(v)}</span>
                            <span className="text-xs block truncate text-muted-foreground">
                              <bdi dir="ltr">{v.registration}</bdi> · {tr(v.destination, v.dvDestination)}
                            </span>
                          </span>
                          <span className="gap-1 grid shrink-0 justify-items-end">
                            <StatusBadge status={v.status} statusMap={statusMap} size="sm" />
                            <span className="text-xs text-muted-foreground tabular-nums">{knots(v.speed)}</span>
                          </span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              ) : (
                <EmptyState
                  variant="no-results"
                  bordered
                  noun={{ one: tr("vessel", "އުޅަނދު"), other: tr("vessels", "އުޅަނދުތައް") }}
                  search={search}
                  filters={filter === "all" ? [] : [String(statusMap[filter]?.label)]}
                  onClearSearch={() => setSearch("")}
                  onClearFilters={() => setFilter("all")}
                />
              )}
            </div>
          </Card>

          <LiveMap
            label={tr("Fleet map", "ފްލީޓް މެޕް")}
            markers={markers}
            selectedId={selectedId}
            onSelect={setSelectedId}
            followId={followId}
            onFollowChange={setFollowId}
            zoom={11}
            list={false}
            classNames={{ map: "h-[26rem] lg:h-[34rem]" }}
            overlay={
              <MapInfoPanel
                open={!!selected}
                onOpenChange={(open) => !open && select(null)}
                title={selected ? name(selected) : ""}
                description={
                  selected ? (
                    <>
                      <bdi dir="ltr">{selected.registration}</bdi> ·{" "}
                      {
                        {
                          ferry: tr("Ferry", "ފެރީ"),
                          speedboat: tr("Speedboat", "ސްޕީޑްބޯޓް"),
                          dhoni: tr("Dhoni", "ދޯނި"),
                          cargo: tr("Cargo", "ކާގޯ"),
                        }[selected.type]
                      }
                    </>
                  ) : null
                }
                actions={
                  selected ? (
                    <>
                      <Button
                        size="sm"
                        variant={followId === selected.id ? "default" : "outline"}
                        aria-pressed={followId === selected.id}
                        onClick={() => setFollowId(followId === selected.id ? null : selected.id)}
                      >
                        <Icon name="navigation" data-icon="inline-start" />
                        {followId === selected.id ? tr("Following", "ފޮލޯ ކުރަނީ") : tr("Follow", "ފޮލޯ")}
                      </Button>
                      <LinkButton size="sm" variant="outline" href={routes.maps.routePlanner} startIcon="route">
                        {tr("Plan route", "ރޫޓް")}
                      </LinkButton>
                    </>
                  ) : null
                }
              >
                {selected ? (
                  <DescriptionList layout="inline" divided={false}>
                    <DescriptionListItem label={tr("Status", "ހާލަތު")}>
                      <StatusBadge status={selected.status} statusMap={statusMap} size="sm" />
                    </DescriptionListItem>
                    <DescriptionListItem label={tr("Speed", "ސްޕީޑް")}>{knots(selected.speed)}</DescriptionListItem>
                    <DescriptionListItem label={tr("Heading to", "ދަނީ")}>
                      {tr(selected.destination, selected.dvDestination)}
                    </DescriptionListItem>
                    <DescriptionListItem label={tr("Captain", "ކެޕްޓަން")}>
                      {tr(selected.captain, selected.dvCaptain)}
                    </DescriptionListItem>
                    <DescriptionListItem label={tr("On board", "އުޅަނދުގައި")}>
                      {tr(
                        \`\${selected.passengers} of \${selected.capacity}\`,
                        \`\${selected.capacity} ން \${selected.passengers}\`,
                      )}
                    </DescriptionListItem>
                  </DescriptionList>
                ) : null}
              </MapInfoPanel>
            }
          />
        </div>
      </div>
    </AdminShell>
  )
}
`;export{e as default};