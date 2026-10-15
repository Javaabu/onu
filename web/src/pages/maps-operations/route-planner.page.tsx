import * as React from "react"
import {
  Button,
  Card,
  FormField,
  FormGroup,
  Icon,
  Notice,
  PageTitle,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TextInput,
  TimePicker,
  toast,
  useOnu,
} from "@javaabu/onu"
import { StatTile, StatTiles } from "@javaabu/onu/charts"
import {
  MapRoute,
  RouteStopEditor,
  distanceMeters,
  formatDistance,
  formatDuration,
  lineStringToPath,
  pathLength,
  pathToLineString,
  type LatLng,
  type RouteFeature,
  type RouteStop,
} from "@javaabu/onu/maps"

import { useTr } from "../_shared/i18n"
import { routes } from "../_shared/routes"
import { AdminShell } from "../_shared/shells"
import { COST_PER_NM, SPEEDS, wait, type VesselType } from "./_data"

export const meta = { title: "Route planner", group: "Maps and operations", layout: "bare", order: 3 }

const NM = 1852 // metres in a nautical mile

const INITIAL_STOPS: RouteStop[] = [
  { id: "s1", label: "Malé ferry terminal", position: { lat: 4.1757, lng: 73.5166 } },
  { id: "s2", label: "Villimalé jetty", position: { lat: 4.1735, lng: 73.4875 } },
  { id: "s3", label: "Maafushi harbour", position: { lat: 3.942, lng: 73.49 } },
  { id: "s4", label: "Guraidhoo harbour", position: { lat: 3.8995, lng: 73.47 } },
]

const placedOf = (stops: RouteStop[]) => stops.map((s) => s.position).filter((p): p is LatLng => !!p)

export default function RoutePlannerPage() {
  const tr = useTr()
  const { t, locale } = useOnu()
  const [stops, setStops] = React.useState(INITIAL_STOPS)
  const [path, setPath] = React.useState<RouteFeature | null>(() => pathToLineString(placedOf(INITIAL_STOPS)))
  const [customised, setCustomised] = React.useState(false)
  const [vessel, setVessel] = React.useState<VesselType>("ferry")
  const [departure, setDeparture] = React.useState<Date | null>(() => {
    const d = new Date(2026, 9, 8, 7, 30)
    return d
  })
  const [saving, setSaving] = React.useState(false)
  // MapRoute keeps its own camera; remount it when the stops reset the path.
  const [pathKey, setPathKey] = React.useState(0)

  const placed = placedOf(stops)
  const straight = pathLength(placed)
  const sailed = path ? pathLength(lineStringToPath(path)) : straight
  // Detours drawn on the sailing path stretch every leg by the same factor.
  const stretch = straight > 0 ? sailed / straight : 1
  const speed = SPEEDS[vessel] // knots
  const hours = sailed / NM / speed
  const arrival = departure ? new Date(departure.getTime() + hours * 3600_000) : null
  const cost = (sailed / NM) * COST_PER_NM[vessel]

  const clock = (d: Date) =>
    new Intl.DateTimeFormat(locale.numberLocale, { hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(d)
  const money = (n: number) =>
    new Intl.NumberFormat(locale.numberLocale, {
      style: "currency",
      currency: "MVR",
      currencyDisplay: "code",
      maximumFractionDigits: 0,
    }).format(n)

  const legs = placed.slice(1).map((to, i) => {
    const from = stops.filter((s) => s.position)[i]!
    const toStop = stops.filter((s) => s.position)[i + 1]!
    const meters = distanceMeters(placed[i]!, to) * stretch
    return { from: from.label, to: toStop.label, meters }
  })
  const legRows = legs.map((leg, i) => {
    const hoursSoFar = legs.slice(0, i + 1).reduce((total, l) => total + l.meters / NM / speed, 0)
    return { ...leg, eta: departure ? new Date(departure.getTime() + hoursSoFar * 3600_000) : null }
  })

  const changeStops = (next: RouteStop[]) => {
    setStops(next)
    setPath(pathToLineString(placedOf(next)))
    setCustomised(false)
    setPathKey((k) => k + 1)
  }

  const vessels: { value: VesselType; label: string }[] = [
    { value: "speedboat", label: tr(`Speedboat (${SPEEDS.speedboat} kn)`, `ސްޕީޑްބޯޓް (${SPEEDS.speedboat} ނޮޓް)`) },
    { value: "ferry", label: tr(`Ferry (${SPEEDS.ferry} kn)`, `ފެރީ (${SPEEDS.ferry} ނޮޓް)`) },
    { value: "dhoni", label: tr(`Dhoni (${SPEEDS.dhoni} kn)`, `ދޯނި (${SPEEDS.dhoni} ނޮޓް)`) },
    { value: "cargo", label: tr(`Cargo (${SPEEDS.cargo} kn)`, `ކާގޯ (${SPEEDS.cargo} ނޮޓް)`) },
  ]

  return (
    <AdminShell
      contentWidth="wide"
      breadcrumbs={[
        { label: tr("Dashboard", "ޑޭޝްބޯޑް"), href: routes.adminRecords.dashboard },
        { label: tr("Operations", "އޮޕަރޭޝަންސް"), href: routes.maps.fleet },
        { label: tr("Route planner", "ރޫޓް ޕްލޭނަރ") },
      ]}
    >
      <div className="gap-6 grid">
        <PageTitle
          headingLevel={1}
          title={tr("Route planner", "ރޫޓް ޕްލޭނަރ")}
          description={tr(
            "Plan a ferry run: add stops, adjust the sailing path around reefs, and check times and cost.",
            "ފެރީ ދަތުރެއް ރާވާ: ސްޓޮޕްތައް ލައްވާ، ފަރުތަކުން ސަލާމަތްވާން މަގު ބަދަލުކުރައްވާ، ވަގުތާއި ޚަރަދު ބައްލަވާ.",
          )}
          actions={
            <Button
              variant="outline"
              className="touch:min-h-11"
              onClick={() => {
                changeStops(INITIAL_STOPS)
                toast(tr("Route reset", "ރޫޓް ރީސެޓް ކުރެވިއްޖެ"))
              }}
            >
              <Icon name="rotate-ccw" data-icon="inline-start" />
              {tr("Reset", "ރީސެޓް")}
            </Button>
          }
          action={
            <Button
              className="touch:min-h-11"
              disabled={saving || placed.length < 2}
              onClick={async () => {
                setSaving(true)
                await wait(800)
                setSaving(false)
                toast.success(tr("Route saved", "ރޫޓް ސޭވްކުރެވިއްޖެ"), {
                  description: tr(
                    `${placed.length} stops, ${formatDistance(sailed, t, locale.numberLocale)}`,
                    `${placed.length} ސްޓޮޕް، ${formatDistance(sailed, t, locale.numberLocale)}`,
                  ),
                })
              }}
            >
              <Icon
                name={saving ? "loading" : "save"}
                data-icon="inline-start"
                className={saving ? "animate-spin" : undefined}
              />
              {tr("Save route", "ރޫޓް ސޭވް")}
            </Button>
          }
        />

        <Card title={tr("Trip", "ދަތުރު")} headingLevel={2}>
          <FormGroup columns={3}>
            <FormField label={tr("Route name", "ރޫޓުގެ ނަން")} name="name">
              <TextInput defaultValue={tr("Malé – South Kaafu morning run", "މާލެ – ދެކުނު ކާފު ހެނދުނު ދަތުރު")} />
            </FormField>
            <FormField label={tr("Vessel", "އުޅަނދު")} name="vessel">
              <Select value={vessel} onValueChange={(v) => setVessel(v as VesselType)} options={vessels} />
            </FormField>
            <FormField label={tr("Departure", "ފުރާ ގަޑި")} name="departure">
              <TimePicker value={departure} onChange={setDeparture} hourCycle={24} minuteStep={15} />
            </FormField>
          </FormGroup>
        </Card>

        <StatTiles columns={4}>
          <StatTile
            size="sm"
            icon="route"
            label={tr("Distance", "ދުރުމިން")}
            value={formatDistance(sailed, t, locale.numberLocale)}
            footer={tr(`${(sailed / NM).toFixed(1)} nautical miles`, `${(sailed / NM).toFixed(1)} ނޯޓިކަލް މޭލު`)}
          />
          <StatTile
            size="sm"
            icon="clock"
            label={tr("Sailing time", "ދަތުރުގެ ވަގުތު")}
            value={placed.length > 1 ? formatDuration(hours * 3600, t) : "—"}
          />
          <StatTile
            size="sm"
            icon="map-pin"
            label={tr("Arrival", "ފޯރާ ގަޑި")}
            value={arrival && placed.length > 1 ? clock(arrival) : "—"}
          />
          <StatTile size="sm" icon="credit-card" label={tr("Fuel and crew", "ތެޔޮ އަދި ކުރޫ")} value={money(cost)} />
        </StatTiles>

        <div className="gap-6 xl:grid-cols-2 grid">
          <Card
            title={tr("Stops", "ސްޓޮޕްތައް")}
            description={tr(
              "Click the map to add a stop. Drag the handles or use the arrow buttons to reorder.",
              "ސްޓޮޕެއް އިތުރުކުރުމަށް މެޕަށް ފިއްތަވާ. ތަރުތީބު ބަދަލުކުރުމަށް ހޭންޑަލް ދަމާ ނުވަތަ ތިރި/މަތި ބަޓަން ބޭނުންކުރައްވާ.",
            )}
            headingLevel={2}
          >
            <FormField label={tr("Stops", "ސްޓޮޕްތައް")} name="stops" hideLabel>
              <RouteStopEditor
                value={stops}
                onChange={changeStops}
                name="stops"
                max={8}
                zoom={9}
                center={{ lat: 4.04, lng: 73.49 }}
                tone="primary"
              />
            </FormField>
          </Card>

          <Card
            title={tr("Sailing path", "ދަތުރުކުރާ މަގު")}
            description={tr(
              "Starts as straight lines between the stops. Move or add points to steer around reefs.",
              "ފެށޭނީ ސްޓޮޕްތަކުގެ ދެމެދު ސީދާ ރޮނގުން. ފަރުތަކުން ސަލާމަތްވާން ޕޮއިންޓްތައް ބަދަލުކުރައްވާ.",
            )}
            headingLevel={2}
            actions={
              customised ? (
                <Button size="sm" variant="outline" onClick={() => changeStops(stops)}>
                  <Icon name="undo" data-icon="inline-start" />
                  {tr("Straighten", "ސީދާކުރޭ")}
                </Button>
              ) : null
            }
          >
            <div className="gap-3 grid">
              <FormField label={tr("Sailing path", "ދަތުރުކުރާ މަގު")} name="path" hideLabel>
                <MapRoute
                  key={pathKey}
                  value={path}
                  onChange={(next) => {
                    setPath(next)
                    setCustomised(true)
                  }}
                  tone="chart-4"
                  zoom={9}
                  center={{ lat: 4.04, lng: 73.49 }}
                />
              </FormField>
              {customised && stretch > 1.001 ? (
                <Notice tone="info" variant="bordered" icon="info">
                  {tr(
                    `The detours add ${formatDistance(sailed - straight, t, locale.numberLocale)} to the trip.`,
                    `މަގު ބަދަލުކުރުމުން ${formatDistance(sailed - straight, t, locale.numberLocale)} އިތުރުވޭ.`,
                  )}
                </Notice>
              ) : null}
            </div>
          </Card>
        </div>

        <Card title={tr("Legs", "ދަތުރުގެ ބައިތައް")} headingLevel={2}>
          {legRows.length ? (
            <div className="overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>{tr("From", "ފުރާ ތަން")}</TableHead>
                    <TableHead>{tr("To", "ދާ ތަން")}</TableHead>
                    <TableHead className="text-end">{tr("Distance", "ދުރުމިން")}</TableHead>
                    <TableHead className="text-end">{tr("Arrives", "ފޯރާނީ")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {legRows.map((leg, i) => (
                    <TableRow key={`${leg.from}-${leg.to}-${i}`}>
                      <TableCell className="tabular-nums">{i + 1}</TableCell>
                      <TableCell>{leg.from}</TableCell>
                      <TableCell>{leg.to}</TableCell>
                      <TableCell className="text-end tabular-nums">
                        {formatDistance(leg.meters, t, locale.numberLocale)}
                      </TableCell>
                      <TableCell className="text-end tabular-nums">{leg.eta ? clock(leg.eta) : "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              {tr(
                "Place at least two stops to see the legs.",
                "ދަތުރުގެ ބައިތައް ފެނުމަށް މަދުވެގެން ދެ ސްޓޮޕް ލައްވާ.",
              )}
            </p>
          )}
        </Card>
      </div>
    </AdminShell>
  )
}
