"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { Icon } from "../../icons/icon"
import { cn } from "../../lib/utils"
import { useOnu, useTranslation } from "../../providers/onu-provider"
import { Button } from "../../ui/button"
import { useRestoreFocus } from "./_use-restore-focus"
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "../../ui/sheet"

export const slideOverVariants = cva(
  "gap-0 p-0 data-[side=left]:w-[calc(100%-2.5rem)] data-[side=right]:w-[calc(100%-2.5rem)]",
  {
    variants: {
      size: {
        sm: "data-[side=left]:sm:max-w-sm data-[side=right]:sm:max-w-sm",
        md: "data-[side=left]:sm:max-w-md data-[side=right]:sm:max-w-md",
        lg: "data-[side=left]:sm:max-w-xl data-[side=right]:sm:max-w-xl",
        xl: "data-[side=left]:sm:max-w-3xl data-[side=right]:sm:max-w-3xl",
        full: "data-[side=left]:sm:max-w-none data-[side=right]:sm:max-w-none data-[side=left]:w-full data-[side=right]:w-full",
      },
    },
    defaultVariants: { size: "md" },
  },
)

export type SlideOverSide = "start" | "end"
export type SlideOverSize = NonNullable<VariantProps<typeof slideOverVariants>["size"]>

/** Root of a composable slide-over (shadcn `Sheet`). */
export const SlideOverRoot = Sheet
export const SlideOverTrigger = SheetTrigger
export const SlideOverClose = SheetClose

/** Maps a logical side to the physical one for the current direction (R11.1). */
export function physicalSide(side: SlideOverSide, dir: "ltr" | "rtl"): "left" | "right" {
  return (side === "start") === (dir === "ltr") ? "left" : "right"
}

export interface SlideOverContentProps
  extends
    Omit<React.ComponentProps<typeof SheetContent>, "side" | "showCloseButton">,
    VariantProps<typeof slideOverVariants> {
  /** Edge it slides in from: `start` (left in LTR, right in RTL) or `end`. Default `end`. */
  side?: SlideOverSide
}

/** The panel. Flex column so the header and footer stay put while the body scrolls. */
export function SlideOverContent({
  side = "end",
  size,
  className,
  ref,
  onCloseAutoFocus,
  ...props
}: SlideOverContentProps) {
  const { dir } = useOnu()
  const restore = useRestoreFocus(ref, onCloseAutoFocus)
  return (
    <SheetContent
      data-logical-side={side}
      data-size={size ?? "md"}
      side={physicalSide(side, dir)}
      showCloseButton={false}
      className={cn(slideOverVariants({ size }), className)}
      {...props}
      {...restore}
    />
  )
}

export interface SlideOverHeaderProps extends React.ComponentProps<"div"> {
  closeButton?: boolean
  classNames?: { close?: string }
}

/** Sticky header with the title and a close button. */
export function SlideOverHeader({
  className,
  classNames,
  closeButton = true,
  children,
  ...props
}: SlideOverHeaderProps) {
  const { t } = useTranslation()
  return (
    <div
      data-slot="slide-over-header"
      className={cn(
        "gap-1 px-4 pb-3 relative flex shrink-0 flex-col border-b pt-[max(1rem,env(safe-area-inset-top))]",
        closeButton && "pe-12",
        className,
      )}
      {...props}
    >
      {children}
      {closeButton ? (
        <SheetClose asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            data-slot="slide-over-close"
            className={cn("top-3 end-3 absolute", classNames?.close)}
          >
            <Icon name="close" />
            <span className="sr-only">{t("overlay.close")}</span>
          </Button>
        </SheetClose>
      ) : null}
    </div>
  )
}

export function SlideOverTitle({ className, ...props }: React.ComponentProps<typeof SheetTitle>) {
  return <SheetTitle data-slot="slide-over-title" className={cn("font-semibold", className)} {...props} />
}

export function SlideOverDescription(props: React.ComponentProps<typeof SheetDescription>) {
  return <SheetDescription data-slot="slide-over-description" {...props} />
}

export function SlideOverBody({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="slide-over-body"
      className={cn("p-4 min-h-0 flex-1 overflow-y-auto overscroll-contain", className)}
      {...props}
    />
  )
}

/** Sticky footer for actions, padded for the home indicator on notched phones (R3.30). */
export function SlideOverFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="slide-over-footer"
      className={cn(
        "gap-2 px-4 pt-3 sm:flex-row sm:justify-end flex shrink-0 flex-col-reverse border-t bg-muted/50 pb-[max(0.75rem,env(safe-area-inset-bottom))]",
        className,
      )}
      {...props}
    />
  )
}

export interface SlideOverProps
  extends
    Omit<SlideOverContentProps, "title" | "children">,
    Pick<React.ComponentProps<typeof Sheet>, "open" | "defaultOpen" | "onOpenChange" | "modal"> {
  trigger?: React.ReactNode
  title: React.ReactNode
  description?: React.ReactNode
  footer?: React.ReactNode
  closeButton?: boolean
  children?: React.ReactNode
  classNames?: { header?: string; title?: string; description?: string; body?: string; footer?: string; close?: string }
}

/**
 * A panel that slides in from the inline start or end, for detail views,
 * quick edits and filters. `side` is logical, so it flips in RTL. Header and
 * footer stay visible while the body scrolls.
 */
export function SlideOver({
  open,
  defaultOpen,
  onOpenChange,
  modal,
  trigger,
  title,
  description,
  footer,
  closeButton = true,
  children,
  classNames,
  ...props
}: SlideOverProps) {
  return (
    <SlideOverRoot open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange} modal={modal}>
      {trigger ? <SlideOverTrigger asChild>{trigger}</SlideOverTrigger> : null}
      <SlideOverContent {...(description ? {} : { "aria-describedby": undefined })} {...props}>
        <SlideOverHeader
          closeButton={closeButton}
          className={classNames?.header}
          classNames={{ close: classNames?.close }}
        >
          <SlideOverTitle className={classNames?.title}>{title}</SlideOverTitle>
          {description ? (
            <SlideOverDescription className={classNames?.description}>{description}</SlideOverDescription>
          ) : null}
        </SlideOverHeader>
        <SlideOverBody className={classNames?.body}>{children}</SlideOverBody>
        {footer ? <SlideOverFooter className={classNames?.footer}>{footer}</SlideOverFooter> : null}
      </SlideOverContent>
    </SlideOverRoot>
  )
}
