"use client"

// Vendored from shadcn/ui (radix base, nova style, RTL) by scripts/sync-shadcn.mjs.
// Onu changes are marked with "onu:" comments; keep them when re-syncing.

import * as React from "react"
import { Command as CommandPrimitive } from "cmdk"
import { cn } from "../lib/utils"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./dialog"
import { InputGroup, InputGroupAddon } from "./input-group"
// onu: fixed glyphs passed as Icon fallbacks, so primitives work without OnuProvider and the full icon map.
import { CheckIcon, SearchIcon } from "lucide-react"
import { Icon } from "../icons/icon"
import { useTranslation } from "../providers/onu-provider"

function Command({ className, ...props }: React.ComponentProps<typeof CommandPrimitive>) {
  return (
    <CommandPrimitive
      data-slot="command"
      className={cn(
        "p-1 flex size-full flex-col overflow-hidden rounded-xl! bg-popover text-popover-foreground",
        className,
      )}
      {...props}
    />
  )
}

function CommandDialog({
  title,
  description,
  children,
  className,
  showCloseButton = false,
  ...props
}: React.ComponentProps<typeof Dialog> & {
  title?: string
  description?: string
  className?: string
  showCloseButton?: boolean
}) {
  const { t } = useTranslation() // onu: translated defaults
  return (
    <Dialog {...props}>
      <DialogHeader className="sr-only">
        <DialogTitle>{title ?? t("common.commandPalette")}</DialogTitle>
        <DialogDescription>{description ?? t("common.commandPaletteDescription")}</DialogDescription>
      </DialogHeader>
      <DialogContent
        className={cn("translate-y-0 p-0 top-1/3 overflow-hidden rounded-xl!", className)}
        showCloseButton={showCloseButton}
      >
        {children}
      </DialogContent>
    </Dialog>
  )
}

function CommandInput({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Input>) {
  return (
    <div data-slot="command-input-wrapper" className="p-1 pb-0">
      <InputGroup className="h-8! *:data-[slot=input-group-addon]:ps-2! rounded-lg! border-input/30 bg-input/30 shadow-none!">
        <CommandPrimitive.Input
          data-slot="command-input"
          className={cn("text-sm w-full outline-hidden disabled:cursor-not-allowed disabled:opacity-50", className)}
          {...props}
        />
        <InputGroupAddon>
          <Icon name="search" fallback={SearchIcon} className="size-4 shrink-0 opacity-50" />
        </InputGroupAddon>
      </InputGroup>
    </div>
  )
}

function CommandList({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.List>) {
  return (
    <CommandPrimitive.List
      data-slot="command-list"
      className={cn("max-h-72 scroll-py-1 no-scrollbar overflow-x-hidden overflow-y-auto outline-none", className)}
      {...props}
    />
  )
}

function CommandEmpty({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Empty>) {
  return (
    <CommandPrimitive.Empty
      data-slot="command-empty"
      className={cn("py-6 text-sm text-center", className)}
      {...props}
    />
  )
}

function CommandGroup({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Group>) {
  return (
    <CommandPrimitive.Group
      data-slot="command-group"
      className={cn(
        "p-1 **:[[cmdk-group-heading]]:px-2 **:[[cmdk-group-heading]]:py-1.5 **:[[cmdk-group-heading]]:text-xs **:[[cmdk-group-heading]]:font-medium overflow-hidden text-foreground **:[[cmdk-group-heading]]:text-muted-foreground",
        className,
      )}
      {...props}
    />
  )
}

function CommandSeparator({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Separator>) {
  return (
    <CommandPrimitive.Separator
      data-slot="command-separator"
      className={cn("-mx-1 h-px bg-border", className)}
      {...props}
    />
  )
}

function CommandItem({ className, children, ...props }: React.ComponentProps<typeof CommandPrimitive.Item>) {
  return (
    <CommandPrimitive.Item
      data-slot="command-item"
      // onu: highlighted item uses the brand-tinted accent.
      className={cn(
        "gap-2 px-2 py-1.5 text-sm [&_svg:not([class*='size-'])]:size-4 group/command-item relative flex cursor-default items-center rounded-sm outline-hidden select-none in-data-[slot=dialog-content]:rounded-lg! data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 data-selected:bg-accent data-selected:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 data-selected:*:[svg]:text-accent-foreground",
        className,
      )}
      {...props}
    >
      {children}
      <Icon
        name="check"
        fallback={CheckIcon}
        className="ms-auto opacity-0 group-has-data-[slot=command-shortcut]/command-item:hidden group-data-[checked=true]/command-item:opacity-100"
      />
    </CommandPrimitive.Item>
  )
}

function CommandShortcut({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="command-shortcut"
      className={cn(
        "text-xs tracking-widest ms-auto text-muted-foreground group-data-selected/command-item:text-foreground",
        className,
      )}
      {...props}
    />
  )
}

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
}
