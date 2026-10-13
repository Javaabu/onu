import * as React from "react"
import { cva } from "class-variance-authority"

import { cn } from "../../lib/utils"

export const formContainerVariants = cva("min-w-0 @container/form-container mx-auto w-full", {
  variants: {
    variant: {
      card: "rounded-xl bg-card text-card-foreground ring-1 ring-border",
      plain: "",
    },
    width: {
      sm: "max-w-sm",
      md: "max-w-xl",
      lg: "max-w-3xl",
      xl: "max-w-5xl",
      full: "max-w-none",
    },
  },
  defaultVariants: { variant: "card", width: "lg" },
})

export interface FormContainerProps extends Omit<React.ComponentProps<"section">, "title"> {
  title?: React.ReactNode
  description?: React.ReactNode
  /** Heading level for the title. Default `2`. */
  headingLevel?: 1 | 2 | 3 | 4
  /** Content beside the title, e.g. a status badge or a secondary action. */
  actions?: React.ReactNode
  /** Footer, usually the submit and cancel buttons. Stacks full width on narrow containers. */
  footer?: React.ReactNode
  /** Content above the title, e.g. a logo. */
  media?: React.ReactNode
  variant?: "card" | "plain"
  width?: "sm" | "md" | "lg" | "xl" | "full"
  /** Centre the header text (auth pages). */
  centered?: boolean
  classNames?: {
    header?: string
    title?: string
    description?: string
    actions?: string
    content?: string
    footer?: string
  }
}

/**
 * A card-style layout for a form: header (title, description, actions), body
 * and footer. Responds to its own width, so it works in a page or a narrow column.
 */
export function FormContainer({
  title,
  description,
  headingLevel = 2,
  actions,
  footer,
  media,
  variant = "card",
  width = "lg",
  centered = false,
  className,
  classNames,
  children,
  ...props
}: FormContainerProps) {
  const titleId = React.useId()
  const Heading = `h${headingLevel}` as const
  const padded = variant === "card"
  const hasHeader = title || description || actions || media
  return (
    <section
      data-slot="form-container"
      data-variant={variant}
      aria-labelledby={title ? titleId : undefined}
      className={cn(formContainerVariants({ variant, width }), className)}
      {...props}
    >
      {hasHeader ? (
        <header
          data-slot="form-container-header"
          className={cn(
            "gap-x-4 gap-y-3 @md/form-container:flex-row @md/form-container:items-start flex flex-col",
            padded && "px-4 pt-5 @md/form-container:px-6 @md/form-container:pt-6",
            centered && "@md/form-container:flex-col @md/form-container:items-center items-center text-center",
            classNames?.header,
          )}
        >
          <div className={cn("gap-1.5 min-w-0 grid flex-1", centered && "justify-items-center")}>
            {media ? <div data-slot="form-container-media">{media}</div> : null}
            {title ? (
              <Heading
                id={titleId}
                data-slot="form-container-title"
                className={cn("text-lg font-semibold leading-snug @md/form-container:text-xl", classNames?.title)}
              >
                {title}
              </Heading>
            ) : null}
            {description ? (
              <div
                data-slot="form-container-description"
                className={cn("text-sm text-muted-foreground", classNames?.description)}
              >
                {description}
              </div>
            ) : null}
          </div>
          {actions ? (
            <div
              data-slot="form-container-actions"
              className={cn("gap-2 flex shrink-0 flex-wrap items-center", classNames?.actions)}
            >
              {actions}
            </div>
          ) : null}
        </header>
      ) : null}
      <div
        data-slot="form-container-content"
        className={cn(
          "min-w-0",
          padded && "px-4 py-5 @md/form-container:px-6 @md/form-container:py-6",
          !padded && hasHeader && "pt-5",
          classNames?.content,
        )}
      >
        {children}
      </div>
      {footer ? (
        <footer
          data-slot="form-container-footer"
          className={cn(
            "gap-2 @sm/form-container:flex-row @sm/form-container:items-center @sm/form-container:justify-end @sm/form-container:*:data-[slot=button]:w-auto flex flex-col-reverse *:data-[slot=button]:w-full",
            padded && "px-4 py-3 @md/form-container:px-6 rounded-b-xl border-t border-border bg-muted/40",
            !padded && "pt-4",
            classNames?.footer,
          )}
        >
          {footer}
        </footer>
      ) : null}
    </section>
  )
}
