import {
  applyListingState,
  Callout,
  Card,
  DataTable,
  Tabs,
  LinkButton,
  PageTitle,
  StatusBadge,
  useListingState,
  type DataTableColumn,
} from "@javaabu/onu"

import { CitizenShell } from "../_shared/shells"
import { useTr } from "../_shared/i18n"
import { routes } from "../_shared/routes"
import { payments, useFormat, usePaymentStatuses, type Payment } from "../applications/_data"

export const meta = { title: "My payments", group: "Citizen portal", layout: "bare", order: 4 }

const TABS = ["all", "outstanding", "verifying", "paid"] as const

function inTab(p: Payment, tab: string) {
  if (tab === "outstanding") return p.status === "due" || p.status === "overdue"
  if (tab === "all") return true
  return p.status === tab
}

export default function MyPaymentsPage() {
  const tr = useTr()
  const { money, date } = useFormat()
  const statuses = usePaymentStatuses()
  const state = useListingState({ url: false, defaultState: { perPage: 10, sort: { id: "due", desc: true } } })
  const tab = typeof state.filters.tab === "string" ? state.filters.tab : "all"

  const outstanding = payments.filter((p) => inTab(p, "outstanding"))
  const outstandingTotal = outstanding.reduce((s, p) => s + p.amount, 0)
  const paidTotal = payments.filter((p) => p.status === "paid").reduce((s, p) => s + p.amount, 0)

  const labels: Record<(typeof TABS)[number], string> = {
    all: tr("All", "ހުރިހާ"),
    outstanding: tr("To pay", "ދައްކަން ޖެހޭ"),
    verifying: tr("Verifying", "ޗެކްކުރަނީ"),
    paid: tr("Paid", "ދައްކާފައި"),
  }

  const { rows, total } = applyListingState(payments, state, {
    searchFields: (p) => [p.ref, ...p.description],
    filterFns: { tab: (p, v) => inTab(p, String(v)) },
  })

  const due = (p: Payment) => p.status === "due" || p.status === "overdue"

  const columns: DataTableColumn<Payment>[] = [
    {
      id: "ref",
      header: tr("Invoice", "އިންވޮއިސް"),
      sortable: true,
      cell: (p) => <span className="tabular-nums">{p.ref}</span>,
    },
    { id: "description", header: tr("For", "ސަބަބު"), primary: true, accessor: (p) => tr(...p.description) },
    { id: "due", header: tr("Due", "ހަމަވާ"), sortable: true, cell: (p) => date(p.due) },
    { id: "paid", header: tr("Paid on", "ދެއްކި"), sortable: true, cell: (p) => (p.paid ? date(p.paid) : null) },
    { id: "method", header: tr("Method", "ގޮތް"), cell: (p) => (p.method ? tr(...p.method) : null) },
    {
      id: "status",
      header: tr("Status", "ހާލަތު"),
      cell: (p) => <StatusBadge status={p.status} statusMap={statuses} size="sm" />,
    },
    { id: "amount", header: tr("Amount", "ޢަދަދު"), numeric: true, sortable: true, cell: (p) => money(p.amount) },
    {
      id: "action",
      header: tr("Action", "ޢަމަލު"),
      align: "end",
      cell: (p) =>
        due(p) ? (
          <LinkButton href={routes.applications.checkout} size="sm" aria-label={tr(`Pay ${p.ref}`, `${p.ref} ދައްކާ`)}>
            {tr("Pay now", "ދައްކާ")}
          </LinkButton>
        ) : p.status === "paid" ? (
          <LinkButton
            href={routes.applications.receipt}
            size="sm"
            variant="outline"
            aria-label={tr(`Receipt for ${p.ref}`, `${p.ref} ގެ ރަސީދު`)}
          >
            {tr("Receipt", "ރަސީދު")}
          </LinkButton>
        ) : null,
    },
  ]

  return (
    <CitizenShell>
      <div className="gap-5 grid">
        <PageTitle
          title={tr("My payments", "އަޅުގަނޑުގެ ފައިސާ ދެއްކުންތައް")}
          description={tr(
            "Fees, invoices and receipts for your applications.",
            "އެޕްލިކޭޝަންތަކުގެ ފީ، އިންވޮއިސް އަދި ރަސީދު.",
          )}
        />

        {outstanding.length ? (
          <Callout
            variant={outstanding.some((p) => p.status === "overdue") ? "destructive" : "warning"}
            title={tr(`${money(outstandingTotal)} to pay`, `${money(outstandingTotal)} ދައްކަން ޖެހޭ`)}
            description={tr(
              `${outstanding.length} invoices, 1 overdue. Pay by BML Transfer or card.`,
              `${outstanding.length} އިންވޮއިސް، 1 ފަހަނައަޅާފައި. ބީއެމްއެލް ޓްރާންސްފަރ ނުވަތަ ކާޑުން ދައްކަވާ.`,
            )}
            actions={
              <LinkButton href={routes.applications.checkout} size="sm" startIcon="credit-card">
                {tr("Pay now", "މިހާރު ދައްކާ")}
              </LinkButton>
            }
          />
        ) : null}

        <div className="gap-4 sm:grid-cols-3 grid">
          <Card size="sm" headingLevel={2} title={tr("To pay", "ދައްކަން ޖެހޭ")}>
            <p className="text-2xl font-semibold tabular-nums">{money(outstandingTotal)}</p>
          </Card>
          <Card size="sm" headingLevel={2} title={tr("Being verified", "ޗެކްކުރަނީ")}>
            <p className="text-2xl font-semibold tabular-nums">
              {money(payments.filter((p) => p.status === "verifying").reduce((s, p) => s + p.amount, 0))}
            </p>
          </Card>
          <Card size="sm" headingLevel={2} title={tr("Paid in 2026", "2026 ގައި ދެއްކި")}>
            <p className="text-2xl font-semibold tabular-nums">{money(paidTotal)}</p>
          </Card>
        </div>

        <Tabs
          variant="line"
          countAppearance="pill"
          listLabel={tr("Filter by status", "ހާލަތުން ފިލްޓަރ")}
          value={tab}
          onValueChange={(v) => state.setFilter("tab", v === "all" ? undefined : v)}
          items={TABS.map((t) => ({ value: t, label: labels[t], count: payments.filter((p) => inTab(p, t)).length }))}
        />

        <DataTable
          caption={tr("Payments", "ފައިސާ ދެއްކުންތައް")}
          columns={columns}
          data={rows}
          total={total}
          state={state}
          selectable={false}
          noun={{ one: tr("payment", "ފައިސާ"), other: tr("payments", "ފައިސާ") }}
          getRowName={(p) => p.ref}
        />
      </div>
    </CitizenShell>
  )
}
