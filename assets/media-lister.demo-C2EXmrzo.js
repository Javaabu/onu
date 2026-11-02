var e=`import * as React from "react"
import { Button, Icon, MediaLister, type MediaId, type MediaItem } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"
import { scene } from "./_mock"

export const meta = { title: "Media lister", group: "Files and media", order: 10 }

const places = [
  "Maafushi",
  "Thoddoo",
  "Dhigurah",
  "Fulidhoo",
  "Ukulhas",
  "Rasdhoo",
  "Gulhi",
  "Fenfushi",
  "Hangnaameedhoo",
  "Mathiveri",
]

function makeItems(page: number): MediaItem[] {
  return places.map((place, i) => {
    const n = page * places.length + i
    const kind = n % 5
    if (kind === 3)
      return { id: n, name: \`Council minutes \${n + 1}.pdf\`, type: "application/pdf", size: 120_000 + n * 1000 }
    if (kind === 4) return { id: n, name: \`Budget \${2020 + (n % 7)}.xlsx\`, size: 48_000 }
    return {
      id: n,
      name: \`\${place} \${n + 1}.jpg\`,
      thumbnailUrl: scene(place, (n * 37) % 360, 300, 300),
      type: "image/jpeg",
      size: 900_000 + n * 3000,
      alt: \`\${place} island\`,
    }
  })
}

export default function MediaListerDemo() {
  const [pages, setPages] = React.useState(1)
  const [loading, setLoading] = React.useState(false)
  const [selected, setSelected] = React.useState<MediaId[]>([])
  const [page, setPage] = React.useState(1)
  const items = React.useMemo(() => Array.from({ length: pages }, (_, p) => makeItems(p)).flat(), [pages])

  const loadMore = () => {
    if (loading) return
    setLoading(true)
    setTimeout(() => {
      setPages((p) => p + 1)
      setLoading(false)
    }, 800)
  }

  return (
    <DemoPage>
      <DemoSection title="Infinite loading, multiple selection" className="gap-4 grid w-full">
        <MediaLister
          items={items}
          selectionMode="multiple"
          selected={selected}
          onSelectedChange={setSelected}
          hasMore={pages < 3}
          loading={loading}
          onLoadMore={loadMore}
          toolbar={
            <Button size="sm">
              <Icon name="upload" data-icon="inline-start" />
              Upload
            </Button>
          }
        />
      </DemoSection>
      <DemoSection title="Paged, list view, open on click" className="gap-4 grid w-full">
        <MediaLister
          items={makeItems(page - 1)}
          defaultView="list"
          page={page}
          pageCount={4}
          onPageChange={setPage}
          onItemOpen={(item) => window.alert(item.name)}
          renderActions={(item) => (
            <Button variant="ghost" size="icon-sm" aria-label={\`Delete \${item.name}\`}>
              <Icon name="trash" />
            </Button>
          )}
        />
      </DemoSection>
      <DemoSection title="Empty and loading" className="gap-4 grid w-full">
        <MediaLister items={[]} hideSearch />
        <MediaLister items={[]} loading hideSearch />
      </DemoSection>
    </DemoPage>
  )
}
`;export{e as default};