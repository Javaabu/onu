var e=`import * as React from "react"
import {
  ErrorPage,
  ForbiddenPage,
  MaintenancePage,
  NotFoundPage,
  ServerErrorPage,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"

export const meta = {
  title: "Error pages",
  group: "Display and feedback",
  order: 26,
  description: "403, 404, 500 and maintenance (503) pages with actions, in English and Dhivehi.",
}

export default function ErrorPageDemo() {
  const [retries, setRetries] = React.useState(0)
  return (
    <DemoPage>
      <DemoSection title="Pages" className="block">
        <Tabs defaultValue="404">
          <TabsList>
            <TabsTrigger value="403">403</TabsTrigger>
            <TabsTrigger value="404">404</TabsTrigger>
            <TabsTrigger value="500">500</TabsTrigger>
            <TabsTrigger value="503">503</TabsTrigger>
            <TabsTrigger value="custom">Custom</TabsTrigger>
          </TabsList>
          <TabsContent value="403">
            <ForbiddenPage as="div" homeHref="#/" />
          </TabsContent>
          <TabsContent value="404">
            <NotFoundPage as="div" homeHref="#/" />
          </TabsContent>
          <TabsContent value="500">
            <ServerErrorPage
              as="div"
              homeHref="#/"
              onRetry={() => setRetries((n) => n + 1)}
              message={retries ? \`Still failing after \${retries} retries.\` : undefined}
            />
          </TabsContent>
          <TabsContent value="503">
            <MaintenancePage as="div" homeHref={null} showBack={false} />
          </TabsContent>
          <TabsContent value="custom">
            <ErrorPage
              as="div"
              code={419}
              title="Session expired"
              message="Please sign in again to continue."
              homeHref="#/"
              showBack={false}
              illustration={
                <svg viewBox="0 0 120 80" className="w-40 text-primary" aria-hidden>
                  <rect x="10" y="10" width="100" height="60" rx="8" fill="currentColor" opacity="0.15" />
                  <circle cx="60" cy="40" r="16" fill="none" stroke="currentColor" strokeWidth="4" />
                  <path d="M60 30v10l7 5" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round" />
                </svg>
              }
            />
          </TabsContent>
        </Tabs>
      </DemoSection>
    </DemoPage>
  )
}
`;export{e as default};