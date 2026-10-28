var e=`import * as React from "react"
import {
  Callout,
  Fieldset,
  Form,
  FormField,
  FormGroup,
  NavTabs,
  PageTitle,
  PhoneInput,
  SaveBar,
  Select,
  TextInput,
  ValidationError,
  describeChanges,
  toast,
  useOnu,
} from "@javaabu/onu"
import {
  AddressInput,
  LocationCard,
  MapPicker,
  formatLatLng,
  type LatLng,
  type MaldivesAddress,
} from "@javaabu/onu/maps"

import { useTr } from "../_shared/i18n"
import { routes } from "../_shared/routes"
import { AdminShell } from "../_shared/shells"
import { ISLANDS, LOCATION_CATEGORIES, searchIslands, wait } from "./_data"

export const meta = { title: "Location picker", group: "Maps and operations", layout: "bare", order: 4 }

interface Values extends Record<string, unknown> {
  name: string
  dvName: string
  category: string
  phone: string
  address: MaldivesAddress
  location: LatLng | null
}

const EMPTY: Values = { name: "", dvName: "", category: "", phone: "", address: {}, location: null }

export default function LocationPickerPage() {
  const tr = useTr()
  const { t, locale } = useOnu()
  const [saved, setSaved] = React.useState<Values>(EMPTY)
  const [values, setValues] = React.useState<Values>(EMPTY)
  const [recordId, setRecordId] = React.useState<number | null>(null)
  const set = <K extends keyof Values>(key: K, value: Values[K]) => setValues((v) => ({ ...v, [key]: value }))

  const island = ISLANDS.find((i) => i.value === values.address.island)
  const categoryLabel = (value: string) => {
    const c = LOCATION_CATEGORIES.find((x) => x.value === value)
    return c ? tr(c.label, c.dv) : ""
  }
  const islandLabel = (value?: string) => {
    const i = ISLANDS.find((x) => x.value === value)
    return i ? tr(i.label, i.dvLabel ?? i.label) : (value ?? "")
  }

  const changes = describeChanges(
    saved,
    values,
    {
      name: tr("Name", "ނަން"),
      dvName: tr("Dhivehi name", "ދިވެހި ނަން"),
      category: tr("Category", "ބާވަތް"),
      phone: tr("Phone", "ފޯނު"),
      address: tr("Address", "އެޑްރެސް"),
      location: tr("Map location", "މެޕްގެ ތަން"),
    },
    {
      category: (v) => categoryLabel(String(v ?? "")),
      address: (v) => {
        const a = v as MaldivesAddress
        return [a.house, a.road, islandLabel(a.island)].filter(Boolean).join(", ")
      },
      location: (v) => (v ? formatLatLng(v as LatLng, t, locale.numberLocale, 5) : null),
    },
  )

  const tabs = [
    { label: tr("Details", "ތަފްސީލު"), href: routes.maps.locationPicker, isActive: true },
    { label: tr("Opening hours", "ހުޅުވާ ގަޑިތައް"), href: \`\${routes.maps.locationPicker}/hours\`, disabled: !recordId },
    { label: tr("Photos", "ފޮޓޯ"), href: \`\${routes.maps.locationPicker}/photos\`, disabled: !recordId },
    { label: tr("History", "ތާރީޚު"), href: \`\${routes.maps.locationPicker}/history\`, disabled: !recordId },
  ]

  return (
    <AdminShell
      contentWidth="wide"
      breadcrumbs={[
        { label: tr("Dashboard", "ޑޭޝްބޯޑް"), href: routes.adminRecords.dashboard },
        { label: tr("Service locations", "ޚިދުމަތް ދޭ ތަންތަން"), href: routes.maps.zones },
        { label: recordId ? tr(values.name, values.dvName) || \`#\${recordId}\` : tr("New", "އައު") },
      ]}
    >
      <div className="gap-6 grid">
        <PageTitle
          headingLevel={1}
          title={recordId ? tr(values.name, values.dvName) : tr("New service location", "އައު ޚިދުމަތް ދޭ ތަނެއް")}
          description={tr(
            "Where people can get government services: health centres, councils, harbours.",
            "ސަރުކާރުގެ ޚިދުމަތް ލިބޭ ތަންތަން: ހެލްތު ސެންޓަރު، ކައުންސިލް، ބަނދަރު.",
          )}
        />
        <NavTabs items={tabs} aria-label={tr("Record sections", "ރެކޯޑުގެ ބައިތައް")} />

        {recordId && values.location ? (
          <Callout
            variant="success"
            title={tr("Location saved", "ތަން ސޭވްކުރެވިއްޖެ")}
            description={tr(
              "The other tabs are now available. Keep editing below, or add opening hours next.",
              "އެހެން ޓެބްތައް ހުޅުވިއްޖެ. ތިރީގައި އެޑިޓް ކުރެވޭނެ، ނުވަތަ ހުޅުވާ ގަޑިތައް ލެއްވޭނެ.",
            )}
          />
        ) : null}

        <Form
          noValidate
          onSubmit={async () => {
            await wait(900)
            const errors: Record<string, string[]> = {}
            const need = (field: string, en: string, dv: string) => (errors[field] = [tr(en, dv)])
            if (!values.name.trim()) need("name", "The name field is required.", "ނަން ލިޔުއްވާ.")
            if (!values.dvName.trim()) need("dv_name", "The Dhivehi name field is required.", "ދިވެހި ނަން ލިޔުއްވާ.")
            if (!values.category) need("category", "Select a category.", "ބާވަތެއް ހޮއްވަވާ.")
            if (values.phone && !/^\\+960\\d{7}$/.test(values.phone))
              need("phone", "Enter a 7-digit Maldivian number.", "7 ޑިޖިޓްގެ ދިވެހި ނަންބަރެއް ލިޔުއްވާ.")
            if (!values.address.atoll) need("address.atoll", "Select the atoll.", "އަތޮޅު ހޮއްވަވާ.")
            if (!values.address.island) need("address.island", "Select the island.", "ރަށް ހޮއްވަވާ.")
            if (!values.location) need("location", "Pick the location on the map.", "މެޕުން ތަން ހޮއްވަވާ.")
            if (Object.keys(errors).length)
              throw new ValidationError({
                message: tr(
                  "The location wasn't saved. Check the highlighted fields.",
                  "ސޭވް ނުވި. ފާހަގަކުރެވިފައިވާ ބައިތައް ބައްލަވާ.",
                ),
                errors,
              })
            setSaved(values)
            setRecordId((id) => id ?? 1042)
            toast.success(tr("Location saved", "ތަން ސޭވްކުރެވިއްޖެ"), { description: tr(values.name, values.dvName) })
          }}
        >
          <div className="gap-6 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start grid">
            <div className="gap-6 min-w-0 grid">
              <Fieldset legend={tr("Details", "ތަފްސީލު")} variant="card">
                <FormGroup columns={2}>
                  <FormField label={tr("Name", "ނަން")} name="name" required>
                    <TextInput value={values.name} onChange={(e) => set("name", e.target.value)} />
                  </FormField>
                  <FormField label={tr("Name in Dhivehi", "ދިވެހި ނަން")} name="dv_name" required>
                    <TextInput
                      thaana
                      thaanaToggle
                      value={values.dvName}
                      onChange={(e) => set("dvName", e.target.value)}
                    />
                  </FormField>
                  <FormField label={tr("Category", "ބާވަތް")} name="category" required>
                    <Select
                      value={values.category}
                      onValueChange={(v) => set("category", v)}
                      placeholder={tr("Select a category", "ބާވަތެއް ހޮއްވަވާ")}
                      options={LOCATION_CATEGORIES.map((c) => ({ value: c.value, label: tr(c.label, c.dv) }))}
                    />
                  </FormField>
                  <FormField label={tr("Phone", "ފޯނު")} name="phone">
                    <PhoneInput value={values.phone} onValueChange={(v) => set("phone", v ?? "")} />
                  </FormField>
                </FormGroup>
              </Fieldset>

              <Fieldset
                legend={tr("Address", "އެޑްރެސް")}
                description={tr("Choosing the island moves the map there.", "ރަށް ހޮއްވެވުމުން މެޕް އެރަށަށް ދާނެ.")}
                variant="card"
              >
                <AddressInput
                  name="address"
                  legend={null}
                  islands={ISLANDS}
                  required
                  value={values.address}
                  onChange={(address) =>
                    setValues((v) => {
                      const next = ISLANDS.find((i) => i.value === address.island)
                      const islandChanged = address.island !== v.address.island
                      // Drop a pin on the chosen island until the user places it exactly.
                      return {
                        ...v,
                        address,
                        location: islandChanged && next?.position ? next.position : v.location,
                      }
                    })
                  }
                />
              </Fieldset>

              <Fieldset
                legend={tr("Map location", "މެޕްގެ ތަން")}
                description={tr(
                  "Drag the pin to the entrance, search for a place, or type the coordinates.",
                  "ވަދެވޭ ދޮރާ ހަމައަށް ޕިން ދަމާލައްވާ، ތަނެއް ހޯއްދަވާ، ނުވަތަ ކޯޑިނޭޓް ލިޔުއްވާ.",
                )}
                variant="card"
              >
                <FormField label={tr("Location", "ތަން")} name="location" required hideLabel>
                  <MapPicker
                    key={values.address.island ?? "none"}
                    value={values.location}
                    onChange={(p) => set("location", p)}
                    center={island?.position ?? undefined}
                    zoom={island ? 15 : 11}
                    search={searchIslands}
                  />
                </FormField>
                {values.location && recordId ? (
                  <LocationCard
                    className="mt-4"
                    position={values.location}
                    title={tr(values.name, values.dvName)}
                    address={[values.address.house, values.address.road, islandLabel(values.address.island)]
                      .filter(Boolean)
                      .join(", ")}
                  />
                ) : null}
              </Fieldset>
            </div>
            <SaveBar
              changes={changes}
              onDiscard={() => setValues(saved)}
              successMessage={tr("Location saved", "ތަން ސޭވްކުރެވިއްޖެ")}
              errorMessage={tr("The location wasn't saved.", "ސޭވް ނުވި.")}
            />
          </div>
        </Form>
      </div>
    </AdminShell>
  )
}
`;export{e as default};