import { Button, toast } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"

export const meta = {
  title: "Toast",
  group: "Display and feedback",
  order: 11,
  description: "sonner with Onu icons, theme, Dhivehi font and RTL-aware positions (the app renders one <Toaster />).",
}

const wait = (ms: number) => new Promise<string>((resolve) => setTimeout(() => resolve("id-card.pdf"), ms))

export default function ToastDemo() {
  return (
    <DemoPage>
      <DemoSection title="Types">
        <Button variant="outline" onClick={() => toast("Draft saved")}>
          Default
        </Button>
        <Button variant="outline" onClick={() => toast.success("User saved", { description: "Aishath Shiuna" })}>
          Success
        </Button>
        <Button variant="outline" onClick={() => toast.error("Payment failed", { description: "Card declined." })}>
          Error
        </Button>
        <Button variant="outline" onClick={() => toast.warning("Session expires in 2 minutes")}>
          Warning
        </Button>
        <Button variant="outline" onClick={() => toast.info("3 new applications")}>
          Info
        </Button>
      </DemoSection>
      <DemoSection title="Promise and actions">
        <Button
          variant="outline"
          onClick={() =>
            toast.promise(wait(1500), {
              loading: "Uploading…",
              success: (file) => `${file} uploaded`,
              error: "Upload failed",
            })
          }
        >
          Promise
        </Button>
        <Button
          variant="outline"
          onClick={() => toast("Moved to trash", { action: { label: "Undo", onClick: () => toast("Restored") } })}
        >
          With action
        </Button>
        <Button variant="outline" onClick={() => toast.success("ސޭވްކުރެވިއްޖެ", { description: "އަޙްމަދު ޢަލީ" })}>
          Dhivehi
        </Button>
      </DemoSection>
    </DemoPage>
  )
}
