import { FormField, ImageInput } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"
import { scene } from "./_mock"

export const meta = { title: "Image input", group: "Files and media", order: 7 }

export default function ImageInputDemo() {
  return (
    <DemoPage>
      <DemoSection title="Empty and existing" className="gap-6 sm:grid-cols-2 grid w-full">
        <FormField label="Cover photo" help="JPG or PNG, up to 2 MB.">
          <ImageInput alt="Cover photo" maxSize={2 * 1024 * 1024} />
        </FormField>
        <FormField label="Guest house photo">
          <ImageInput
            alt="Guest house in Maafushi"
            defaultValue={scene("Guest house", 200)}
            removeName="remove_photo"
          />
        </FormField>
      </DemoSection>
      <DemoSection title="Shapes" className="gap-6 sm:grid-cols-3 grid w-full">
        <FormField label="Square, 1:1">
          <ImageInput alt="Logo" shape="square" aspectRatio={1} />
        </FormField>
        <FormField label="Circle">
          <ImageInput alt="Badge" shape="circle" defaultValue={scene("Badge", 140, 400, 400)} />
        </FormField>
        <FormField label="Disabled" disabled>
          <ImageInput alt="Banner" aspectRatio={16 / 9} />
        </FormField>
      </DemoSection>
    </DemoPage>
  )
}
