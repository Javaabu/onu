import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "../../lib/utils"

export const sectionVariants = cva("gap-4 @container/section flex flex-col", {
  variants: {
    variant: {
      plain: "",
      card: "p-4 sm:p-6 rounded-xl bg-card text-card-foreground ring-1 ring-foreground/10",
      muted: "p-4 sm:p-6 rounded-xl bg-muted/50",
    },
  },
  defaultVariants: { variant: "plain" },
})

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6

export interface SectionProps
  extends Omit<React.ComponentProps<"section">, "title">, VariantProps<typeof sectionVariants> {
  title?: React.ReactNode
  description?: React.ReactNode
  /** Buttons or links at the end of the header. They move under the text in narrow containers. */
  actions?: React.ReactNode
  /** Heading element for the title. */
  headingLevel?: HeadingLevel
  classNames?: { header?: string; title?: string; description?: string; actions?: string; content?: string }
}

/**
 * A page section with a heading, description and actions. Labelled by its heading,
 * so it is exposed as a region landmark.
 */
export function Section({
  title,
  description,
  actions,
  headingLevel = 2,
  variant,
  className,
  classNames,
  children,
  id,
  ...props
}: SectionProps) {
  const autoId = React.useId()
  const titleId = `${id ?? autoId}-title`
  const descriptionId = `${id ?? autoId}-description`
  const Heading = `h${headingLevel}` as const
  const hasHeader = Boolean(title || description || actions)

  return (
    <section
      data-slot="section"
      id={id}
      aria-labelledby={title ? titleId : undefined}
      aria-describedby={description ? descriptionId : undefined}
      className={cn(sectionVariants({ variant }), className)}
      {...props}
    >
      {hasHeader ? (
        <div
          data-slot="section-header"
          className={cn("gap-3 @lg/section:flex-row @lg/section:items-start flex flex-col", classNames?.header)}
        >
          <div className="gap-1 min-w-0 flex flex-1 flex-col">
            {title ? (
              <Heading
                id={titleId}
                data-slot="section-title"
                className={cn("text-lg font-semibold leading-snug tracking-tight", classNames?.title)}
              >
                {title}
              </Heading>
            ) : null}
            {description ? (
              <p
                id={descriptionId}
                data-slot="section-description"
                className={cn("text-sm text-muted-foreground", classNames?.description)}
              >
                {description}
              </p>
            ) : null}
          </div>
          {actions ? (
            <div
              data-slot="section-actions"
              className={cn("gap-2 @lg/section:shrink-0 flex flex-wrap items-center", classNames?.actions)}
            >
              {actions}
            </div>
          ) : null}
        </div>
      ) : null}
      {children !== undefined && children !== null ? (
        <div data-slot="section-content" className={cn("min-w-0", classNames?.content)}>
          {children}
        </div>
      ) : null}
    </section>
  )
}
