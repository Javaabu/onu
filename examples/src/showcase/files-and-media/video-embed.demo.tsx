import { VideoEmbed } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"
import { scene } from "./_mock"

export const meta = { title: "Click-to-load video embed", group: "Files and media", order: 17 }

export default function VideoEmbedDemo() {
  return (
    <DemoPage>
      <DemoSection
        title="YouTube and Vimeo"
        description="Nothing loads from the provider until the play button is pressed."
        className="gap-4 md:grid-cols-2 grid w-full"
      >
        <VideoEmbed
          url="https://www.youtube.com/watch?v=aqz-KE-bpKQ"
          title="Big Buck Bunny (YouTube)"
          thumbnail={scene("YouTube video", 0, 1280, 720)}
          notice="Plays from youtube-nocookie.com"
        />
        <VideoEmbed
          url="https://vimeo.com/76979871"
          title="The New Vimeo Player"
          thumbnail={scene("Vimeo video", 200, 1280, 720)}
        />
      </DemoSection>
      <DemoSection title="Square, Dhivehi title" className="max-w-sm w-full">
        <VideoEmbed
          provider="youtube"
          videoId="aqz-KE-bpKQ"
          title="ރަށު ވީޑިއޯ"
          aspectRatio={1}
          thumbnail={scene("", 150, 600, 600)}
        />
      </DemoSection>
    </DemoPage>
  )
}
