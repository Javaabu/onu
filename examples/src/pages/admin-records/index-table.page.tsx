import * as React from "react"
import { applyListingState, ListingPage, Select, toast, useListingState, type BulkAction } from "@javaabu/onu"
import { useExportRows, type ExportColumn } from "@javaabu/onu/export"

import { useTr } from "../_shared/i18n"
import { routes } from "../_shared/routes"
import { AdminShell } from "../_shared/shells"
import {
  filterFns,
  searchFields,
  showHref,
  trashApplications,
  updateApplication,
  useAllApplications,
  useLabels,
  wait,
  type Application,
  type ApplicationStatus,
} from "./_data"
import { itemActions, NewApplicationButton, ViewNav } from "./_index"
import { applicationColumns, applicationFilters, emailFilter, sortValue } from "./_ui"

export const meta = {
  title: "Index: table",
  group: "Admin: records",
  layout: "bare",
  order: 2,
}

export default function IndexTablePage() {
  const tr = useTr()
  const labels = useLabels()
  const all = useAllApplications()
  const state = useListingState({
    paramPrefix: "app_",
    defaultState: { perPage: 25, sort: { id: "submitted", desc: true } },
    defaultColumnVisibility: { island: false },
  })

  // The "Deleted records" filter picks the source rows, like Laravel's withTrashed / onlyTrashed.
  const trashed = state.filters.trashed
  const source = all.filter((a) => (trashed === "only" ? a.deletedAt : trashed === "with" ? true : !a.deletedAt))
  const listingOptions = {
    searchFields,
    filterFns: { ...filterFns, email: emailFilter },
    sortValue: sortValue(labels),
    locale: labels.dv ? "dv" : "en",
  }
  const { rows, total } = applyListingState(source, state, listingOptions)
  const active = all.filter((a) => !a.deletedAt)
  const exportRows = useExportRows()
  // Export every row that matches the search and filters, not only this page.
  const exportColumns: ExportColumn<Application>[] = [
    { header: tr("Reference", "ރެފަރެންސް"), accessor: "reference" },
    { header: tr("Name", "ނަން"), accessor: (a) => labels.name(a) },
    { header: tr("ID card", "އައިޑީ ކާޑު"), accessor: "idCard" },
    { header: tr("Island", "ރަށް"), accessor: (a) => labels.island(a.island) },
    { header: tr("Service", "ޚިދުމަތް"), accessor: (a) => labels.service(a.service) },
    { header: tr("Status", "ސްޓޭޓަސް"), accessor: (a) => labels.status(a.status) },
    { header: tr("Fee", "ފީ"), accessor: "amount", type: "currency" },
    { header: tr("Submitted", "ހުށަހެޅި"), accessor: "submitted", type: "date" },
  ]
  const trashCount = all.length - active.length
  const count = (s: ApplicationStatus) => active.filter((a) => a.status === s).length

  const bulkActions: BulkAction<string>[] = [
    {
      id: "status",
      label: tr("Change status", "ސްޓޭޓަސް ބަދަލުކުރޭ"),
      icon: "edit",
      defaultValue: "in_review",
      form: ({ id, value, onChange }) => (
        <Select
          id={id}
          size="sm"
          className="w-40"
          options={labels.options.statuses}
          value={value}
          onValueChange={onChange}
        />
      ),
      run: async (ids, value) => {
        await wait()
        ids.forEach((id) => updateApplication(id, { status: value as ApplicationStatus }))
      },
      successMessage: (n) => tr(`${n} applications updated`, `${n} އެޕްލިކޭޝަން އަޕްޑޭޓްކުރެވިއްޖެ`),
    },
    {
      id: "assign",
      label: tr("Assign", "ޙަވާލުކުރޭ"),
      icon: "user",
      defaultValue: "shifa",
      form: ({ id, value, onChange }) => (
        <Select
          id={id}
          size="sm"
          className="w-44"
          options={labels.options.staff}
          value={value}
          onValueChange={onChange}
        />
      ),
      run: async (ids, value) => {
        await wait()
        ids.forEach((id) => updateApplication(id, { assignee: value }))
      },
      successMessage: (n) => tr(`${n} applications assigned`, `${n} އެޕްލިކޭޝަން ޙަވާލުކުރެވިއްޖެ`),
    },
    {
      id: "delete",
      label: tr("Delete", "ފޮހެލާ"),
      icon: "trash",
      destructive: true,
      run: async (ids) => {
        await wait()
        trashApplications(ids)
      },
    },
  ]

  return (
    <AdminShell contentWidth="wide" breadcrumbs={[{ label: tr("Applications", "އެޕްލިކޭޝަންތައް") }]}>
      <ListingPage<Application>
        title={tr("Applications", "އެޕްލިކޭޝަންތައް")}
        description={tr(
          "Permit and licence applications from every island.",
          "ހުރިހާ ރަށްރަށުން ހުށަހަޅާފައިވާ ހުއްދައާއި ލައިސަންސްގެ އެޕްލިކޭޝަންތައް.",
        )}
        state={state}
        columns={applicationColumns(labels, tr)}
        data={rows}
        total={total}
        noun={labels.noun}
        filters={applicationFilters(labels, tr)}
        searchPlaceholder={tr("Reference, name, ID card…", "ރެފަރެންސް، ނަން، އައިޑީ ކާޑު…")}
        searchThaana={labels.dv}
        trash={trashed === "only"}
        primaryAction={<NewApplicationButton />}
        links={[{ label: tr("Board", "ބޯޑް"), href: routes.adminRecords.indexKanban, icon: "kanban" }]}
        trashHref={routes.adminRecords.trash}
        trashHasItems={trashCount > 0}
        tabs={[
          { value: "all", label: tr("All", "ހުރިހާ"), count: active.length },
          { value: "submitted", label: labels.status("submitted"), count: count("submitted") },
          { value: "in_review", label: labels.status("in_review"), count: count("in_review") },
          { value: "approved", label: labels.status("approved"), count: count("approved") },
        ]}
        columnToggle
        onExport={(format) =>
          exportRows({
            format,
            rows: applyListingState(source, { ...state, page: 1, perPage: Infinity }, listingOptions).rows,
            columns: exportColumns,
            filename: `applications-${new Date().toISOString().slice(0, 10)}`,
            title: tr("Applications", "އެޕްލިކޭޝަންތައް"),
            scope: tr(`${total} applications, current filters`, `${total} އެޕްލިކޭޝަން، މިހާރުގެ ފިލްޓަރުތައް`),
          })
        }
        bulkActions={bulkActions as BulkAction<unknown>[]}
        onBulkSuccess={(message) => toast.success(message)}
        getRowName={(a) => `${a.reference} (${labels.name(a)})`}
        getRowHref={(a) => showHref(a.id)}
        rowActions={(a) => itemActions(a, labels, tr)}
        toolbarEnd={<ViewNav value="table" />}
      />
    </AdminShell>
  )
}
