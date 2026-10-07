import * as React from "react"
import { Button } from "@javaabu/onu"
import { Lightbox } from "@javaabu/onu/media"

import { DemoPage, DemoSection } from "../../components/demo"
import { islandPhotos } from "./_mock"

export const meta = { title: "Lightbox", group: "Files and media", order: 12 }

export default function LightboxDemo() {
  const [open, setOpen] = React.useState(false)
  const [index, setIndex] = React.useState(0)
  return (
    <DemoPage>
      <DemoSection
        title="Controlled"
        description="Arrow keys, swipe, pinch or double-tap to zoom, Escape to close. Focus returns to the button."
      >
        <Button onClick={() => setOpen(true)}>Open island photos</Button>
        <span className="text-sm text-muted-foreground">Last viewed: {islandPhotos[index]?.title}</span>
        <Lightbox open={open} onOpenChange={setOpen} slides={islandPhotos} index={index} onIndexChange={setIndex} />
      </DemoSection>
    </DemoPage>
  )
}
