var e=`import { LastEditedBy } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"
import { minutesAgo } from "./_data"

export const meta = { title: "Last edited by", group: "Display and feedback", order: 15 }

export default function LastEditedByDemo() {
  return (
    <DemoPage>
      <DemoSection title="Variants" className="grid">
        <LastEditedBy user={{ name: "Aishath Shiuna" }} at={minutesAgo(5)} />
        <LastEditedBy user={{ name: "Ahmed Ali", href: "#/users/2" }} at={minutesAgo(60 * 26)} />
        <LastEditedBy user={{ name: "މަރިޔަމް ޒާހިރާ" }} at={minutesAgo(60 * 24 * 40)} />
        <LastEditedBy user={{ name: "Ibrahim Waheed" }} at={minutesAgo(1)} hideAvatar />
        <LastEditedBy at={null} />
      </DemoSection>
    </DemoPage>
  )
}
`;export{e as default};