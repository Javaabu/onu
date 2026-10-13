import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "../../lib/utils"
import { CardAction, CardContent, CardDescription, CardFooter, CardHeader } from "../../ui/card"
import { NavLink } from "./_nav"

/** The shadcn card surface, as variants (R15.3). */
export const cardVariants = cva(
  // Ant's card: 24px padding, a 1px split line (no shadow), and a 56px header with its own bottom line.
  "text-sm [--card-spacing:--spacing(6)] has-data-[slot=card-footer]:pb-0 has-[>img:first-child]:pt-0 has-[>[data-slot=card-header][data-bordered]]:pt-0 data-[size=sm]:[--card-spacing:--spacing(3)] data-[size=sm]:has-data-[slot=card-footer]:pb-0 group/card flex flex-col gap-(--card-spacing) overflow-hidden rounded-xl bg-card py-(--card-spacing) text-card-foreground ring-1 ring-border *:[img:first-child]:rounded-t-xl *:[img:last-child]:rounded-b-xl",
  {
    variants: {
      variant: {
        default: "",
        outline: "bg-transparent",
        muted: "bg-muted/50 ring-0",
      },
      interactive: {
        true: "hover:shadow-sm relative transition-shadow focus-within:ring-2 focus-within:ring-ring/50 hover:ring-foreground/25",
        false: "",
      },
    },
    defaultVariants: { variant: "default", interactive: false },
  },
)

type HeadingLevel = 2 | 3 | 4 | 5 | 6

export interface CardProps
  extends Omit<React.ComponentProps<"div">, "title">, Omit<VariantProps<typeof cardVariants>, "interactive"> {
  size?: "default" | "sm"
  /** Card title. When set, the header (title, description, actions) is rendered for you. */
  title?: React.ReactNode
  description?: React.ReactNode
  /** Buttons or a menu at the end of the header. */
  actions?: React.ReactNode
  /** Footer content (buttons, links, meta). */
  footer?: React.ReactNode
  /** Makes the whole card a link (the title is the link text, stretched over the card). */
  href?: string
  external?: boolean
  headingLevel?: HeadingLevel
  /** Render the root as its child element, e.g. `<article>` or a router link. */
  asChild?: boolean
  /**
   * Inline padding for content placed straight in the card (no `title`,
   * `description`, `actions` or `footer`). Default `true`: each direct child
   * (except images, which stay edge to edge) gets the card's content padding,
   * the same as `CardContent`, so composing with `CardHeader`/`CardContent`
   * is unchanged. Set `false` for edge-to-edge content such as a table: no
   * padding at all (the content brings its own).
   */
  padded?: boolean
  classNames?: {
    header?: string
    title?: string
    description?: string
    actions?: string
    content?: string
    footer?: string
  }
}

/** Pads a bare card's direct children like `CardContent` (images stay full-bleed). */
const PADDED_CHILDREN = "[&>:not(img)]:px-(--card-spacing)"

function hasTextChild(children: React.ReactNode) {
  return React.Children.toArray(children).some((child) => typeof child === "string" || typeof child === "number")
}

/**
 * shadcn `Card`, extended with `title`/`description`/`actions`/`footer` props, link
 * cards (`href`) and `asChild`. `CardHeader`, `CardContent`, … still compose as
 * before; other content placed straight in the card gets the content padding.
 */
export function Card({
  size = "default",
  variant,
  title,
  description,
  actions,
  footer,
  href,
  external,
  headingLevel = 3,
  asChild = false,
  padded = true,
  className,
  classNames,
  children,
  ...props
}: CardProps) {
  const Root = asChild ? Slot.Root : "div"
  const Heading = `h${headingLevel}` as const
  const hasHeader = Boolean(title || description || actions)
  const interactive = Boolean(href)

  const titleContent =
    href && title ? (
      <NavLink
        href={href}
        external={external}
        className="after:inset-0 outline-none after:absolute after:content-[''] hover:underline hover:underline-offset-4"
      >
        {title}
      </NavLink>
    ) : (
      title
    )

  const header = hasHeader ? (
    <CardHeader
      data-bordered=""
      className={cn(
        // Ant: a 56px header row with its own bottom line.
        "min-h-14 py-2 group-data-[size=sm]/card:min-h-11 content-center items-center border-b",
        classNames?.header,
      )}
    >
      {title ? (
        <Heading
          data-slot="card-title"
          className={cn("text-base leading-normal font-semibold group-data-[size=sm]/card:text-sm", classNames?.title)}
        >
          {titleContent}
        </Heading>
      ) : null}
      {description ? <CardDescription className={classNames?.description}>{description}</CardDescription> : null}
      {actions ? (
        <CardAction className={cn("gap-1 flex items-center self-center", href && "relative z-10", classNames?.actions)}>
          {actions}
        </CardAction>
      ) : null}
    </CardHeader>
  ) : null
  const footerNode =
    footer !== undefined ? (
      <CardFooter className={cn("gap-2", href && "relative z-10", classNames?.footer)}>{footer}</CardFooter>
    ) : null
  const composed = hasHeader || footerNode
  const padBare = !composed && padded
  // Loose text cannot be padded by a child selector, so it goes in a CardContent.
  const wrapText = padBare && !asChild && hasTextChild(children)

  const rootProps = {
    "data-slot": "card",
    "data-size": size,
    "data-variant": variant ?? "default",
    "data-padded": padBare || undefined,
    className: cn(
      cardVariants({ variant, interactive }),
      padBare && !wrapText && PADDED_CHILDREN,
      !composed && !padded && "gap-0 py-0",
      className,
    ),
    ...props,
  }

  if (composed && asChild) {
    // The child element becomes the card; its own children sit between header and footer.
    return (
      <Slot.Root {...rootProps}>
        {header}
        <Slot.Slottable>{children}</Slot.Slottable>
        {footerNode}
      </Slot.Root>
    )
  }

  let body: React.ReactNode = children
  if (wrapText) body = <CardContent className={classNames?.content}>{children}</CardContent>
  if (composed) {
    body = (
      <>
        {header}
        {children !== undefined && children !== null ? (
          <CardContent className={classNames?.content}>{children}</CardContent>
        ) : null}
        {footerNode}
      </>
    )
  }

  return <Root {...rootProps}>{body}</Root>
}
