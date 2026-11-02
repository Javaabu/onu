var e=`import * as React from "react"
import { ApiSelect, FormField, Select, type ApiFetchContext } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"
import { atolls, fakePeopleApi, islandsByAtoll } from "./_data"

export const meta = {
  title: "API select",
  group: "Choice inputs",
  order: 4,
  description:
    "Loads options from any API: debounced search, cancelled stale requests, infinite scroll, Laravel paginators, caching.",
}

/** A fake islands endpoint that fails every other request, to show the error state. */
let calls = 0
function flakyIslands(_query: string, { params }: ApiFetchContext) {
  calls++
  return new Promise((resolve, reject) =>
    setTimeout(() => {
      if (calls % 2 === 1) reject(new Error("500 Server Error"))
      else resolve({ data: islandsByAtoll[String(params.atoll)] ?? [] })
    }, 500),
  )
}

export default function ApiSelectDemo() {
  const [atoll, setAtoll] = React.useState("S")
  return (
    <DemoPage>
      <DemoSection
        title="Search a paginated API"
        description="100 people, 10 per page. Scroll the list to load more; type to search (300ms debounce)."
        className="max-w-md gap-4 grid"
      >
        <FormField label="Applicant">
          <ApiSelect fetcher={fakePeopleApi} cacheKey="people" descriptionKey="national_id" clearable />
        </FormField>
        <FormField label="Committee members" help="Multiple values; at least 2 characters to search.">
          <ApiSelect fetcher={fakePeopleApi} cacheKey="people" multiple minChars={2} preload />
        </FormField>
        <FormField label="Edit page" help="The current value's label comes from initialOptions.">
          <ApiSelect
            fetcher={fakePeopleApi}
            cacheKey="people"
            defaultValue="42"
            initialOptions={[{ value: "42", label: "Fathimath Zahir" }]}
          />
        </FormField>
      </DemoSection>
      <DemoSection
        title="Dependent params, errors and quick-create"
        description="The first request fails: use Retry."
        className="max-w-md gap-4 grid"
      >
        <FormField label="Atoll">
          <Select options={atolls} value={atoll} onValueChange={setAtoll} />
        </FormField>
        <FormField label="Island">
          <ApiSelect
            fetcher={flakyIslands}
            cacheKey="islands"
            params={{ atoll }}
            dependsOn={atoll}
            onCreate={(label) => ({ value: label.toLowerCase(), label })}
          />
        </FormField>
      </DemoSection>
      <DemoSection title="Usage with a real endpoint" className="max-w-xl">
        <pre className="text-xs p-3 w-full overflow-x-auto rounded-lg bg-muted">
          {\`<ApiSelect
  url="/api/islands"
  params={{ atoll_id: atoll }}
  dependsOn={atoll}
  valueUrl="/api/islands/{value}"
/>\`}
        </pre>
      </DemoSection>
    </DemoPage>
  )
}
`;export{e as default};