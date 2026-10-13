"use client"

// Vendored from shadcn/ui (radix base, nova style, RTL) by scripts/sync-shadcn.mjs.
// Onu changes are marked with "onu:" comments; keep them when re-syncing.

import * as React from "react"
import { cn } from "../lib/utils"

function Table({ className, ...props }: React.ComponentProps<"table">) {
  return (
    // onu: focusable so a horizontally scrolling table can be scrolled with the keyboard (WCAG 2.1.1).
    <div data-slot="table-container" tabIndex={0} className="relative w-full overflow-x-auto focus-visible:outline-2 focus-visible:outline-ring">
      <table
        data-slot="table"
        className={cn("w-full caption-bottom text-sm", className)}
        {...props}
      />
    </div>
  )
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return (
    <thead
      data-slot="table-header"
      className={cn("[&_tr]:border-b", className)}
      {...props}
    />
  )
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    />
  )
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn("bg-muted border-t font-medium [&>tr]:last:border-b-0", className)}
      {...props}
    />
  )
}

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      // onu: Ant rows: #fafafa hover, selected rows in the brand's lightest step (one deeper on hover).
      className={cn("hover:bg-muted data-[state=selected]:bg-primary-1 data-[state=selected]:hover:bg-primary-2 border-b border-border transition-colors has-aria-expanded:bg-muted", className)}
      {...props}
    />
  )
}

function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      data-slot="table-head"
      // onu: Ant header: grey fill, semibold, 12px 16px, and a short split line between header cells.
      className={cn("text-foreground bg-muted relative h-auto px-4 py-3 text-start align-middle font-semibold whitespace-nowrap [&:has([role=checkbox])]:pe-0 not-last:before:absolute not-last:before:end-0 not-last:before:top-1/2 not-last:before:h-[1.6em] not-last:before:w-px not-last:before:-translate-y-1/2 not-last:before:bg-border", className)}
      {...props}
    />
  )
}

function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return (
    <td
      data-slot="table-cell"
      // onu: Ant's middle-size cells, 12px 16px.
      className={cn("px-4 py-3 align-middle whitespace-nowrap [&:has([role=checkbox])]:pe-0", className)}
      {...props}
    />
  )
}

function TableCaption({
  className,
  ...props
}: React.ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("text-muted-foreground mt-4 text-sm", className)}
      {...props}
    />
  )
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}
