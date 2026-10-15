import * as React from "react"
import { FormField, TextInput, Wizard } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"
import { useDhivehi } from "./_demo-nav"

export const meta = {
  title: "Wizard",
  group: "Layout and navigation",
  order: 18,
  description:
    "Multi-step flow: step list with status, Back/Next with per-step validation, jumping back to completed steps, a compact header on phones, and announced step changes.",
}

export default function WizardDemo() {
  const dv = useDhivehi()
  const [name, setName] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)
  const [done, setDone] = React.useState(false)

  const steps = [
    {
      id: "applicant",
      title: dv ? "އެޕްލިކަންޓް" : "Applicant",
      description: dv ? "ހުށަހަޅާ މީހާ" : "Who is applying",
      validate: async () => {
        await new Promise((r) => setTimeout(r, 400))
        const ok = name.trim().length > 1
        setError(ok ? null : dv ? "ނަން ލިޔުއްވާ" : "Enter the applicant's name")
        return ok
      },
      content: (
        <FormField label={dv ? "ފުރިހަމަ ނަން" : "Full name"} error={error} required className="max-w-sm">
          <TextInput
            value={name}
            onChange={(e) => setName(e.target.value)}
            thaana={dv}
            placeholder={dv ? "އަޙްމަދު ޢަލީ" : "Ahmed Ali"}
          />
        </FormField>
      ),
    },
    {
      id: "address",
      title: dv ? "އެޑްރެސް" : "Address",
      description: dv ? "ރަށާއި ގެ" : "Island and house",
      content: (
        <div className="gap-4 max-w-sm grid">
          <FormField label={dv ? "ރަށް" : "Island"}>
            <TextInput defaultValue={dv ? "ހުޅުމާލެ" : "Hulhumalé"} />
          </FormField>
          <FormField label={dv ? "ގޭގެ ނަން" : "House"}>
            <TextInput defaultValue="Lot 10234" />
          </FormField>
        </div>
      ),
    },
    {
      id: "documents",
      title: dv ? "ލިޔުންތައް" : "Documents",
      optional: true,
      content: <p className="text-sm text-muted-foreground">{dv ? "ލިޔުމެއް ނެތް" : "No documents uploaded."}</p>,
    },
    {
      id: "review",
      title: dv ? "ރިވިއު" : "Review",
      content: (
        <p className="text-sm">
          {dv ? "ފީ: 50 ރުފިޔާ" : "Fee: MVR 50.00"} — {name || "—"}
        </p>
      ),
    },
  ]

  return (
    <DemoPage>
      <DemoSection title="Application" className="block">
        {done ? (
          <p className="text-sm font-medium text-success">{dv ? "ހުށަހެޅިއްޖެ!" : "Application submitted."}</p>
        ) : (
          <Wizard steps={steps} onComplete={() => setDone(true)} finishLabel={dv ? "ހުށަހަޅާ" : "Submit"} />
        )}
      </DemoSection>
      <DemoSection title="Vertical, non-linear" className="block">
        <Wizard
          steps={steps.map((s) => ({ ...s, validate: undefined }))}
          orientation="vertical"
          linear={false}
          errorSteps={["address"]}
        />
      </DemoSection>
    </DemoPage>
  )
}
