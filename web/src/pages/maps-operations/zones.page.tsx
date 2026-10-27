import * as React from "react"
import {
  ActionMenu,
  Button,
  Card,
  EmptyState,
  Form,
  FormField,
  Icon,
  PageTitle,
  SearchBox,
  Select,
  SlideOver,
  StatusBadge,
  SubmitButton,
  TextInput,
  ValidationError,
  cn,
  confirm,
  toast,
  useOnu,
  type StatusMap,
} from "@javaabu/onu"
import {
  MapLegend,
  MapPolygon,
  MapPolygonShape,
  MapView,
  formatArea,
  polygonArea,
  type LatLng,
  type MapTone,
  type PolygonCollection,
} from "@javaabu/onu/maps"

import { useTr } from "../_shared/i18n"
import { routes } from "../_shared/routes"
import { AdminShell } from "../_shared/shells"
import { ZONES, wait, type Zone, type ZoneType } from "./_data"

export const meta = { title: "Zone management", group: "Maps and operations", layout: "bare", order: 2 }

const TONES: Record<ZoneType, MapTone> = { waste: "chart-2", parking: "chart-4", mooring: "chart-1" }

const ringToPath = (ring: [number, number][]): LatLng[] => ring.slice(0, -1).map(([lng, lat]) => ({ lat, lng }))

function toCollection(zone: Zone | null): PolygonCollection | null {
  if (!zone) return null
  return {
    type: "FeatureCollection",
    features: [
      { type: "Feature", id: zone.id, properties: {}, geometry: { type: "Polygon", coordinates: [zone.ring] } },
    ],
  }
}

function useLabels() {
  const tr = useTr()
  const types: Record<ZoneType, string> = {
    waste: tr("Waste collection", "ކުނި ނެގުން"),
    parking: tr("Paid parking", "ފައިސާ ދައްކާ ޕާކިން"),
    mooring: tr("Mooring", "ދޯނި ބެނދުން"),
  }
  const days: Record<string, string> = {
    sun: tr("Sunday", "އާދިއްތަ"),
    mon: tr("Monday", "ހޯމަ"),
    tue: tr("Tuesday", "އަންގާރަ"),
    wed: tr("Wednesday", "ބުދަ"),
    thu: tr("Thursday", "ބުރާސްފަތި"),
    sat: tr("Saturday", "ހޮނިހިރު"),
  }
  return { types, days }
}

/** Create / edit zone panel. */
function ZoneEditor({
  zone,
  open,
  onOpenChange,
  onSave,
}: {
  zone: Zone | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (zone: Zone) => void
}) {
  const tr = useTr()
  const { types, days } = useLabels()
  const [shape, setShape] = React.useState<PolygonCollection | null>(() => toCollection(zone))
  const [type, setType] = React.useState<ZoneType>(zone?.type ?? "waste")
  const [day, setDay] = React.useState(zone?.day ?? "sun")

  return (
    <SlideOver
      open={open}
      onOpenChange={onOpenChange}
      side="end"
      size="lg"
      title={zone ? tr("Edit zone", "ސަރަހައްދު އެޑިޓް") : tr("New zone", "އައު ސަރަހައްދު")}
      description={tr(
        "Draw the boundary on the map, or add its corners in the list under it.",
        "ސަރަހައްދުގެ ބޯޑަރު މެޕްގައި ކުރައްވާ، ނުވަތަ ތިރީގައިވާ ލިސްޓުން ކޮޅުތައް ލައްވާ.",
      )}
    >
      <Form
        noValidate
        className="gap-5"
        onSubmit={async (values) => {
          await wait(700)
          const errors: Record<string, string[]> = {}
          const name = String(values.name ?? "").trim()
          const dvName = String(values.dv_name ?? "").trim()
          if (!name) errors.name = [tr("The name field is required.", "ނަން ލިޔުއްވާ.")]
          if (!dvName) errors.dv_name = [tr("The Dhivehi name field is required.", "ދިވެހި ނަން ލިޔުއްވާ.")]
          const ring = shape?.features[0]?.geometry.coordinates[0] as [number, number][] | undefined
          if (!ring || ring.length < 4)
            errors.boundary = [
              tr("Draw the zone boundary with at least 3 points.", "މަދުވެގެން 3 ޕޮއިންޓާއެކު ބޯޑަރު ކުރައްވާ."),
            ]
          else if (polygonArea(ringToPath(ring)) > 2_000_000)
            errors.boundary = [tr("A zone can't be larger than 2 km².", "ސަރަހައްދެއް 2 ކމ² އަށްވުރެ ބޮޑުނުވާނެ.")]
          if (Object.keys(errors).length)
            throw new ValidationError({
              message: tr("The given data was invalid.", "މައުލޫމާތު ރަނގަޅެއް ނޫން."),
              errors,
            })
          onSave({ id: zone?.id ?? `z${Date.now()}`, name, dvName, type, day, ring: ring! })
        }}
      >
        <FormField label={tr("Name", "ނަން")} name="name" required>
          <TextInput defaultValue={zone?.name} autoComplete="off" />
        </FormField>
        <FormField label={tr("Name in Dhivehi", "ދިވެހި ނަން")} name="dv_name" required>
          <TextInput thaana thaanaToggle defaultValue={zone?.dvName} />
        </FormField>
        <div className="gap-4 sm:grid-cols-2 grid">
          <FormField label={tr("Zone type", "ބާވަތް")} name="type" required>
            <Select
              value={type}
              onValueChange={(v) => setType(v as ZoneType)}
              options={(Object.keys(types) as ZoneType[]).map((k) => ({ value: k, label: types[k] }))}
            />
          </FormField>
          <FormField label={tr("Service day", "ޚިދުމަތް ދޭ ދުވަސް")} name="day" required>
            <Select
              value={day}
              onValueChange={setDay}
              options={Object.entries(days).map(([value, label]) => ({ value, label }))}
            />
          </FormField>
        </div>
        <FormField label={tr("Boundary", "ބޯޑަރު")} name="boundary" required>
          <MapPolygon
            value={shape}
            onChange={setShape}
            multiple={false}
            tone={TONES[type]}
            center={zone ? ringToPath(zone.ring)[0] : { lat: 4.1745, lng: 73.509 }}
            zoom={15}
          />
        </FormField>
        <div className="gap-2 flex flex-wrap justify-end">
          <Button type="button" variant="outline" className="touch:min-h-11" onClick={() => onOpenChange(false)}>
            {tr("Cancel", "ކެންސަލް")}
          </Button>
          <SubmitButton className="touch:min-h-11">{tr("Save zone", "ސޭވް")}</SubmitButton>
        </div>
      </Form>
    </SlideOver>
  )
}

export default function ZonesPage() {
  const tr = useTr()
  const { t, locale } = useOnu()
  const { types, days } = useLabels()
  const [zones, setZones] = React.useState(ZONES)
  const [selectedId, setSelectedId] = React.useState<string | null>(null)
  const [editing, setEditing] = React.useState<Zone | "new" | null>(null)
  const [search, setSearch] = React.useState("")
  // Remount the map when zones change so it re-fits to them.
  const [mapKey, setMapKey] = React.useState(0)

  const statusMap: StatusMap = {
    waste: { tone: "info", label: types.waste },
    parking: { tone: "warning", label: types.parking },
    mooring: { tone: "success", label: types.mooring },
  }

  const q = search.trim().toLowerCase()
  const visible = zones.filter((z) => !q || z.name.toLowerCase().includes(q) || z.dvName.includes(search.trim()))
  const name = (z: Zone) => tr(z.name, z.dvName)
  const area = (z: Zone) => formatArea(polygonArea(ringToPath(z.ring)), t, locale.numberLocale)

  const remove = (zone: Zone) =>
    confirm({
      variant: "destructive",
      title: tr(`Delete ${zone.name}?`, `${zone.dvName} ފޮހެލަންވީތޯ؟`),
      description: tr(
        "Collection schedules using this zone will stop. This can't be undone.",
        "މި ސަރަހައްދު ބޭނުންކުރާ ޝެޑިއުލްތައް ހުއްޓޭނެ. އަނބުރާ ގެނެވޭނެ ގޮތެއް ނެތް.",
      ),
      onConfirm: async () => {
        await wait(600)
        setZones((all) => all.filter((z) => z.id !== zone.id))
        if (selectedId === zone.id) setSelectedId(null)
        setMapKey((k) => k + 1)
        toast.success(tr("Zone deleted", "ސަރަހައްދު ފޮހެލެވިއްޖެ"))
      },
    })

  return (
    <AdminShell
      contentWidth="wide"
      breadcrumbs={[
        { label: tr("Dashboard", "ޑޭޝްބޯޑް"), href: routes.adminRecords.dashboard },
        { label: tr("Operations", "އޮޕަރޭޝަންސް") },
        { label: tr("Zones", "ސަރަހައްދުތައް") },
      ]}
    >
      <div className="gap-6 grid">
        <PageTitle
          headingLevel={1}
          title={tr("Service zones", "ޚިދުމަތުގެ ސަރަހައްދުތައް")}
          description={tr(
            "Waste collection, parking and mooring zones in Malé City.",
            "މާލެ ސިޓީގެ ކުނި ނަގާ، ޕާކިން އަދި ދޯނި ބަނދެވޭ ސަރަހައްދުތައް.",
          )}
          action={
            <Button className="touch:min-h-11" onClick={() => setEditing("new")}>
              <Icon name="add" data-icon="inline-start" />
              {tr("New zone", "އައު ސަރަހައްދު")}
            </Button>
          }
        />

        <div className="gap-6 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-start grid">
          <MapView
            key={mapKey}
            label={tr("Zones map", "ސަރަހައްދުތަކުގެ މެޕް")}
            center={{ lat: 4.1745, lng: 73.509 }}
            zoom={15}
            className="h-80 lg:h-[34rem]"
            overlay={
              <MapLegend
                title={tr("Zone types", "ބާވަތްތައް")}
                className="top-12 start-2 p-2 shadow-sm absolute z-10 rounded-md border bg-background/90"
                items={(Object.keys(types) as ZoneType[]).map((k) => ({
                  label: types[k],
                  tone: TONES[k],
                  shape: "area" as const,
                  description: String(zones.filter((z) => z.type === k).length),
                }))}
              />
            }
          >
            {visible.map((z) => (
              <MapPolygonShape
                key={z.id}
                path={ringToPath(z.ring)}
                tone={TONES[z.type]}
                selected={z.id === selectedId}
                onClick={() => setSelectedId(z.id === selectedId ? null : z.id)}
              />
            ))}
          </MapView>

          <Card
            title={tr("Zones", "ސަރަހައްދުތައް")}
            headingLevel={2}
            actions={
              <span className="text-sm text-muted-foreground tabular-nums">
                {tr(`${visible.length} zones`, `${visible.length} ސަރަހައްދު`)}
              </span>
            }
          >
            <div className="gap-3 grid">
              <SearchBox
                aria-label={tr("Search zones", "ސަރަހައްދު ހޯދާ")}
                placeholder={tr("Search zones", "ސަރަހައްދު ހޯދާ")}
                value={search}
                onSearch={setSearch}
                landmark={false}
              />
              {visible.length ? (
                <ul className="divide-y rounded-lg border">
                  {visible.map((z) => {
                    const active = z.id === selectedId
                    return (
                      <li key={z.id} className={cn("gap-2 p-3 flex items-start", active && "bg-muted")}>
                        <button
                          type="button"
                          aria-pressed={active}
                          onClick={() => setSelectedId(active ? null : z.id)}
                          className="gap-1 min-w-0 grid flex-1 rounded-sm text-start outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                        >
                          <span className="font-medium text-sm truncate">{name(z)}</span>
                          <span className="gap-2 text-xs flex flex-wrap items-center text-muted-foreground">
                            <StatusBadge status={z.type} statusMap={statusMap} size="sm" icon={false} />
                            <span>{days[z.day]}</span>
                            <span aria-hidden>·</span>
                            <span className="tabular-nums">{area(z)}</span>
                          </span>
                        </button>
                        <ActionMenu
                          label={tr(`Actions for ${z.name}`, `${z.dvName} ގެ އެކްޝަންތައް`)}
                          items={[
                            { label: tr("Edit", "އެޑިޓް"), icon: "edit", onSelect: () => setEditing(z) },
                            {
                              label: tr("Delete", "ފޮހެލާ"),
                              icon: "trash",
                              variant: "destructive",
                              onSelect: () => void remove(z),
                            },
                          ]}
                        />
                      </li>
                    )
                  })}
                </ul>
              ) : (
                <EmptyState
                  variant={zones.length ? "no-results" : "no-records"}
                  bordered
                  noun={{ one: tr("zone", "ސަރަހައްދު"), other: tr("zones", "ސަރަހައްދުތައް") }}
                  search={search}
                  onClearSearch={() => setSearch("")}
                  action={
                    zones.length ? null : (
                      <Button onClick={() => setEditing("new")}>
                        <Icon name="add" data-icon="inline-start" />
                        {tr("New zone", "އައު ސަރަހައްދު")}
                      </Button>
                    )
                  }
                />
              )}
            </div>
          </Card>
        </div>
      </div>

      {editing ? (
        <ZoneEditor
          key={editing === "new" ? "new" : editing.id}
          zone={editing === "new" ? null : editing}
          open
          onOpenChange={(open) => !open && setEditing(null)}
          onSave={(zone) => {
            const isNew = editing === "new"
            setZones((all) => (isNew ? [...all, zone] : all.map((z) => (z.id === zone.id ? zone : z))))
            setSelectedId(zone.id)
            setEditing(null)
            setMapKey((k) => k + 1)
            toast.success(
              isNew ? tr("Zone created", "ސަރަހައްދު ހެދިއްޖެ") : tr("Zone saved", "ސަރަހައްދު ސޭވްކުރެވިއްޖެ"),
              {
                description: tr(zone.name, zone.dvName),
              },
            )
          }}
        />
      ) : null}
    </AdminShell>
  )
}
