var e=`import * as React from "react"
import { useNavigate } from "react-router"
import {
  Button,
  Callout,
  Card,
  DescriptionList,
  DescriptionListItem,
  Divider,
  FileInput,
  FormField,
  Icon,
  LinkButton,
  Modal,
  PageTitle,
  RadioGroup,
  Spinner,
  TextInput,
  toast,
} from "@javaabu/onu"

import { CitizenShell } from "../_shared/shells"
import { useTr } from "../_shared/i18n"
import { routes } from "../_shared/routes"
import { fakeUpload, order, useFormat, wait } from "./_data"

export const meta = { title: "Payment checkout", group: "Applications and workflows", layout: "bare", order: 5 }

type GatewayState = "idle" | "open" | "processing"
type PaymentMethodId = "bml-transfer" | "bml-connect"

export default function CheckoutPage() {
  const tr = useTr()
  const { money } = useFormat()
  const navigate = useNavigate()

  const [method, setMethod] = React.useState<PaymentMethodId>()
  const [methodError, setMethodError] = React.useState<string | null>(null)
  const [slip, setSlip] = React.useState<string | null>(null)
  const [slipError, setSlipError] = React.useState<string | null>(null)
  const [transferRef, setTransferRef] = React.useState("")
  const [submitting, setSubmitting] = React.useState(false)
  const [transferSent, setTransferSent] = React.useState(false)
  const [gateway, setGateway] = React.useState<GatewayState>("idle")
  const [declined, setDeclined] = React.useState(false)

  const pay = async (e: React.FormEvent) => {
    e.preventDefault()
    setDeclined(false)
    if (!method) {
      setMethodError(tr("Choose how you'd like to pay.", "ފައިސާ ދައްކާނެ ގޮތެއް ހޮވާ."))
      return
    }
    if (method === "bml-connect") {
      setGateway("open")
      return
    }
    if (!slip) {
      setSlipError(tr("Upload the transfer slip.", "ޓްރާންސްފަރ ސްލިޕް އަޕްލޯޑްކުރައްވާ."))
      return
    }
    setSubmitting(true)
    await wait(1000)
    setSubmitting(false)
    setTransferSent(true)
    toast.success(tr("Transfer submitted", "ޓްރާންސްފަރ ހުށަހެޅިއްޖެ"), {
      description: tr("We'll confirm it within 1 working day.", "1 ބުރަސްފަތި ދުވަހުގެ ތެރޭގައި ކަށަވަރުކޮށްދޭނަން."),
    })
  }

  const approveGateway = async () => {
    setGateway("processing")
    await wait(1500)
    setGateway("idle")
    toast.success(tr("Payment successful", "ފައިސާ ދެއްކުން ކާމިޔާބު"), { description: money(order.total) })
    navigate(routes.applications.receipt)
  }

  return (
    <CitizenShell
      breadcrumbs={[
        { label: tr("My payments", "ފައިސާ ދެއްކުންތައް"), href: routes.citizen.payments },
        { label: tr("Checkout", "ފައިސާ ދެއްކުން") },
      ]}
    >
      <div className="gap-6 max-w-5xl relative grid grid-cols-1 overflow-x-clip">
        <PageTitle
          title={tr("Pay for your application", "އެޕްލިކޭޝަނުގެ ފީ ދެއްކުން")}
          description={\`\${order.ref} · \${order.application}\`}
          links={[{ label: tr("My payments", "ފައިސާ ދެއްކުންތައް"), href: routes.citizen.payments, icon: "back" }]}
        />

        {declined ? (
          <Callout
            variant="destructive"
            title={tr("Payment declined", "ފައިސާ ދެއްކުން ނާކާމިޔާބު")}
            description={tr(
              "Your bank declined the card. No money was taken. Try again or pay by transfer.",
              "ބޭންކުން ކާޑު ގަބޫލެއް ނުކުރި. ފައިސާއެއް ނުކެނޑޭ. އަލުން މަސައްކަތްކުރައްވާ ނުވަތަ ޓްރާންސްފަރ ކުރައްވާ.",
            )}
          />
        ) : null}

        <div className="gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] grid items-start">
          <Card headingLevel={2} title={tr("Payment method", "ފައިސާ ދައްކާ ގޮތް")}>
            {transferSent ? (
              <Callout
                variant="success"
                title={tr("Transfer submitted for verification", "ޓްރާންސްފަރ ޗެކްކުރުމަށް ހުށަހެޅިއްޖެ")}
                description={tr(
                  "We'll email your receipt once the Ministry confirms the transfer.",
                  "ވުޒާރާއިން ޓްރާންސްފަރ ކަށަވަރުކުރުމުން ރަސީދު އީމެއިލްކުރާނަން.",
                )}
                actions={
                  <LinkButton href={routes.citizen.payments} size="sm" variant="outline">
                    {tr("Go to My payments", "ފައިސާ ދެއްކުންތަކަށް")}
                  </LinkButton>
                }
              />
            ) : (
              <form noValidate onSubmit={pay} className="gap-6 grid">
                <FormField
                  label={tr("How would you like to pay?", "ފައިސާ ދައްކާނީ ކިހިނެއް؟")}
                  error={methodError}
                  required
                >
                  <RadioGroup
                    variant="card"
                    value={method}
                    onValueChange={(m) => {
                      setMethod(m as PaymentMethodId)
                      setMethodError(null)
                    }}
                    options={[
                      {
                        value: "bml-transfer",
                        label: tr("Bank transfer", "ބޭންކް ޓްރާންސްފަރ"),
                        description: tr(
                          "Transfer to the Ministry's BML account, then upload the slip.",
                          "ވުޒާރާގެ ބީއެމްއެލް އެކައުންޓަށް ޓްރާންސްފަރކޮށް، ސްލިޕް އަޕްލޯޑްކުރައްވާ.",
                        ),
                        media: <Icon name="bank" className="size-6 text-muted-foreground" />,
                      },
                      {
                        value: "bml-connect",
                        label: tr("Card", "ކާޑު"),
                        description: tr(
                          "Pay online by Visa, Mastercard or Amex through BML Connect.",
                          "ބީއެމްއެލް ކަނެކްޓް މެދުވެރިކޮށް ކާޑުން އޮންލައިންކޮށް ދައްކަވާ.",
                        ),
                        media: <Icon name="credit-card" className="size-6 text-muted-foreground" />,
                      },
                    ]}
                  />
                </FormField>

                {method === "bml-transfer" ? (
                  <div className="gap-5 grid">
                    <Callout appearance="bordered" variant="info">
                      {tr(
                        "Transfer the exact amount from any BML account, then upload the slip.",
                        "ބީއެމްއެލްގެ ކޮންމެ އެކައުންޓަކުން ފީގެ ޢަދަދު ޓްރާންސްފަރކޮށް، ސްލިޕް އަޕްލޯޑްކުރައްވާ.",
                      )}
                    </Callout>
                    <DescriptionList layout="inline" striped>
                      <DescriptionListItem label={tr("Bank", "ބޭންކު")}>
                        {tr("Bank of Maldives", "ބޭންކް އޮފް މޯލްޑިވްސް")}
                      </DescriptionListItem>
                      <DescriptionListItem label={tr("Account name", "އެކައުންޓުގެ ނަން")}>
                        {tr("Ministry of Economic Development", "އިޤްތިޞާދީ ތަރައްޤީއާ ބެހޭ ވުޒާރާ")}
                      </DescriptionListItem>
                      <DescriptionListItem
                        label={tr("Account number", "އެކައުންޓް ނަންބަރު")}
                        copyable
                        copyValue="7730000123456"
                      >
                        <span dir="ltr" className="tabular-nums">
                          7730 0001 23456
                        </span>
                      </DescriptionListItem>
                      <DescriptionListItem label={tr("Amount", "ޢަދަދު")} copyable copyValue={order.total.toFixed(2)}>
                        <span className="tabular-nums">{money(order.total)}</span>
                      </DescriptionListItem>
                      <DescriptionListItem
                        label={tr("Remarks to add", "ރިމާކްސްގައި ލިޔުއްވާ")}
                        copyable
                        copyValue={order.ref}
                      >
                        {order.ref}
                      </DescriptionListItem>
                    </DescriptionList>
                    <FormField
                      label={tr("Transfer slip", "ޓްރާންސްފަރ ސްލިޕް")}
                      help={tr(
                        "Screenshot or PDF from BML mobile banking.",
                        "ބީއެމްއެލް މޯބައިލް ބޭންކިންގެ ސްކްރީންޝޮޓް ނުވަތަ PDF.",
                      )}
                      error={slipError}
                      required
                    >
                      <FileInput
                        upload={fakeUpload}
                        accept="image/*,.pdf"
                        maxSize={5 * 1024 * 1024}
                        onUploaded={(item) => {
                          setSlip(item.file.name)
                          setSlipError(null)
                        }}
                        onItemsChange={(items) => {
                          if (!items.some((i) => i.status === "success")) setSlip(null)
                        }}
                      />
                    </FormField>
                    <FormField
                      label={tr("Transaction reference", "ޓްރާންޒެކްޝަން ރެފަރެންސް")}
                      help={tr("Optional. Speeds up verification.", "ލާޒިމެއް ނޫން. އަވަހަށް ޗެކްކުރެވޭނެ.")}
                    >
                      <TextInput
                        value={transferRef}
                        onChange={(e) => setTransferRef(e.target.value)}
                        dir="ltr"
                        placeholder="BLAZ12345678"
                      />
                    </FormField>
                    <div>
                      <Button type="submit" loading={submitting} startIcon="send">
                        {tr("I've made the transfer", "ޓްރާންސްފަރ ކޮށްފީމު")}
                      </Button>
                    </div>
                  </div>
                ) : method === "bml-connect" ? (
                  <div className="gap-4 grid">
                    <Callout appearance="bordered" variant="info" icon="lock">
                      {tr(
                        "You'll go to BML Connect's secure page to pay by Visa, Mastercard or American Express.",
                        "ވިސާ، މާސްޓަކާޑް ނުވަތަ އެމެކްސް ކާޑުން ފައިސާ ދެއްކުމަށް ބީއެމްއެލް ކަނެކްޓްގެ ރައްކާތެރި ސަފްހާއަށް ދާނެ.",
                      )}
                    </Callout>
                    <div>
                      <Button type="submit" startIcon="credit-card">
                        {tr(\`Pay \${money(order.total)}\`, \`\${money(order.total)} ދައްކާ\`)}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <Button type="submit">{tr("Continue", "ކުރިއަށް")}</Button>
                  </div>
                )}
              </form>
            )}
          </Card>

          <Card headingLevel={2} title={tr("Order summary", "އޯޑަރުގެ ޚުލާޞާ")} className="lg:sticky lg:top-20">
            <div className="gap-3 text-sm grid">
              {order.items.map((item) => (
                <div key={item.label[0]} className="gap-4 flex justify-between">
                  <span>{tr(...item.label)}</span>
                  <span className="whitespace-nowrap tabular-nums">{money(item.amount)}</span>
                </div>
              ))}
              <div className="gap-4 flex justify-between text-muted-foreground">
                <span>{tr("GST (exempt)", "ޖީއެސްޓީ (އިސްތިސްނާ)")}</span>
                <span className="tabular-nums">{money(0)}</span>
              </div>
              <Divider />
              <div className="gap-4 text-base font-semibold flex justify-between">
                <span>{tr("Total", "ޖުމްލަ")}</span>
                <span className="tabular-nums">{money(order.total)}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {tr("Invoice", "އިންވޮއިސް")} {order.ref} · {tr("Due 14 Oct 2026", "14 އޮކްޓޫބަރު 2026 ގެ ކުރިން")}
              </p>
            </div>
          </Card>
        </div>
      </div>

      <Modal
        open={gateway !== "idle"}
        onOpenChange={(open) => {
          if (!open && gateway === "open") setGateway("idle")
        }}
        title={tr("BML Connect (simulated)", "ބީއެމްއެލް ކަނެކްޓް (ސިމިއުލޭޝަން)")}
        description={tr(
          "A stand-in for the bank's payment page. No real card is charged.",
          "ބޭންކުގެ ސަފްހާގެ ބަދަލުގައި. އެއްވެސް ކާޑަކުން ފައިސާ ނުކެނޑޭނެ.",
        )}
        size="sm"
        footer={
          gateway === "processing" ? null : (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  setGateway("idle")
                  setDeclined(true)
                }}
              >
                {tr("Decline", "ރިޖެކްޓްކުރޭ")}
              </Button>
              <Button onClick={approveGateway} startIcon="lock">
                {tr(\`Pay \${money(order.total)}\`, \`\${money(order.total)} ދައްކާ\`)}
              </Button>
            </>
          )
        }
      >
        {gateway === "processing" ? (
          <div className="gap-3 py-6 flex flex-col items-center" role="status">
            <Spinner size="lg" />
            <p className="text-sm">{tr("Authorising your card…", "ކާޑު ޗެކްކުރަނީ…")}</p>
          </div>
        ) : (
          <div className="gap-4 grid">
            <DescriptionList
              items={[
                {
                  label: tr("Merchant", "ވިޔަފާރިވެރިޔާ"),
                  value: tr("Ministry of Economic Development", "އިޤްތިޞާދީ ތަރައްޤީއާ ބެހޭ ވުޒާރާ"),
                },
                { label: tr("Order", "އޯޑަރު"), value: order.ref },
                {
                  label: tr("Amount", "ޢަދަދު"),
                  value: <strong className="tabular-nums">{money(order.total)}</strong>,
                },
                { label: tr("Card", "ކާޑު"), value: <span dir="ltr">Visa •••• 4242</span> },
              ]}
            />
          </div>
        )}
      </Modal>
    </CitizenShell>
  )
}
`;export{e as default};