import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, cn } from "@javaabu/onu"

/** A titled block on a showcase page. */
export function DemoSection({
  title,
  description,
  children,
  className,
}: {
  title: string
  description?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent className={cn("gap-3 flex flex-wrap items-start", className)}>{children}</CardContent>
    </Card>
  )
}

/** Stacks sections on a showcase page. */
export function DemoPage({ children }: { children: React.ReactNode }) {
  return <div className="gap-6 grid">{children}</div>
}
