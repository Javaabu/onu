var e=`import { UserAvatar } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"
import { people } from "./_data"

export const meta = {
  title: "Avatar",
  group: "Display and feedback",
  order: 4,
  description: "Image with an initials fallback for English and Dhivehi names, and a presence dot.",
}

export default function UserAvatarDemo() {
  return (
    <DemoPage>
      <DemoSection title="Initials (English and Dhivehi)">
        {people.map((p) => (
          <UserAvatar key={p.id} name={p.name} />
        ))}
        <UserAvatar />
      </DemoSection>
      <DemoSection title="Sizes and shapes">
        {(["xs", "sm", "md", "lg", "xl"] as const).map((size) => (
          <UserAvatar key={size} name="Aishath Shiuna" size={size} />
        ))}
        <UserAvatar name="Ministry of Health" shape="square" size="lg" />
      </DemoSection>
      <DemoSection title="Presence">
        <UserAvatar name="Aishath Shiuna" status="online" size="lg" />
        <UserAvatar name="Ahmed Ali" status="busy" size="lg" />
        <UserAvatar name="މަރިޔަމް ޒާހިރާ" status="away" size="lg" />
        <UserAvatar name="Ibrahim Waheed" status="offline" size="lg" />
      </DemoSection>
      <DemoSection title="Image with fallback" description="The second image is broken, so its initials show.">
        <UserAvatar name="Onu" src={\`\${import.meta.env.BASE_URL}favicon.svg\`} size="lg" />
        <UserAvatar name="Hawwa Shazna" src="/missing.jpg" size="lg" />
      </DemoSection>
    </DemoPage>
  )
}
`;export{e as default};