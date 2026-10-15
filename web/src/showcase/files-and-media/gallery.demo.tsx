import { Gallery } from "@javaabu/onu/media"

import { DemoPage, DemoSection } from "../../components/demo"
import { islandPhotos } from "./_mock"

export const meta = { title: "Gallery", group: "Files and media", order: 11 }

export default function GalleryDemo() {
  return (
    <DemoPage>
      <DemoSection title="Grid" description="Click or press Enter on a photo to open the lightbox." className="w-full">
        <Gallery images={islandPhotos} showCaptions />
      </DemoSection>
      <DemoSection title="Masonry, 4 columns" className="w-full">
        <Gallery
          images={[...islandPhotos, ...islandPhotos.slice(0, 2)]}
          layout="masonry"
          columns={4}
          lightboxProps={{ loop: true }}
        />
      </DemoSection>
      <DemoSection title="Wide thumbnails" className="w-full">
        <Gallery images={islandPhotos.slice(0, 4)} aspect="video" columns={2} />
      </DemoSection>
    </DemoPage>
  )
}
