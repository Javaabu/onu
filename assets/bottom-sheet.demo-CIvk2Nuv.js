var e=`import * as React from "react"
import { BottomSheet, BottomSheetClose, Button, Checkbox, Label } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"

export const meta = {
  title: "Bottom sheet",
  group: "Overlays",
  order: 4,
  description: "Pull-up drawer with snap points and drag to dismiss, plus button and Escape alternatives.",
}

const islands = ["Malé", "Hulhumalé", "Addu City", "Fuvahmulah", "Kulhudhuffushi", "Thinadhoo", "Naifaru"]

export default function BottomSheetDemo() {
  const [open, setOpen] = React.useState(false)
  return (
    <DemoPage>
      <DemoSection title="Basic" description="Drag the handle down, press Escape or use × to close.">
        <BottomSheet
          trigger={<Button>Filter by island</Button>}
          title="Filter by island"
          description="Show offices on these islands."
          footer={
            <>
              <BottomSheetClose asChild>
                <Button variant="outline">Clear</Button>
              </BottomSheetClose>
              <BottomSheetClose asChild>
                <Button>Apply</Button>
              </BottomSheetClose>
            </>
          }
        >
          <div className="gap-1 grid">
            {islands.map((island) => (
              <Label key={island} className="gap-3 py-2 font-normal touch:min-h-11 flex items-center">
                <Checkbox defaultChecked={island === "Malé"} />
                {island}
              </Label>
            ))}
          </div>
        </BottomSheet>
      </DemoSection>

      <DemoSection
        title="Snap points"
        description="Opens at 40%, drag up (or press the expand button) for full height."
      >
        <BottomSheet
          trigger={<Button variant="outline">Route details</Button>}
          title="Malé → Hulhumalé ferry"
          snapPoints={[0.4, 1]}
        >
          {Array.from({ length: 24 }, (_, i) => (
            <p key={i} className="py-2 text-sm border-b">
              Departure {String(6 + Math.floor(i / 2)).padStart(2, "0")}:{i % 2 ? "30" : "00"} · MVR 10.00
            </p>
          ))}
        </BottomSheet>
      </DemoSection>

      <DemoSection title="Controlled, not dismissible">
        <Button variant="secondary" onClick={() => setOpen(true)}>
          Accept terms
        </Button>
        <BottomSheet
          open={open}
          onOpenChange={setOpen}
          dismissible={false}
          closeButton={false}
          title="Terms of service"
          footer={<Button onClick={() => setOpen(false)}>I agree</Button>}
        >
          <p>You must accept the terms to continue using the citizen portal.</p>
        </BottomSheet>
      </DemoSection>

      <DemoSection title="ދިވެހި">
        <BottomSheet trigger={<Button variant="outline">ރަށް ޚިޔާރުކުރޭ</Button>} title="ރަށް ޚިޔާރުކުރޭ">
          <p>މާލެ، ހުޅުމާލެ، އައްޑޫ ސިޓީ</p>
        </BottomSheet>
      </DemoSection>
    </DemoPage>
  )
}
`;export{e as default};