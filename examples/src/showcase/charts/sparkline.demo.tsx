import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@javaabu/onu"
import { DeltaIndicator, Sparkline } from "@javaabu/onu/charts"

import { DemoPage, DemoSection } from "../../components/demo"
import { trend } from "./_data"

export const meta = {
  title: "Sparkline",
  group: "Charts",
  order: 6,
  description: "Tiny inline trend lines without axes.",
}

const islands = [
  { name: "Malé", seed: 3, base: 420 },
  { name: "Hulhumalé", seed: 11, base: 260 },
  { name: "Addu City", seed: 19, base: 120 },
  { name: "Fuvahmulah", seed: 23, base: 60 },
]

export default function SparklineDemo() {
  return (
    <DemoPage>
      <DemoSection title="Line and area" className="max-w-md gap-4 grid">
        <Sparkline label="Daily sign-ups" data={trend(5)} />
        <Sparkline label="Daily sign-ups" variant="area" data={trend(5)} color="var(--chart-2)" height={48} />
        <Sparkline label="With a gap" data={[12, 14, 13, null, null, 18, 21, 19, 24]} color="var(--chart-3)" />
      </DemoSection>
      <DemoSection title="In a table" className="block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Island</TableHead>
              <TableHead>Last 20 days</TableHead>
              <TableHead className="text-end">Change</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {islands.map((island) => {
              const values = trend(island.seed, 20, island.base, island.base / 5)
              return (
                <TableRow key={island.name}>
                  <TableCell>{island.name}</TableCell>
                  <TableCell className="w-40">
                    <Sparkline label={`${island.name} requests`} data={values} height={24} />
                  </TableCell>
                  <TableCell className="text-end">
                    <DeltaIndicator current={values[values.length - 1]} previous={values[0]} />
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </DemoSection>
    </DemoPage>
  )
}
