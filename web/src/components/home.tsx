import * as React from "react"
import { Link } from "react-router"
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Checkbox,
  DatePicker,
  EmailInput,
  FeatureGrid,
  FormField,
  Hero,
  Icon,
  PasswordInput,
  StatusBadge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TextInput,
  TimePicker,
  cn,
  type FeatureItem,
} from "@javaabu/onu"
import { CategoryChart, StatTile, StatTiles } from "@javaabu/onu/charts"

import { arrivalsByMonth, trend } from "../showcase/charts/_data"
import { introduction, navItems, navSections } from "../registry"
import { SiteLayout } from "./layout"

const CATEGORY_ICONS: Record<string, string> = {
  "form-scaffolding": "edit",
  "text-inputs": "text",
  "choice-inputs": "check",
  "date-and-time": "calendar",
  "files-and-media": "upload",
  "rich-content": "quote",
  maps: "map-pin",
  charts: "columns",
  "listing-pages": "table",
  overlays: "maximize",
  loading: "loading",
  "layout-and-navigation": "sidebar",
  "display-and-feedback": "bell",
  auth: "lock",
  system: "settings",
  "admin-records": "folder",
  "admin-content": "file-text",
  "admin-settings": "key",
  applications: "file",
  "citizen-portal": "user",
  "public-portal": "globe",
  learning: "star",
  "maps-operations": "navigation",
  kiosk: "monitor",
}

function categoryItems(sectionIndex: number, noun: string): FeatureItem[] {
  return navSections[sectionIndex]!.categories.map((c) => ({
    id: c.id,
    icon: CATEGORY_ICONS[c.id] ?? "grid",
    title: c.label,
    description: `${c.items.length} ${noun} · ${c.items
      .slice(0, 3)
      .map((i) => i.title)
      .join(", ")}${c.items.length > 3 ? "…" : ""}`,
    href: c.items[0]!.href,
    linkLabel: false,
  }))
}

function Showcase({
  title,
  href,
  className,
  children,
}: {
  title: string
  href: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={cn("min-w-0", className)}>
      <div className="mb-2 px-1 flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        <Link
          to={href}
          className="gap-1 text-xs font-medium flex items-center text-primary-subtle-foreground underline-offset-4 hover:underline"
        >
          View <span className="sr-only">{title}</span>
          <Icon name="arrow-right" className="size-3" />
        </Link>
      </div>
      {children}
    </div>
  )
}

function LoginCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sign in</CardTitle>
        <CardDescription>Use your eFaas or staff account.</CardDescription>
      </CardHeader>
      <CardContent className="gap-4 grid">
        <FormField label="Email">
          <EmailInput placeholder="aishath@example.mv" />
        </FormField>
        <FormField label="Password">
          <PasswordInput />
        </FormField>
        <Checkbox label="Keep me signed in" />
      </CardContent>
      <CardFooter className="gap-2 flex-col">
        <Button className="w-full">Sign in</Button>
        <Button variant="outline" className="w-full">
          <Icon name="key" /> Continue with eFaas
        </Button>
      </CardFooter>
    </Card>
  )
}

function ThaanaCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="gap-2 flex items-center">
          Thaana input <Badge variant="secondary">Dhivehi</Badge>
        </CardTitle>
        <CardDescription>Type on a Latin keyboard; Onu writes Thaana, right to left.</CardDescription>
      </CardHeader>
      <CardContent className="gap-4 grid">
        <FormField label="ނަން">
          <TextInput thaana thaanaToggle defaultValue="އައިޝަތު ޙަސަން" />
        </FormField>
        <FormField label="English name">
          <TextInput defaultValue="Aishath Hassan" />
        </FormField>
      </CardContent>
    </Card>
  )
}

function AppointmentCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Book an appointment</CardTitle>
        <CardDescription>Date and time pickers with Dhivehi month names.</CardDescription>
      </CardHeader>
      <CardContent className="gap-4 grid">
        <FormField label="Date">
          <DatePicker />
        </FormField>
        <FormField label="Time">
          <TimePicker />
        </FormField>
      </CardContent>
    </Card>
  )
}

const APPLICATIONS = [
  { id: "APP-1042", name: "Mariyam Shifa", island: "Male'", status: "success", label: "Approved", amount: 1250 },
  { id: "APP-1043", name: "Ibrahim Nashid", island: "Addu City", status: "warning", label: "In review", amount: 860 },
  { id: "APP-1044", name: "Aminath Riza", island: "Kulhudhuffushi", status: "info", label: "Submitted", amount: 2100 },
  { id: "APP-1045", name: "Hassan Zahir", island: "Fuvahmulah", status: "error", label: "Rejected", amount: 400 },
]

function TableCard() {
  return (
    <Card className="gap-0 py-0 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="ps-4">Applicant</TableHead>
            <TableHead className="sm:table-cell hidden">Island</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="pe-4 text-end">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {APPLICATIONS.map((a) => (
            <TableRow key={a.id}>
              <TableCell className="ps-4">
                <div className="font-medium">{a.name}</div>
                <div className="text-xs text-muted-foreground">{a.id}</div>
              </TableCell>
              <TableCell className="sm:table-cell hidden">{a.island}</TableCell>
              <TableCell>
                <StatusBadge status={a.status}>{a.label}</StatusBadge>
              </TableCell>
              <TableCell className="pe-4 text-end tabular-nums">MVR {a.amount.toLocaleString("en")}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  )
}

function ChartCard() {
  return (
    <Card>
      <CardContent>
        <CategoryChart
          variant="bar"
          title="Tourist arrivals, 2025"
          description="Monthly arrivals against target."
          data={arrivalsByMonth}
          categoryKey="month"
          config={{ arrivals: { label: "Arrivals" }, target: { label: "Target" } }}
          valueFormat="compact"
          height={240}
        />
      </CardContent>
    </Card>
  )
}

/** The landing page, in the spirit of ui.shadcn.com. */
export function Home() {
  const first = navItems[1]!
  return (
    <SiteLayout sidebar={false}>
      <div className="relative isolate overflow-hidden">
        <div
          aria-hidden
          className="inset-0 pointer-events-none absolute -z-10 bg-linear-to-b from-primary/15 via-primary/5 to-transparent"
        />
        <div
          aria-hidden
          className="-top-32 blur-3xl pointer-events-none absolute start-1/2 -z-10 size-[28rem] max-w-full -translate-x-1/2 rounded-full bg-primary/15 rtl:translate-x-1/2"
        />
        <Hero
          className="bg-transparent"
          align="center"
          size="md"
          maxWidth="4xl"
          eyebrow={
            <Link
              to="/components/layout-and-navigation/hero"
              className="gap-2 px-3 py-1 text-sm font-medium inline-flex items-center rounded-full border border-primary/30 bg-primary-subtle text-primary-subtle-foreground transition-colors hover:border-primary/60"
            >
              <span className="size-1.5 rounded-full bg-primary" aria-hidden />
              New: Hero and Feature grid
              <Icon name="arrow-right" className="size-3.5" />
            </Link>
          }
          title="Build Maldivian apps faster"
          description={
            <span dir="auto">
              {introduction.description} Thaana keyboard input, Dhivehi translations and one-variable theming, with
              {" " + navSections[1]!.categories.reduce((n, c) => n + c.items.length, 0)} components and{" "}
              {navSections[2]!.categories.reduce((n, c) => n + c.items.length, 0)} sample pages.
            </span>
          }
          actions={
            <>
              <Button asChild>
                <Link to={first.href}>Get started</Link>
              </Button>
              <Button asChild variant="ghost">
                <Link to="/components">Browse components</Link>
              </Button>
            </>
          }
          classNames={{ title: "text-4xl sm:text-5xl md:text-6xl leading-tight" }}
        />
      </div>

      <div className="max-w-screen-2xl px-4 md:px-6 pb-16 mx-auto">
        <section aria-label="Examples" className="gap-6 md:grid-cols-2 xl:grid-cols-3 grid items-start">
          <Showcase title="Authentication" href="/components/form-scaffolding/auth-forms">
            <LoginCard />
          </Showcase>
          <Showcase title="Stat tiles" href="/components/charts/stat-tile" className="xl:col-span-2">
            <StatTiles columns={3}>
              <StatTile
                label="Applications"
                value={1284}
                previousValue={1102}
                icon="file-text"
                sparkline={trend(2, 14, 80, 20)}
              />
              <StatTile
                label="Revenue"
                value={2481500}
                previousValue={2610200}
                valueFormat="currency"
                icon="credit-card"
              />
              <StatTile label="Average wait" value="3.4 days" delta={-0.18} positiveIsGood={false} icon="clock" />
            </StatTiles>
            <div className="mt-6">
              <ChartCard />
            </div>
          </Showcase>
          <Showcase title="Thaana input" href="/components/text-inputs/text-input">
            <ThaanaCard />
          </Showcase>
          <Showcase title="Data table" href="/components/listing-pages/data-table" className="xl:col-span-2">
            <TableCard />
          </Showcase>
          <Showcase title="Date and time" href="/components/date-and-time/date-picker">
            <AppointmentCard />
          </Showcase>
        </section>

        <section aria-labelledby="home-components" className="mt-24 space-y-6">
          <div className="space-y-2">
            <span aria-hidden className="mb-4 h-1 w-10 block rounded-full bg-primary" />
            <h2 id="home-components" className="text-3xl font-semibold tracking-tight">
              Components
            </h2>
            <p className="text-muted-foreground">Grouped the way you build forms and admin screens.</p>
          </div>
          <FeatureGrid items={categoryItems(1, "components")} columns={3} />
        </section>

        <section aria-labelledby="home-pages" className="mt-24 space-y-6">
          <div className="space-y-2">
            <span aria-hidden className="mb-4 h-1 w-10 block rounded-full bg-primary" />
            <h2 id="home-pages" className="text-3xl font-semibold tracking-tight">
              Sample pages
            </h2>
            <p className="text-muted-foreground">Full-screen app shells you can copy as a starting point.</p>
          </div>
          <FeatureGrid items={categoryItems(2, "pages")} columns={3} />
        </section>
      </div>
    </SiteLayout>
  )
}
