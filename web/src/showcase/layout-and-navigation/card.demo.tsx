import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Form,
  FormField,
  FormGroup,
  Icon,
  LinkButton,
  SubmitButton,
  TextInput,
  Textarea,
} from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"
import { DemoNav, useDhivehi } from "./_demo-nav"

export const meta = {
  title: "Card",
  group: "Layout and navigation",
  order: 13,
  description: "shadcn Card, extended with title/description/actions/footer props, link cards, form cards and asChild.",
}

export default function CardDemo() {
  const dv = useDhivehi()
  return (
    <DemoNav>
      {(current) => (
        <DemoPage>
          <DemoSection title="Header actions and footer" className="gap-4 md:grid-cols-2 grid">
            <Card
              title={dv ? "ފައިސާ ލިބުނު" : "Payments received"}
              description={dv ? "ފަހު 30 ދުވަސް" : "Last 30 days"}
              actions={
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon-sm" aria-label={dv ? "އިތުރު" : "More"}>
                      <Icon name="more" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>{dv ? "އެކްސްޕޯޓް" : "Export"}</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              }
              footer={
                <Button variant="outline" size="sm">
                  {dv ? "ހުރިހާ އެއްޗެއް ބަލާ" : "View all"}
                </Button>
              }
            >
              <p className="text-2xl font-semibold tabular-nums">MVR 48,250.00</p>
            </Card>
            <Card
              size="sm"
              variant="muted"
              title={dv ? "ކުޑަ" : "Small, muted"}
              description={dv ? "ތަފްސީލު" : "Compact spacing"}
            >
              <Badge variant="secondary">{dv ? "އެކްޓިވް" : "Active"}</Badge>
            </Card>
          </DemoSection>
          <DemoSection title="Link cards" description={current} className="gap-4 sm:grid-cols-3 grid">
            {[
              { name: dv ? "މާލެ" : "Malé", n: 4 },
              { name: dv ? "އައްޑޫ" : "Addu City", n: 6 },
              { name: dv ? "ފުވައްމުލައް" : "Fuvahmulah", n: 1 },
            ].map((c) => (
              <Card
                key={c.n}
                href={`/cities/${c.n}`}
                title={c.name}
                description={dv ? `${c.n} ރަށް` : `${c.n} islands`}
                actions={<Badge variant="outline">{c.n}</Badge>}
              />
            ))}
          </DemoSection>
          <DemoSection title="Form card" className="grid">
            <Form onSubmit={() => new Promise((r) => setTimeout(r, 1000))}>
              <Card
                width="lg"
                headingLevel={2}
                title={dv ? "އައު މުވައްޒަފެއް" : "New staff member"}
                description={
                  dv ? "ޕާސްވޯޑް ހެދުމަށް އީމެއިލް ފޮނުވޭނެ." : "They’ll receive an email invitation to set a password."
                }
                actions={<Badge variant="secondary">{dv ? "ޑްރާފްޓް" : "Draft"}</Badge>}
                footer={
                  <>
                    <LinkButton href="#/components/layout-and-navigation/card" variant="outline">
                      {dv ? "ކެންސަލް" : "Cancel"}
                    </LinkButton>
                    <SubmitButton startIcon="send">{dv ? "ދައުވަތު ފޮނުވާ" : "Send invitation"}</SubmitButton>
                  </>
                }
              >
                <FormGroup columns={2}>
                  <FormField label={dv ? "ފުރިހަމަ ނަން" : "Full name"} name="name" required>
                    <TextInput thaana={dv} defaultValue={dv ? "ހައްވާ ނަޝީދާ" : "Hawwa Nashidha"} />
                  </FormField>
                  <FormField label={dv ? "އީމެއިލް" : "Email"} name="email" required>
                    <TextInput type="email" defaultValue="nashidha@health.gov.mv" />
                  </FormField>
                  <FormField label={dv ? "ނޯޓު" : "Note"} name="note" className="col-span-full">
                    <Textarea thaana={dv} />
                  </FormField>
                </FormGroup>
              </Card>
            </Form>
          </DemoSection>
          <DemoSection
            title="Form card in a narrow column, centred and plain"
            description="The footer stacks full width; centred headers suit auth pages."
            className="gap-6 md:grid-cols-2 grid items-start"
          >
            <div className="max-w-xs w-full">
              <Card
                width="full"
                title={dv ? "ޕާސްވޯޑް ބަދަލުކުރޭ" : "Change password"}
                footer={<SubmitButton form="card-pw">{dv ? "ޕާސްވޯޑް ބަދަލުކުރޭ" : "Update password"}</SubmitButton>}
              >
                <form id="card-pw" className="gap-4 grid" onSubmit={(e) => e.preventDefault()}>
                  <FormField label={dv ? "އައު ޕާސްވޯޑް" : "New password"}>
                    <TextInput type="password" dir="ltr" />
                  </FormField>
                </form>
              </Card>
            </div>
            <Card
              width="sm"
              centered
              media={
                <div className="size-12 grid place-items-center rounded-full bg-primary/10 text-primary">
                  <Icon name="key" className="size-6" />
                </div>
              }
              title={dv ? "ވެރިފިކޭޝަން" : "Verify it’s you"}
              description={dv ? "ފޯނަށް ފޮނުވި ކޯޑު ލިޔުއްވާ." : "Enter the code we sent to your phone."}
            >
              <FormField label={dv ? "ކޯޑު" : "Code"}>
                <TextInput inputMode="numeric" dir="ltr" />
              </FormField>
            </Card>
            <Card
              variant="plain"
              width="md"
              title="ދިވެހި ފޯމު"
              description="ތިރީގައިވާ މަޢުލޫމާތު ފުރިހަމަކުރައްވާ."
              className="col-span-full"
            >
              <FormField label="ނަން">
                <TextInput thaana />
              </FormField>
            </Card>
          </DemoSection>
          <DemoSection title="Composed (shadcn API) and asChild" className="gap-4 md:grid-cols-2 grid">
            <Card>
              <CardHeader>
                <CardTitle>{dv ? "ކްލާސިކް" : "Classic composition"}</CardTitle>
                <CardDescription>CardHeader · CardContent</CardDescription>
              </CardHeader>
              <CardContent>{dv ? "ކުރީގެ ގޮތަށް" : "Works exactly like shadcn."}</CardContent>
            </Card>
            <Card
              asChild
              title={dv ? "އާޓިކަލް" : "Rendered as <article>"}
              footer={<span className="text-xs">asChild</span>}
            >
              <article>
                <CardContent>{dv ? "ތަފްސީލު" : "The child element becomes the card."}</CardContent>
              </article>
            </Card>
          </DemoSection>
        </DemoPage>
      )}
    </DemoNav>
  )
}
