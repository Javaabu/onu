import * as React from "react"
import { useNavigate } from "react-router"
import { describeChanges, Form, SaveBar, toast } from "@javaabu/onu"

import { useTr } from "../_shared/i18n"
import { routes } from "../_shared/routes"
import { AdminShell } from "../_shared/shells"
import { addApplication, showHref, TODAY, useLabels, wait, type Application } from "./_data"
import {
  ApplicationFields,
  EMPTY_VALUES,
  fieldFormat,
  fieldLabels,
  fromValues,
  useOthers,
  validate,
  type ApplicationValues,
} from "./_form"
import { RecordHeader, recordTabs } from "./_ui"

export const meta = {
  title: "Create form",
  group: "Admin: records",
  layout: "bare",
  order: 6,
}

export default function CreatePage() {
  const tr = useTr()
  const labels = useLabels()
  const navigate = useNavigate()
  const others = useOthers()
  const [values, setValues] = React.useState<ApplicationValues>(EMPTY_VALUES)
  const changes = describeChanges(EMPTY_VALUES, values, fieldLabels(tr), fieldFormat(labels))
  const tabs = recordTabs(null, tr, { disabled: true })
  const created = React.useRef<Application | null>(null)

  return (
    <AdminShell
      contentWidth="wide"
      breadcrumbs={[
        { label: tr("Applications", "އެޕްލިކޭޝަންތައް"), href: routes.adminRecords.indexTable },
        { label: tr("New application", "އައު އެޕްލިކޭޝަން") },
      ]}
    >
      <div className="gap-6 grid">
        <RecordHeader
          title={tr("New application", "އައު އެޕްލިކޭޝަން")}
          description={tr(
            "Record an application received at the counter. The other tabs open once it is saved.",
            "ކައުންޓަރަށް ލިބުނު އެޕްލިކޭޝަނެއް ރެކޯޑުކުރައްވާ. ސޭވްކުރުމުން އެހެން ޓެބްތައް ހުޅުވޭނެ.",
          )}
          tabs={tabs}
          currentHref=""
        />
        <Form
          onSubmit={async () => {
            await wait(900)
            validate(values, tr, others)
            created.current = addApplication({
              ...(fromValues(values) as Omit<Application, "id" | "reference">),
              submitted: TODAY,
              updated: TODAY,
              documents: 0,
              deletedAt: null,
            })
          }}
          onSuccess={() => {
            const record = created.current
            if (!record) return
            // Saved: nothing is unsaved any more, so the guard lets us leave.
            setValues(EMPTY_VALUES)
            toast.success(tr("Application created", "އެޕްލިކޭޝަން އުފެއްދިއްޖެ"), { description: record.reference })
            setTimeout(() => void navigate(showHref(record.id)), 0)
          }}
          summaryTitle={tr("Some fields need attention", "ބައެއް ފީލްޑުތަކުގައި މައްސަލަ ހުރި")}
        >
          <div className="gap-6 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start grid">
            <div className="gap-6 min-w-0 grid">
              <ApplicationFields
                values={values}
                onChange={(patch) => setValues((v) => ({ ...v, ...patch }))}
                labels={labels}
                showStatus={false}
              />
            </div>
            <SaveBar
              changes={changes}
              onDiscard={() => setValues(EMPTY_VALUES)}
              title={tr("New application", "އައު އެޕްލިކޭޝަން")}
              saveLabel={tr("Create application", "އެޕްލިކޭޝަން އުފައްދާ")}
              discardLabel={tr("Clear", "ފޮހެލާ")}
              successMessage={tr("Application created", "އެޕްލިކޭޝަން އުފެއްދިއްޖެ")}
            />
          </div>
        </Form>
      </div>
    </AdminShell>
  )
}
