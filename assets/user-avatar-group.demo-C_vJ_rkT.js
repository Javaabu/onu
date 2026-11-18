var e=`import { UserAvatarGroup } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"
import { people } from "./_data"

export const meta = {
  title: "Avatar group",
  group: "Display and feedback",
  order: 5,
  description: "Overlapping avatars; “+N” opens the list of the rest.",
}

export default function UserAvatarGroupDemo() {
  return (
    <DemoPage>
      <DemoSection title="Overflow" description="Click or tap +N to see everyone else.">
        <UserAvatarGroup users={people} max={4} />
      </DemoSection>
      <DemoSection title="Sizes">
        <UserAvatarGroup users={people} max={3} size="xs" />
        <UserAvatarGroup users={people} max={5} size="sm" />
        <UserAvatarGroup users={people} max={4} size="lg" />
      </DemoSection>
      <DemoSection title="Fits within max">
        <UserAvatarGroup users={people.slice(0, 3)} />
        <UserAvatarGroup users={people.slice(0, 3)} shape="square" />
      </DemoSection>
    </DemoPage>
  )
}
`;export{e as default};