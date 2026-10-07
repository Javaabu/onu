import * as React from "react"

import type { DataTableColumn } from "../src/components/listing/data-table"
import type { FilterDefinition } from "../src/components/listing/listing-types"

/** Test data shared by the listing tests (not exported from the package). */
export interface User {
  id: string
  name: string
  email: string
  status: "active" | "banned"
  island: string
  balance: number
  created: string
}

const NAMES = ["Jane Doe", "Ahmed Ali", "Mariyam Hassan", "Ibrahim Rasheed", "Aishath Nazeer", "Hussain Manik"]
const ISLANDS = ["Malé", "Hulhumalé", "Addu", "Fuvahmulah"]

export function makeUsers(count: number): User[] {
  return Array.from({ length: count }, (_, i) => ({
    id: String(i + 1),
    name: i < NAMES.length ? (NAMES[i] as string) : `User ${i + 1}`,
    email: `user${i + 1}@example.mv`,
    status: i % 5 === 0 ? "banned" : "active",
    island: ISLANDS[i % ISLANDS.length] as string,
    balance: (i * 37) % 1000,
    created: `2026-03-${String((i % 28) + 1).padStart(2, "0")}`,
  }))
}

export const userColumns: DataTableColumn<User>[] = [
  { id: "name", header: "Name", sortable: true, primary: true },
  { id: "email", header: "Email", sortable: true },
  { id: "status", header: "Status", cell: (u) => <span>{u.status === "active" ? "Active" : "Banned"}</span> },
  { id: "balance", header: "Balance", numeric: true, sortable: true },
]

export const userFilters: FilterDefinition[] = [
  {
    type: "select",
    key: "status",
    label: "Status",
    options: [
      { value: "active", label: "Active" },
      { value: "banned", label: "Banned" },
    ],
  },
  {
    type: "date-range",
    key: "created",
    label: "Created",
    fields: [
      { value: "created_at", label: "Created" },
      { value: "updated_at", label: "Updated" },
    ],
  },
  { type: "boolean", key: "verified", label: "Verified" },
  { type: "text", key: "email", label: "Email contains" },
  { type: "trashed", key: "trashed", label: "Deleted records" },
]

export const noun = { one: "user", other: "users" }

export function Deferred() {
  let resolve!: (value?: unknown) => void
  const promise = new Promise((r) => {
    resolve = r
  })
  return { promise, resolve }
}

export function setMobile(matches: boolean) {
  window.matchMedia = ((query: string) => ({
    matches: query.includes("max-width") ? matches : query.includes("min-width") ? !matches : false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia
}
