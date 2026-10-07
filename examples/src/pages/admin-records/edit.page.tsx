import * as React from "react"
import {
  Card,
  describeChanges,
  Form,
  FormField,
  PasswordInput,
  SaveBar,
  SubmitButton,
  toast,
  ValidationError,
} from "@javaabu/onu"

import { useTr } from "../_shared/i18n"
import { AdminShell } from "../_shared/shells"
import { updateApplication, useLabels, wait, type Application } from "./_data"
import { RecordNotFound, RecordTitle } from "./_details"
import {
  ApplicationFields,
  fieldFormat,
  fieldLabels,
  fromValues,
  toValues,
  useHashLinkGuard,
  useOthers,
  validate,
  type ApplicationValues,
} from "./_form"
import { recordCrumbs, RecordHeader, recordTabs, useRecord } from "./_ui"

export const meta = {
  title: "Edit form",
  group: "Admin: records",
  layout: "bare",
  order: 7,
}

export default function EditPage() {
  const tr = useTr()
  const record = useRecord()
  if (!record) return <RecordNotFound />
  const tabs = recordTabs(record, tr)
  return (
    <AdminShell contentWidth="wide" breadcrumbs={recordCrumbs(tr, record, tr("Edit", "އެޑިޓް"))}>
      <div className="gap-6 grid">
        <RecordHeader
          title={<RecordTitle record={record} />}
          description={tr(
            "Edit the application. Changes are listed in the save bar.",
            "އެޕްލިކޭޝަން އެޑިޓްކުރައްވާ. ބަދަލުތައް ސޭވް ބާރުގައި ފެންނާނެ.",
          )}
          tabs={tabs}
          currentHref={tabs[1]!.href}
        />
        {/* Remount per record so the form starts from that record's saved values. */}
        <EditForm key={record.id} record={record} />
        <PortalPasswordCard record={record} />
      </div>
    </AdminShell>
  )
}

function EditForm({ record }: { record: Application }) {
  const tr = useTr()
  const labels = useLabels()
  const others = useOthers(record.id)
  const [saved, setSaved] = React.useState<ApplicationValues>(() => toValues(record))
  const [values, setValues] = React.useState<ApplicationValues>(saved)
  const changes = describeChanges(saved, values, fieldLabels(tr), fieldFormat(labels))
  const leaveDialog = useHashLinkGuard(changes.length > 0)

  return (
    <Form
      onSubmit={async () => {
        await wait(900)
        validate(values, tr, others)
        updateApplication(record.id, fromValues(values))
        setSaved(values)
      }}
      onSuccess={() =>
        toast.success(tr("Application saved", "އެޕްލިކޭޝަން ސޭވްކުރެވިއްޖެ"), { description: record.reference })
      }
      summaryTitle={tr("Some fields need attention", "ބައެއް ފީލްޑުތަކުގައި މައްސަލަ ހުރި")}
    >
      <div className="gap-6 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start grid">
        <div className="gap-6 min-w-0 grid">
          <ApplicationFields
            values={values}
            onChange={(patch) => setValues((v) => ({ ...v, ...patch }))}
            labels={labels}
          />
        </div>
        <SaveBar
          changes={changes}
          onDiscard={() => setValues(saved)}
          successMessage={tr("Application saved", "އެޕްލިކޭޝަން ސޭވްކުރެވިއްޖެ")}
          title={tr("Unsaved changes", "ސޭވްނުކުރާ ބަދަލުތައް")}
          saveLabel={tr("Save", "ސޭވްކުރޭ")}
          discardLabel={tr("Discard", "ދޫކޮށްލާ")}
        />
      </div>
      {leaveDialog}
    </Form>
  )
}

/** An independent section with its own Save button, outside the main save bar (§25.9). */
function PortalPasswordCard({ record }: { record: Application }) {
  const tr = useTr()
  const labels = useLabels()
  const formRef = React.useRef<HTMLFormElement>(null)
  return (
    <Card
      headingLevel={2}
      title={tr("Applicant portal password", "އެޕްލިކަންޓްގެ ޕޯޓަލް ޕާސްވޯޑް")}
      description={tr(
        `Set a new eServices password for ${labels.name(record)}. Saved on its own, separately from the form above.`,
        `${labels.name(record)} ގެ އީ ސަރވިސަސް ޕާސްވޯޑް ބަދަލުކުރައްވާ. މަތީގައިވާ ފޯމާ ވަކިން ސޭވްކުރެވޭނެ.`,
      )}
      className="lg:max-w-[calc(100%-19.5rem)]"
    >
      <Form
        ref={formRef}
        onSubmit={async (values) => {
          await wait(800)
          const v = values as Record<string, string>
          const errors: Record<string, string> = {}
          if ((v.password ?? "").length < 12)
            errors.password = tr(
              "The password must be at least 12 characters.",
              "ޕާސްވޯޑުގައި މަދުވެގެން 12 އަކުރު ހުންނަން ޖެހޭ.",
            )
          if (v.password !== v.password_confirmation)
            errors.password_confirmation = tr("The passwords don't match.", "ޕާސްވޯޑު ދެކޮޅު ދިމައެއް ނުވޭ.")
          if (Object.keys(errors).length) throw new ValidationError(errors)
          formRef.current?.reset()
          toast.success(tr("Password changed", "ޕާސްވޯޑް ބަދަލުކުރެވިއްޖެ"))
        }}
        summary={false}
      >
        <div className="gap-4 sm:grid-cols-2 grid">
          <FormField
            label={tr("New password", "އައު ޕާސްވޯޑް")}
            name="password"
            required
            help={tr("At least 12 characters", "މަދުވެގެން 12 އަކުރު")}
          >
            <PasswordInput strength autoComplete="new-password" />
          </FormField>
          <FormField label={tr("Confirm password", "ޕާސްވޯޑް ކަށަވަރުކުރޭ")} name="password_confirmation" required>
            <PasswordInput autoComplete="new-password" />
          </FormField>
        </div>
        <div className="mt-4">
          <SubmitButton variant="outline">{tr("Change password", "ޕާސްވޯޑް ބަދަލުކުރޭ")}</SubmitButton>
        </div>
      </Form>
    </Card>
  )
}
