var e=`import * as React from "react"
import { Card, IconText, SegmentedControl } from "@javaabu/onu"
import { Gallery } from "@javaabu/onu/media"

import { useTr } from "../_shared/i18n"
import { PortalShell } from "../_shared/shells"
import { albums } from "./_data"
import { scene, useDates, useL } from "./_i18n"
import { Container, PortalPageHeader } from "./_ui"

export const meta = { title: "Gallery", group: "Public portal", layout: "bare", order: 6 }

export default function GalleryPage() {
  const tr = useTr()
  const l = useL()
  const dates = useDates()
  const [albumId, setAlbumId] = React.useState(albums[0].id)
  const [layout, setLayout] = React.useState("masonry")
  const album = albums.find((a) => a.id === albumId)!
  const headingRef = React.useRef<HTMLHeadingElement>(null)

  const images = album.photos.map((photo) => ({
    src: scene(photo.label, photo.hue, photo.w, photo.h),
    alt: l(photo.alt),
    title: l(photo.alt),
    description: l(album.title),
    width: photo.w,
    height: photo.h,
  }))

  return (
    <PortalShell>
      <PortalPageHeader
        crumbs={[{ label: tr("Gallery", "ގެލަރީ") }]}
        title={tr("Photo gallery", "ފޮޓޯ ގެލަރީ")}
        description={tr(
          "Photos from our events, openings and community work across the islands.",
          "ރަށްރަށުގައި ބޭއްވި ހަރަކާތްތަކާއި ހުޅުވުންތަކާއި މުޖުތަމަޢު މަސައްކަތުގެ ފޮޓޯ.",
        )}
      />
      <Container className="py-10">
        <h2 className="text-xl font-semibold">{tr("Albums", "އަލްބަމްތައް")}</h2>
        <ul className="mt-4 gap-4 sm:grid-cols-3 grid">
          {albums.map((a) => {
            const cover = a.photos[0]
            const active = a.id === albumId
            return (
              <li key={a.id}>
                <Card asChild className={active ? "ring-2 ring-primary" : "hover:shadow-md transition-shadow"}>
                  <button
                    type="button"
                    aria-pressed={active}
                    onClick={() => {
                      setAlbumId(a.id)
                      headingRef.current?.focus()
                    }}
                    className="gap-0 p-0 w-full overflow-hidden text-start"
                  >
                    <img src={scene("", cover.hue, 600, 360)} alt="" className="aspect-[5/3] w-full object-cover" />
                    <span className="gap-1 p-4 grid">
                      <span className="font-medium">{l(a.title)}</span>
                      <span className="gap-3 text-sm flex flex-wrap text-muted-foreground">
                        <IconText icon="calendar" size="sm" tone="muted">
                          {dates.date(a.date, "abbreviated")}
                        </IconText>
                        <IconText icon="image" size="sm" tone="muted">
                          {tr(\`\${a.photos.length} photos\`, \`\${a.photos.length} ފޮޓޯ\`)}
                        </IconText>
                      </span>
                    </span>
                  </button>
                </Card>
              </li>
            )
          })}
        </ul>

        <div className="mt-12 gap-4 flex flex-wrap items-end justify-between">
          <div>
            <h2 ref={headingRef} tabIndex={-1} className="text-2xl font-semibold tracking-tight outline-none">
              {l(album.title)}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {dates.date(album.date)} ·{" "}
              {tr(
                "Select a photo to open it full screen.",
                "ފުރިހަމަ ސްކްރީނުން ބެއްލެވުމަށް ފޮޓޯއެއް ޚިޔާރުކުރައްވާ.",
              )}
            </p>
          </div>
          <SegmentedControl
            className="shrink-0"
            classNames={{ item: "min-w-fit" }}
            aria-label={tr("Layout", "ލޭއައުޓް")}
            size="sm"
            value={layout}
            onValueChange={setLayout}
            options={[
              { value: "masonry", label: tr("Masonry", "މޭސަންރީ") },
              { value: "grid", label: tr("Grid", "ގްރިޑް") },
            ]}
          />
        </div>
        <Gallery
          key={album.id + layout}
          className="mt-6"
          images={images}
          layout={layout as "grid" | "masonry"}
          columns={3}
          showCaptions={layout === "grid"}
          lightboxProps={{ loop: true }}
        />
      </Container>
    </PortalShell>
  )
}
`;export{e as default};