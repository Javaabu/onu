var e=`import { Autocomplete, FormField } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"

export const meta = {
  title: "Autocomplete",
  group: "Text inputs",
  order: 16,
  description: "Free text with suggestions from a list or an API (WAI-ARIA combobox).",
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
`;export{e as default};