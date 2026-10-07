import { Logo } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"
import { DemoNav } from "./_demo-nav"

export const meta = {
  title: "Logo",
  group: "Layout and navigation",
  order: 25,
  description: "Product or organisation logo with light/dark sources, linking home.",
}

const mark = `${import.meta.env.BASE_URL}favicon.svg`

export default function LogoDemo() {
  return (
    <DemoNav>
      {() => (
        <DemoPage>
          <DemoSection title="Mark and wordmark">
            <Logo src={mark} alt="Onu" text="Onu" />
            <Logo src={mark} alt="Onu" />
            <Logo src={mark} darkSrc={mark} alt="Onu" text="Onu" classNames={{ image: "h-10" }} />
          </DemoSection>
          <DemoSection title="Custom SVG mark, no link">
            <Logo alt="Javaabu" href={null} text="Javaabu">
              <svg viewBox="0 0 32 32" className="size-8 text-primary" aria-hidden="true">
                <rect width="32" height="32" rx="8" fill="currentColor" />
                <path d="M10 22c4 0 6-3 6-8V8h4v6c0 7-4 12-10 12z" className="fill-primary-foreground" />
              </svg>
            </Logo>
          </DemoSection>
        </DemoPage>
      )}
    </DemoNav>
  )
}
