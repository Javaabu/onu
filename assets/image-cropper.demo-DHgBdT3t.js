var e=`import * as React from "react"
import { Button } from "@javaabu/onu"
import { ImageCropper, type ImageCropperHandle } from "@javaabu/onu/media"

import { DemoPage, DemoSection } from "../../components/demo"
import { scene } from "./_mock"

export const meta = { title: "Image cropper", group: "Files and media", order: 9 }

export default function ImageCropperDemo() {
  const ref = React.useRef<ImageCropperHandle>(null)
  const [result, setResult] = React.useState<string | null>(null)
  return (
    <DemoPage>
      <DemoSection
        title="Aspect ratios, zoom and rotate"
        description="Drag or pinch the image; focus the crop area and use the arrow keys to nudge, + and − to zoom."
        className="gap-4 lg:grid-cols-[minmax(0,1fr)_16rem] grid w-full"
      >
        <ImageCropper
          ref={ref}
          src={scene("Kaafu Atoll", 195)}
          alt="Kaafu Atoll beach"
          aspect={16 / 9}
          aspectOptions={[
            { label: "16:9", value: 16 / 9 },
            { label: "4:3", value: 4 / 3 },
            { label: "1:1", value: 1 },
            { label: "Free", value: undefined },
          ]}
        />
        <div className="gap-3 grid content-start">
          <Button
            onClick={async () => {
              const blob = await ref.current?.getBlob({ type: "image/png", maxSize: 800 })
              if (blob) setResult(URL.createObjectURL(blob))
            }}
          >
            Crop
          </Button>
          {result ? <img src={result} alt="Cropped result" className="w-full rounded-lg border border-border" /> : null}
        </div>
      </DemoSection>
      <DemoSection title="Round (avatar)" className="max-w-md gap-4 grid">
        <ImageCropper src={scene("", 20, 600, 600)} alt="Portrait" cropShape="round" rotatable={false} />
      </DemoSection>
    </DemoPage>
  )
}
`;export{e as default};