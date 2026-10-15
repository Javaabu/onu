import { MediaPlayer } from "@javaabu/onu/media"

import { DemoPage, DemoSection } from "../../components/demo"
import { scene } from "./_mock"

export const meta = { title: "Media player", group: "Files and media", order: 16 }

const captions = `data:text/vtt;charset=utf-8,${encodeURIComponent("WEBVTT\n\n00:00.000 --> 00:05.000\nWelcome to the reef restoration project.\n")}`
const dvCaptions = `data:text/vtt;charset=utf-8,${encodeURIComponent("WEBVTT\n\n00:00.000 --> 00:05.000\nފަރު އާލާކުރުމުގެ މަޝްރޫއަށް މަރުޙަބާ.\n")}`

export default function MediaPlayerDemo() {
  return (
    <DemoPage>
      <DemoSection
        title="Video with captions"
        description="Space/K play, M mute, F full screen, C captions, arrow keys seek. Labels follow the locale."
        className="block w-full"
      >
        <MediaPlayer
          className="max-w-3xl mx-auto"
          title="Coral reef restoration in Baa Atoll"
          src="https://stream.mux.com/A3VXy02VoUinw01pSeZaghmfBBHnNVYrXk/low.mp4"
          poster={scene("Baa Atoll reef", 185, 1280, 720)}
          tracks={[
            { src: dvCaptions, srcLang: "dv", label: "ދިވެހި" },
            { src: captions, srcLang: "en", label: "English", default: true },
          ]}
        />
      </DemoSection>
      <DemoSection title="Audio" className="block w-full">
        <MediaPlayer
          kind="audio"
          className="max-w-3xl mx-auto"
          title="Radio programme: island news"
          src="https://upload.wikimedia.org/wikipedia/commons/c/c8/Example.ogg"
        />
      </DemoSection>
    </DemoPage>
  )
}
