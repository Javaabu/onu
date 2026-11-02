var e=`import * as React from "react"
import { Button, ForbiddenPage, Icon, Modal, FormField, Textarea, toast } from "@javaabu/onu"

import { useTr } from "../_shared/i18n"
import { routes } from "../_shared/routes"
import { AdminShell } from "../_shared/shells"

export const meta = { title: "403 Forbidden", group: "System", layout: "bare", order: 1 }

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))

export default function ForbiddenSamplePage() {
  const tr = useTr()
  const [open, setOpen] = React.useState(false)
  const [sending, setSending] = React.useState(false)
  const [requested, setRequested] = React.useState(false)

  return (
    <AdminShell
      breadcrumbs={[
        { label: tr("Dashboard", "ޑޭޝްބޯޑް"), href: routes.adminRecords.dashboard },
        { label: tr("Roles", "ރޯލްތައް"), href: routes.adminSettings.roles },
        { label: tr("Access denied", "ހުއްދަ ނެތް") },
      ]}
    >
      <ForbiddenPage
        as="div"
        homeHref={routes.adminRecords.dashboard}
        message={tr(
          "Your role (Counter staff) can't manage roles and permissions. Ask an administrator for access, or go back to your dashboard.",
          "ތިޔަ ރޯލް (ކައުންޓަރު މުވައްޒަފު) އަށް ރޯލްތަކާއި ހުއްދަތައް ބެލެހެއްޓޭކަށް ނުވޭ. އެޑްމިނިސްޓްރޭޓަރަކާ ހުއްދައަށް އެދިވަޑައިގަންނަވާ، ނުވަތަ ޑޭޝްބޯޑަށް ވަޑައިގަންނަވާ.",
        )}
        extraActions={
          <Button variant="outline" className="touch:h-11" disabled={requested} onClick={() => setOpen(true)}>
            <Icon name={requested ? "check" : "key"} data-icon="inline-start" />
            {requested ? tr("Access requested", "ހުއްދައަށް އެދިއްޖެ") : tr("Request access", "ހުއްދައަށް އެދޭ")}
          </Button>
        }
      />
      <Modal
        open={open}
        onOpenChange={setOpen}
        title={tr("Request access", "ހުއްދައަށް އެދުން")}
        description={tr(
          "Your request goes to the administrators of the Ministry of Services.",
          "މި އެދުން ފޮނުވޭނީ ޚިދުމަތްތަކުގެ ވުޒާރާގެ އެޑްމިނިސްޓްރޭޓަރުންނަށް.",
        )}
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>
              {tr("Cancel", "ކެންސަލް")}
            </Button>
            <Button
              disabled={sending}
              onClick={async () => {
                setSending(true)
                await wait(800)
                setSending(false)
                setOpen(false)
                setRequested(true)
                toast.success(tr("Request sent", "އެދުން ފޮނުވިއްޖެ"), {
                  description: tr("We'll email you when it's reviewed.", "ބަލައިފިނަމަ އީމެއިލް ކުރާނަން."),
                })
              }}
            >
              {sending ? <Icon name="loading" data-icon="inline-start" className="animate-spin" /> : null}
              {tr("Send request", "ފޮނުވާ")}
            </Button>
          </>
        }
      >
        <FormField label={tr("Why do you need access?", "ހުއްދަ ބޭނުންވާ ސަބަބު")} name="reason">
          <Textarea
            rows={3}
            defaultValue={tr(
              "I cover the roles desk on Thursdays.",
              "ބުރާސްފަތި ދުވަހު ރޯލްތަކުގެ މަސައްކަތް ކުރަނީ އަހަރެން.",
            )}
          />
        </FormField>
      </Modal>
    </AdminShell>
  )
}
`;export{e as default};