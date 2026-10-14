import * as React from "react"
import { BmlConnectLogo, BmlTransferLogo, FormField, PaymentMethodSelector, type PaymentMethodId } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"

export const meta = {
  title: "Payment method selector",
  group: "Choice inputs",
  order: 15,
  description: "BML Transfer and BML Connect as large cards with BML's official logos. Selection only.",
}

export default function PaymentMethodSelectorDemo() {
  const [method, setMethod] = React.useState<PaymentMethodId>()
  return (
    <DemoPage>
      <DemoSection title="Both gateways" className="max-w-xl gap-4 grid w-full">
        <FormField label="How would you like to pay?" help={`Selected: ${method ?? "none"}`} required>
          <PaymentMethodSelector value={method} onValueChange={setMethod} />
        </FormField>
      </DemoSection>
      <DemoSection title="Configured" className="max-w-xl gap-4 grid w-full">
        <FormField label="Custom order, default and text">
          <PaymentMethodSelector
            defaultValue="bml-connect"
            size="default"
            methods={[
              {
                id: "bml-connect",
                label: { en: "Pay by card", dv: "ކާޑުން ފައިސާ ދައްކާ" },
                description: { en: "Visa, Mastercard and American Express", dv: "ވިސާ، މާސްޓަކާޑް އަދި އެމެކްސް" },
                aside: "MVR 1,250.00",
              },
              { id: "bml-transfer", disabled: true },
            ]}
          />
        </FormField>
        <FormField label="Transfer only">
          <PaymentMethodSelector methods={["bml-transfer"]} defaultValue="bml-transfer" />
        </FormField>
        <FormField label="With a project-defined method">
          <PaymentMethodSelector
            methods={["bml-transfer", { id: "cash", label: "Cash at the counter", icon: "banknote" }]}
          />
        </FormField>
      </DemoSection>
      <DemoSection
        title="Logos"
        description="BmlTransferLogo and BmlConnectLogo on their own, e.g. on a receipt. The card marks need a white tile on dark surfaces."
        className="items-center"
      >
        <BmlTransferLogo className="size-12" />
        <BmlConnectLogo className="h-12 bg-white p-1 rounded-md ring-1 ring-border" />
      </DemoSection>
    </DemoPage>
  )
}
