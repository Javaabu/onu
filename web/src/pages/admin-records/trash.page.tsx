import { applyListingState, ListingPage, toast, trashActions, useListingState, useTranslation } from "@javaabu/onu"

import { useTr } from "../_shared/i18n"
import { routes } from "../_shared/routes"
import { AdminShell } from "../_shared/shells"
import {
  filterFns,
  forceDeleteApplications,
  restoreApplications,
  searchFields,
  useLabels,
  useTrashedApplications,
  wait,
  type Application,
} from "./_data"
import { applicationColumns, applicationFilters, emailFilter, sortValue } from "./_ui"

export const meta = {
  title: "Trash",
  group: "Admin: records",
  layout: "bare",
  order: 10,
}

export default function TrashPage() {
  const tr = useTr()
  const { t } = useTranslation()
  const labels = useLabels()
  const trashed = useTrashedApplications()
  const state = useListingState({ paramPrefix: "trash_", defaultState: { perPage: 10 } })
  const { rows, total } = applyListingState(trashed, state, {
    searchFields,
    filterFns: { ...filterFns, email: emailFilter },
    sortValue: sortValue(labels),
    locale: labels.dv ? "dv" : "en",
  })

  const columns = [
    ...applicationColumns(labels, tr).filter((c) => c.id !== "assignee" && c.id !== "island"),
    {
      id: "deletedAt",
      header: tr("Deleted", "ފޮހެލި"),
      sortable: true,
      cell: (a: Application) => <span className="whitespace-nowrap">{labels.date(a.deletedAt)}</span>,
    },
  ]

  return (
    <AdminShell
      contentWidth="wide"
      breadcrumbs={[
        { label: tr("Applications", "އެޕްލިކޭޝަންތައް"), href: routes.adminRecords.indexTable },
        { label: tr("Trash", "ކުނިފޮށި") },
      ]}
    >
      <ListingPage<Application>
        title={tr("Trash", "ކުނިފޮށި")}
        description={tr(
          "Deleted applications. Restore them, or delete them permanently.",
          "ފޮހެލެވިފައިވާ އެޕްލިކޭޝަންތައް. އަނބުރާ ގެނެވޭނެ، ނުވަތަ ދާއިމީކޮށް ފޮހެލެވޭނެ.",
        )}
        links={[
          {
            label: tr("All applications", "ހުރިހާ އެޕްލިކޭޝަނެއް"),
            href: routes.adminRecords.indexTable,
            icon: "back",
          },
        ]}
        state={state}
        trash
        columns={columns}
        data={rows}
        total={total}
        noun={labels.noun}
        filters={applicationFilters(labels, tr, { trashed: false })}
        searchThaana={labels.dv}
        getRowName={(a) => `${a.reference} (${labels.name(a)})`}
        rowActions={(a) =>
          trashActions(t, {
            onRestore: async () => {
              await wait(400)
              restoreApplications([a.id])
              toast.success(tr(`${a.reference} restored`, `${a.reference} އަނބުރާ ގެނެވިއްޖެ`))
            },
            onForceDelete: async () => {
              await wait(600)
              forceDeleteApplications([a.id])
              toast.success(tr(`${a.reference} deleted permanently`, `${a.reference} ދާއިމީކޮށް ފޮހެލެވިއްޖެ`))
            },
          })
        }
      />
    </AdminShell>
  )
}
