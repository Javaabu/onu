var e=`import * as React from "react"
import { AutosaveIndicator, FormField, Textarea, useAutosave } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"

export const meta = {
  title: "Autosave indicator",
  group: "Form scaffolding",
  order: 12,
  description: "Idle, saving, saved (relative time) and error states, with the useAutosave hook.",
}

export default function AutosaveIndicatorDemo() {
  const [fiveMinutesAgo] = React.useState(() => Date.now() - 5 * 60_000)
  const [draft, setDraft] = React.useState("")
  const [failNext, setFailNext] = React.useState(false)
  const autosave = useAutosave(draft, {
    delay: 800,
    onSave: () =>
      new Promise<void>((resolve, reject) =>
        setTimeout(() => (failNext ? reject(new Error("offline")) : resolve()), 700),
      ),
  })

  return (
    <DemoPage>
      <DemoSection title="Live" description="Type to autosave." className="max-w-xl gap-3 grid">
        <div className="gap-3 flex items-center justify-between">
          <span className="text-sm font-medium">Draft announcement</span>
          <AutosaveIndicator {...autosave} />
        </div>
        <FormField label="Body">
          <Textarea value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Start typing…" />
        </FormField>
        <label className="gap-2 text-sm flex items-center">
          <input type="checkbox" checked={failNext} onChange={(e) => setFailNext(e.target.checked)} />
          Make saves fail
        </label>
      </DemoSection>

      <DemoSection title="States" className="gap-6 flex flex-wrap">
        <AutosaveIndicator status="idle" />
        <AutosaveIndicator status="saving" />
        <AutosaveIndicator status="saved" lastSavedAt={fiveMinutesAgo} />
        <AutosaveIndicator status="error" onRetry={() => {}} />
        <AutosaveIndicator status="saving" compact />
      </DemoSection>
    </DemoPage>
  )
}
`;export{e as default};