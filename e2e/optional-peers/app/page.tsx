"use client"

import { Button } from "@javaabu/onu"
import { CategoryChart, MapChart } from "@javaabu/onu/charts"
import { exportCsv, exportExcel } from "@javaabu/onu/export"

const rows = [{ name: "Malé", value: 1 }]
const columns = [{ header: "Name", accessor: "name" as const }]

// MapChart lazy-loads deck.gl and @vis.gl/react-google-maps, and exportExcel loads
// write-excel-file: none are installed here, and the app must still build.
export default function Page() {
  return (
    <main>
      <CategoryChart title="Sales" data={rows} categoryKey="name" config={{ value: { label: "Value" } }} />
      <MapChart title="Atolls" geojson={{ type: "FeatureCollection", features: [] }} data={[]} />
      <Button onClick={() => exportCsv({ rows, columns })}>CSV</Button>
      <Button onClick={() => exportExcel({ rows, columns })}>Excel</Button>
    </main>
  )
}
