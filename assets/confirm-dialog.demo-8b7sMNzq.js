var e=`import * as React from "react"
import { Button, ConfirmDialog, ConfirmProvider, useConfirm } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"

export const meta = {
  title: "Confirm dialog",
  group: "Overlays",
  order: 2,
  description: "Confirmation as a component or a promise (useConfirm / confirm). Destructive, typed and async.",
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

function PromiseApi() {
  const confirm = useConfirm()
  const [log, setLog] = React.useState("")
  return (
    <>
      <Button
        variant="outline"
        onClick={async () => {
          const ok = await confirm({
            title: "Delete Aishath Ali?",
            description: "She will lose access to the staff portal. This can't be undone.",
            variant: "destructive",
            onConfirm: () => wait(1200),
          })
          setLog(ok ? "Deleted Aishath Ali" : "Cancelled")
        }}
      >
        Delete with useConfirm()
      </Button>
      <Button
        variant="outline"
        onClick={async () => setLog((await confirm("Publish the notice to all islands?")) ? "Published" : "Cancelled")}
      >
        String shorthand
      </Button>
      <span role="status" className="text-sm self-center text-muted-foreground">
        {log}
      </span>
    </>
  )
}

export default function ConfirmDialogDemo() {
  return (
    <ConfirmProvider>
      <DemoPage>
        <DemoSection title="Component">
          <ConfirmDialog
            trigger={<Button variant="outline">Approve application</Button>}
            title="Approve this application?"
            description="The applicant will be notified by SMS."
            confirmLabel="Approve"
            icon="success"
          />
          <ConfirmDialog
            trigger={<Button variant="destructive">Delete 3 users</Button>}
            variant="destructive"
            title="Delete 3 selected users?"
            description="Ahmed Ali, Hawwa Ibrahim and Mohamed Naseem will be moved to the trash."
            onConfirm={() => wait(1500)}
          />
        </DemoSection>
        <DemoSection
          title="Type the name to confirm"
          description="Thaana names switch the field to the Thaana keyboard."
        >
          <ConfirmDialog
            trigger={<Button variant="destructive">Delete island</Button>}
            variant="destructive"
            title="Delete Kulhudhuffushi?"
            description="All 14 offices on this island will be removed."
            confirmText="Kulhudhuffushi"
            confirmLabel="Delete island"
          />
          <ConfirmDialog
            trigger={<Button variant="destructive">ރިޕޯޓު ފޮހެލާ</Button>}
            variant="destructive"
            title="ރިޕޯޓު ފޮހެލަންވީތޯ؟"
            confirmText="މާލެ"
          />
        </DemoSection>
        <DemoSection title="Async with failure" description="A rejected promise keeps the dialog open with an error.">
          <ConfirmDialog
            trigger={<Button variant="outline">Sync with eFaas</Button>}
            title="Sync 1,204 records?"
            confirmLabel="Sync"
            onConfirm={async () => {
              await wait(1000)
              throw new Error("The server didn't respond. Try again in a minute.")
            }}
          />
        </DemoSection>
        <DemoSection title="Promise API">
          <PromiseApi />
        </DemoSection>
      </DemoPage>
    </ConfirmProvider>
  )
}
`;export{e as default};