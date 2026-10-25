import { Autocomplete, FormField } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"

export const meta = {
  title: "Autocomplete",
  group: "Text inputs",
  order: 16,
  description:
    "Free text with suggestions from a list or an API (WAI-ARIA combobox), optionally with a toggle button and a “Use …” row (editable select).",
}

const ISLANDS = [
  "Malé",
  "Hulhumalé",
  "Vilimalé",
  "Maafushi",
  "Thulusdhoo",
  "Addu City",
  "Fuvahmulah",
  "Kulhudhuffushi",
  "Thinadhoo",
  "Naifaru",
  "Eydhafushi",
  "Dhidhdhoo",
]

const DV_ISLANDS = ["މާލެ", "ހުޅުމާލެ", "ވިލިމާލެ", "މާފުށި", "ތުލުސްދޫ", "އައްޑޫ ސިޓީ", "ފުވައްމުލައް", "ކުޅުދުއްފުށި"]

const JOBS = [
  { value: "Software Engineer", description: "Technology" },
  { value: "Senior Software Engineer", description: "Technology" },
  { value: "Customs Officer", description: "Government" },
  { value: "Ferry Captain", description: "Transport" },
  { value: "Resort Manager", description: "Tourism" },
  { value: "Marine Biologist", description: "Science" },
]

/** Simulates a server search with latency. */
async function searchJobs(query: string, { signal }: { signal: AbortSignal }) {
  await new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, 600)
    signal.addEventListener("abort", () => {
      clearTimeout(timer)
      reject(new DOMException("Aborted", "AbortError"))
    })
  })
  return JOBS.filter((j) => j.value.toLowerCase().includes(query.toLowerCase()))
}

const TITLES = [
  "Director",
  "Deputy Director",
  "Assistant Director",
  "Senior Project Officer",
  "Project Officer",
  "Intern",
]

export default function AutocompleteDemo() {
  return (
    <DemoPage>
      <DemoSection
        title="Static list"
        description="Type, then use ↑/↓ and Enter. Anything else you type is kept."
        className="max-w-md gap-4 grid"
      >
        <FormField label="Island">
          <Autocomplete suggestions={ISLANDS} placeholder="Start typing an island" />
        </FormField>
        <FormField label="ރަށް">
          <Autocomplete thaana thaanaToggle suggestions={DV_ISLANDS} openOnFocus />
        </FormField>
      </DemoSection>
      <DemoSection
        title="Async search"
        description="Debounced, cancels stale requests, shows loading."
        className="max-w-md gap-4 grid"
      >
        <FormField label="Job title">
          <Autocomplete suggestions={searchJobs} placeholder="e.g. engineer" />
        </FormField>
      </DemoSection>
      <DemoSection
        title="Editable select"
        description="showToggleButton opens the full list; showCustomOption offers “Use …” for typed text; autoHighlight lets Enter pick the first row."
        className="max-w-md gap-4 grid"
      >
        <FormField label="Job title" help="Pick a suggestion or type your own.">
          <Autocomplete
            suggestions={TITLES}
            showToggleButton
            showCustomOption
            autoHighlight
            emptyMessage="No options"
            placeholder="e.g. Director"
          />
        </FormField>
        <FormField label="Disabled" disabled>
          <Autocomplete suggestions={TITLES} showToggleButton defaultValue="Director" />
        </FormField>
        <FormField label="With error" error="Job title is required">
          <Autocomplete suggestions={TITLES} showToggleButton showCustomOption autoHighlight />
        </FormField>
        <FormField label="މަޤާމު">
          <Autocomplete
            suggestions={["ޑިރެކްޓަރ", "ޑެޕިއުޓީ ޑިރެކްޓަރ", "ޕްރޮޖެކްޓް އޮފިސަރ"]}
            thaana
            thaanaToggle
            showToggleButton
            showCustomOption
            autoHighlight
          />
        </FormField>
      </DemoSection>
      <DemoSection title="States" className="max-w-md gap-4 grid">
        <FormField label="Disabled">
          <Autocomplete suggestions={ISLANDS} disabled defaultValue="Malé" />
        </FormField>
        <FormField label="With error" error="Choose an inhabited island">
          <Autocomplete suggestions={ISLANDS} defaultValue="Kuda Bandos" />
        </FormField>
      </DemoSection>
    </DemoPage>
  )
}
