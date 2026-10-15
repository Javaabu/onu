import * as React from "react"
import { Button, PageProgress, createPageProgress, pageProgress, usePageProgress } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"

export const meta = {
  title: "Page progress bar",
  group: "Loading",
  order: 5,
  description: "Thin NProgress-style bar with a start()/done() API and a hook. Grows from the inline start.",
}

const local = createPageProgress()

function SlowWidget() {
  const [loading, setLoading] = React.useState(false)
  usePageProgress(loading)
  return (
    <Button
      variant="outline"
      onClick={() => {
        setLoading(true)
        setTimeout(() => setLoading(false), 2500)
      }}
    >
      usePageProgress(loading)
    </Button>
  )
}

export default function PageProgressDemo() {
  return (
    <DemoPage>
      <PageProgress />
      <DemoSection title="Global bar" description="Shown at the very top of the window.">
        <Button onClick={() => pageProgress.start()}>start()</Button>
        <Button variant="outline" onClick={() => pageProgress.inc(0.2)}>
          inc(0.2)
        </Button>
        <Button variant="outline" onClick={() => pageProgress.done()}>
          done()
        </Button>
        <SlowWidget />
      </DemoSection>
      <DemoSection title="Inside a container" description='A separate controller and position="absolute".'>
        <div className="h-24 relative w-full overflow-hidden rounded-lg border">
          <PageProgress controller={local} position="absolute" color="success" height={4} delay={0} />
          <div className="gap-2 p-4 flex">
            <Button size="sm" onClick={() => local.start()}>
              start()
            </Button>
            <Button size="sm" variant="outline" onClick={() => local.set(0.5)}>
              set(0.5)
            </Button>
            <Button size="sm" variant="outline" onClick={() => local.done()}>
              done()
            </Button>
          </div>
        </div>
      </DemoSection>
    </DemoPage>
  )
}
