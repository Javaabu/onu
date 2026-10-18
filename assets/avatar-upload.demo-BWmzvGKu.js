var e=`import { FormField } from "@javaabu/onu"
import { AvatarUpload } from "@javaabu/onu/media"

import { DemoPage, DemoSection } from "../../components/demo"
import { scene } from "./_mock"

export const meta = { title: "Avatar upload", group: "Files and media", order: 8 }

export default function AvatarUploadDemo() {
  return (
    <DemoPage>
      <DemoSection title="With crop step" className="gap-6 grid">
        <FormField label="Profile photo" help="You can crop the photo after choosing it.">
          <AvatarUpload personName="Aishath Shifa" size="lg" maxSize={5 * 1024 * 1024} />
        </FormField>
        <FormField label="ފޮޓޯ">
          <AvatarUpload personName="އަޙްމަދު ނާޒިމް" defaultValue={scene("", 25, 400, 400)} />
        </FormField>
      </DemoSection>
      <DemoSection title="Sizes" className="gap-6 flex flex-wrap items-center">
        <AvatarUpload personName="Ali Shareef" size="sm" crop={false} />
        <AvatarUpload personName="Mariyam Zahir" size="xl" />
      </DemoSection>
    </DemoPage>
  )
}
`;export{e as default};