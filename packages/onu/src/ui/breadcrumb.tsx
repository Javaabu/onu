// Vendored from shadcn/ui (radix base, nova style, RTL) by scripts/sync-shadcn.mjs.
// Onu changes are marked with "onu:" comments; keep them when re-syncing.
import * as React from "react"
import { cn } from "../lib/utils"
import { Slot } from "radix-ui"

// onu: fixed glyphs passed as Icon fallbacks, so primitives work without OnuProvider and the full icon map.
import { ChevronRightIcon, MoreHorizontalIcon } from "lucide-react"
import { Icon } from "../icons/icon"
import { useTranslation } from "../providers/onu-provider"

function Breadcrumb({ className, ...props }: React.ComponentProps<"nav">) {
  const { t } = useTranslation() // onu: translated labels
  return <nav aria-label={t("common.breadcrumb")} data-slot="breadcrumb" className={cn(className)} {...props} />
}

function BreadcrumbList({ className, ...props }: React.ComponentProps<"ol">) {
  return (
    <ol
      data-slot="breadcrumb-list"
      className={cn("gap-1.5 text-sm flex flex-wrap items-center wrap-break-word text-muted-foreground", className)}
      {...props}
    />
  )
}

function BreadcrumbItem({ className, ...props }: React.ComponentProps<"li">) {
  return <li data-slot="breadcrumb-item" className={cn("gap-1 inline-flex items-center", className)} {...props} />
}

function BreadcrumbLink({
  asChild,
  className,
  ...props
}: React.ComponentProps<"a"> & {
  asChild?: boolean
}) {
  const Comp = asChild ? Slot.Root : "a"

  return (
    <Comp data-slot="breadcrumb-link" className={cn("transition-colors hover:text-foreground", className)} {...props} />
  )
}

function BreadcrumbPage({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="breadcrumb-page"
      role="link"
      aria-disabled="true"
      aria-current="page"
      className={cn("font-normal text-foreground", className)}
      {...props}
    />
  )
}

function BreadcrumbSeparator({ children, className, ...props }: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="breadcrumb-separator"
      role="presentation"
      aria-hidden="true"
      className={cn("[&>svg]:size-3.5", className)}
      {...props}
    >
      {/* onu: Icon already mirrors directional icons in RTL; an extra rtl:rotate-180 cancelled that out. */}
      {children ?? <Icon name="chevron-right" fallback={ChevronRightIcon} />}
    </li>
  )
}

function BreadcrumbEllipsis({ className, ...props }: React.ComponentProps<"span">) {
  const { t } = useTranslation() // onu: translated labels
  return (
    <span
      data-slot="breadcrumb-ellipsis"
      role="presentation"
      aria-hidden="true"
      className={cn("size-5 [&>svg]:size-4 flex items-center justify-center", className)}
      {...props}
    >
      <Icon name="more" fallback={MoreHorizontalIcon} />
      <span className="sr-only">{t("common.more")}</span>
    </span>
  )
}

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
}
