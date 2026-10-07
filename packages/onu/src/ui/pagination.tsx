// Vendored from shadcn/ui (radix base, nova style, RTL) by scripts/sync-shadcn.mjs.
// Onu changes are marked with "onu:" comments; keep them when re-syncing.
import * as React from "react"
import { cn } from "../lib/utils"

import { Button } from "./button"
import { Icon } from "../icons/icon"
import { useTranslation } from "../providers/onu-provider"

function Pagination({ className, ...props }: React.ComponentProps<"nav">) {
  const { t } = useTranslation() // onu: translated labels
  return (
    <nav
      role="navigation"
      aria-label={t("common.pagination")}
      data-slot="pagination"
      className={cn(
        "mx-auto flex w-full justify-center",
        className
      )}
      {...props}
    />
  )
}

function PaginationContent({
  className,
  ...props
}: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="pagination-content"
      className={cn("gap-0.5 flex items-center", className)}
      {...props}
    />
  )
}

function PaginationItem({ ...props }: React.ComponentProps<"li">) {
  return <li data-slot="pagination-item" {...props} />
}

type PaginationLinkProps = {
  isActive?: boolean
} & Pick<React.ComponentProps<typeof Button>, "size"> &
  React.ComponentProps<"a">

function PaginationLink({
  className,
  isActive,
  size = "icon",
  ...props
}: PaginationLinkProps) {
  return (
    <Button
      asChild
      variant={isActive ? "outline" : "ghost"}
      size={size}
      className={cn(className)}
    >
      <a
        aria-current={isActive ? "page" : undefined}
        data-slot="pagination-link"
        data-active={isActive}
        {...props}
      />
    </Button>
  )
}

function PaginationPrevious({
  className,
  text,
  ...props
}: React.ComponentProps<typeof PaginationLink> & { text?: string }) {
  const { t } = useTranslation() // onu: translated labels
  return (
    <PaginationLink
      aria-label={t("common.goToPreviousPage")}
      size="default"
      className={cn("ps-1.5!", className)}
      {...props}
    >
      {/* onu: Icon already mirrors in RTL */}
      <Icon name="chevron-left" data-icon="inline-start" />
      <span className="hidden sm:block">
        {text ?? t("common.previous")}
      </span>
    </PaginationLink>
  )
}

function PaginationNext({
  className,
  text,
  ...props
}: React.ComponentProps<typeof PaginationLink> & { text?: string }) {
  const { t } = useTranslation() // onu: translated labels
  return (
    <PaginationLink
      aria-label={t("common.goToNextPage")}
      size="default"
      className={cn("pe-1.5!", className)}
      {...props}
    >
      <span className="hidden sm:block">{text ?? t("common.next")}</span>
      {/* onu: Icon already mirrors in RTL */}
      <Icon name="chevron-right" data-icon="inline-end" />
    </PaginationLink>
  )
}

function PaginationEllipsis({
  className,
  ...props
}: React.ComponentProps<"span">) {
  const { t } = useTranslation() // onu: translated labels
  return (
    <span
      aria-hidden
      data-slot="pagination-ellipsis"
      className={cn(
        "size-8 [&_svg:not([class*='size-'])]:size-4 flex items-center justify-center",
        className
      )}
      {...props}
    >
      <Icon name="more" />
      <span className="sr-only">{t("common.morePages")}</span>
    </span>
  )
}

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
}
