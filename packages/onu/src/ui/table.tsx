"use client"

// Vendored from shadcn/ui (radix base, nova style, RTL) by scripts/sync-shadcn.mjs.
// Onu changes are marked with "onu:" comments; keep them when re-syncing.

import * as React from "react"
import { cn } from "../lib/utils"

function Table({ className, ...props }: React.ComponentProps<"table">) {
  return (
    // onu: focusable so a horizontally scrolling table can be scrolled with the keyboard (WCAG 2.1.1).
    <div
      data-slot="table-container"
      tabIndex={0}
      className="relative w-full overflow-x-auto focus-visible:outline-2 focus-visible:outline-ring"
    >
      <table data-slot="table" className={cn("text-sm w-full caption-bottom", className)} {...props} />
    </div>
  )
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return <thead data-slot="table-header" className={cn("[&_tr]:border-b", className)} {...props} />
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return <tbody data-slot="table-body" className={cn("[&_tr:last-child]:border-0", className)} {...props} />
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn("font-medium border-t bg-muted/50 [&>tr]:last:border-b-0", className)}
      {...props}
    />
  )
}

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      // onu: selected rows are tinted with the brand colour.
      className={cn(
        "border-b transition-colors hover:bg-muted/50 has-aria-expanded:bg-muted/50 data-[state=selected]:bg-primary-subtle",
        className,
      )}
      {...props}
    />
  )
}

function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        "h-10 px-2 font-medium [&:has([role=checkbox])]:pe-0 text-start align-middle whitespace-nowrap text-foreground",
        className,
      )}
      {...props}
    />
  )
}

function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return (
    <td
      data-slot="table-cell"
      className={cn("p-2 [&:has([role=checkbox])]:pe-0 align-middle whitespace-nowrap", className)}
      {...props}
    />
  )
}

function TableCaption({ className, ...props }: React.ComponentProps<"caption">) {
  return (
    <caption data-slot="table-caption" className={cn("mt-4 text-sm text-muted-foreground", className)} {...props} />
  )
}

export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption }
