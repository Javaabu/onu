import { FileIcon } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"

export const meta = { title: "File icon", group: "Files and media", order: 18 }

const names = [
  "photo.jpg",
  "clip.mp4",
  "song.mp3",
  "report.pdf",
  "letter.docx",
  "budget.xlsx",
  "slides.pptx",
  "archive.zip",
  "notes.txt",
  "data.bin",
]

export default function FileIconDemo() {
  return (
    <DemoPage>
      <DemoSection title="By type" className="gap-4 flex flex-wrap">
        {names.map((name) => (
          <div key={name} className="gap-1 text-xs flex flex-col items-center text-muted-foreground">
            <FileIcon name={name} />
            {name}
          </div>
        ))}
      </DemoSection>
      <DemoSection title="Sizes" className="gap-4 flex items-center">
        <FileIcon name="a.pdf" size="sm" />
        <FileIcon name="a.pdf" />
        <FileIcon name="a.pdf" size="lg" />
      </DemoSection>
    </DemoPage>
  )
}
