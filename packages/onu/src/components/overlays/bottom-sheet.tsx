"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Drawer as DrawerPrimitive } from "vaul"

import { Icon } from "../../icons/icon"
import { cn } from "../../lib/utils"
import { useTranslation } from "../../providers/onu-provider"
import { Button } from "../../ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerDescription,
  DrawerOverlay,
  DrawerPortal,
  DrawerTitle,
  DrawerTrigger,
} from "../../ui/drawer"
import { useControllableState } from "./_use-controllable-state"
import { useRestoreFocus } from "./_use-restore-focus"
import { registerEnglish } from "../../i18n/english"
import { overlay as en_overlay } from "../../locales/en/overlay"

registerEnglish({ overlay: en_overlay })

export const bottomSheetVariants = cva(
  "group/bottom-sheet inset-x-0 bottom-0 text-sm fixed z-50 mx-auto flex flex-col rounded-t-2xl bg-popover text-popover-foreground shadow-popup ring-1 ring-border outline-none",
  {
    variants: {
      /** Maximum width on wider screens; on phones the sheet is always full width. */
      size: {
        sm: "sm:max-w-md",
        md: "sm:max-w-lg",
        lg: "sm:max-w-2xl",
        full: "max-w-none",
      },
    },
    defaultVariants: { size: "md" },
  },
)

export type BottomSheetSize = NonNullable<VariantProps<typeof bottomSheetVariants>["size"]>
export type SnapPoint = number | string

/** Root of a composable bottom sheet. Wraps vaul (shadcn `Drawer`) behind Onu's API (R4.3). */
export const BottomSheetRoot = Drawer
export const BottomSheetTrigger = DrawerTrigger
export const BottomSheetClose = DrawerClose

export interface BottomSheetContentProps
  extends React.ComponentProps<typeof DrawerPrimitive.Content>, VariantProps<typeof bottomSheetVariants> {
  /** Show the drag handle. Default `true`. */
  handle?: boolean
  /** Set when the root has snap points, so the sheet takes the full height and snaps within it. */
  snapping?: boolean
  overlayClassName?: string
  classNames?: { handle?: string }
}

/** The sheet panel, with a drag handle and safe-area padding (R3.30). */
export function BottomSheetContent({
  className,
  classNames,
  overlayClassName,
  size,
  handle = true,
  snapping = false,
  children,
  ref,
  onCloseAutoFocus,
  ...props
}: BottomSheetContentProps) {
  const restore = useRestoreFocus(ref, onCloseAutoFocus)
  return (
    <DrawerPortal>
      <DrawerOverlay className={overlayClassName} />
      <DrawerPrimitive.Content
        data-slot="bottom-sheet-content"
        data-size={size ?? "md"}
        data-snapping={snapping || undefined}
        className={cn(
          bottomSheetVariants({ size }),
          snapping ? "h-full max-h-[97%]" : "max-h-[85dvh]",
          "pb-[env(safe-area-inset-bottom)]",
          className,
        )}
        {...props}
        {...restore}
      >
        {handle ? (
          <DrawerPrimitive.Handle
            data-slot="bottom-sheet-handle"
            className={cn(
              "mt-2 mb-1 h-1.5 w-12 touch:my-3 mx-auto shrink-0 rounded-full bg-muted-foreground/30",
              classNames?.handle,
            )}
          />
        ) : null}
        {children}
      </DrawerPrimitive.Content>
    </DrawerPortal>
  )
}

export interface BottomSheetHeaderProps extends React.ComponentProps<"div"> {
  closeButton?: boolean
  /** Button that toggles between the first and last snap point (gesture alternative, R3.27). */
  expandButton?: { expanded: boolean; onToggle: () => void } | null
  classNames?: { close?: string; expand?: string }
}

export function BottomSheetHeader({
  className,
  classNames,
  closeButton = true,
  expandButton,
  children,
  ...props
}: BottomSheetHeaderProps) {
  const { t } = useTranslation()
  return (
    <div
      data-slot="bottom-sheet-header"
      className={cn("gap-2 px-4 pt-2 pb-3 flex shrink-0 items-start", className)}
      {...props}
    >
      <div className="gap-1 min-w-0 flex flex-1 flex-col">{children}</div>
      {expandButton ? (
        <Button
          variant="ghost"
          size="icon-sm"
          data-slot="bottom-sheet-expand"
          aria-expanded={expandButton.expanded}
          onClick={expandButton.onToggle}
          className={classNames?.expand}
        >
          <Icon name={expandButton.expanded ? "chevron-down" : "chevron-up"} />
          <span className="sr-only">{expandButton.expanded ? t("overlay.collapse") : t("overlay.expand")}</span>
        </Button>
      ) : null}
      {closeButton ? (
        <DrawerClose asChild>
          <Button variant="ghost" size="icon-sm" data-slot="bottom-sheet-close" className={classNames?.close}>
            <Icon name="close" />
            <span className="sr-only">{t("overlay.close")}</span>
          </Button>
        </DrawerClose>
      ) : null}
    </div>
  )
}

export function BottomSheetTitle({ className, ...props }: React.ComponentProps<typeof DrawerTitle>) {
  return <DrawerTitle data-slot="bottom-sheet-title" className={cn("font-semibold", className)} {...props} />
}

export function BottomSheetDescription(props: React.ComponentProps<typeof DrawerDescription>) {
  return <DrawerDescription data-slot="bottom-sheet-description" {...props} />
}

export function BottomSheetBody({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="bottom-sheet-body"
      className={cn("px-4 pb-4 min-h-0 flex-1 overflow-y-auto overscroll-contain", className)}
      {...props}
    />
  )
}

export function BottomSheetFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="bottom-sheet-footer"
      className={cn("gap-2 px-4 py-3 sm:flex-row sm:justify-end flex shrink-0 flex-col-reverse border-t", className)}
      {...props}
    />
  )
}

export interface BottomSheetProps extends Omit<BottomSheetContentProps, "title" | "children" | "snapping"> {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  trigger?: React.ReactNode
  title: React.ReactNode
  description?: React.ReactNode
  /** Hide the title visually (kept for screen readers). */
  hideTitle?: boolean
  footer?: React.ReactNode
  closeButton?: boolean
  /**
   * Heights the sheet snaps to, smallest first: fractions of the screen
   * (`0.4`) or CSS pixel strings (`"320px"`). Adds an expand/collapse button.
   */
  snapPoints?: SnapPoint[]
  activeSnapPoint?: SnapPoint | null
  defaultSnapPoint?: SnapPoint | null
  onActiveSnapPointChange?: (snapPoint: SnapPoint | null) => void
  /** `false` blocks closing by drag, outside click and Escape. Default `true`. */
  dismissible?: boolean
  /** Only the handle starts a drag, so content can be selected and scrolled freely. */
  handleOnly?: boolean
  modal?: boolean
  children?: React.ReactNode
  classNames?: BottomSheetContentProps["classNames"] & {
    header?: string
    title?: string
    description?: string
    body?: string
    footer?: string
    close?: string
    expand?: string
  }
}

/**
 * A pull-up panel anchored to the bottom of the screen: drag the handle (or the
 * sheet) to resize or dismiss, with snap points, Escape and a close button as
 * alternatives to the gesture.
 */
export function BottomSheet({
  open,
  defaultOpen,
  onOpenChange,
  trigger,
  title,
  description,
  hideTitle,
  footer,
  closeButton = true,
  snapPoints,
  activeSnapPoint,
  defaultSnapPoint,
  onActiveSnapPointChange,
  dismissible = true,
  handleOnly,
  modal,
  children,
  classNames,
  ...props
}: BottomSheetProps) {
  const [snap, setSnap] = useControllableState<SnapPoint | null>(
    activeSnapPoint,
    defaultSnapPoint ?? snapPoints?.[0] ?? null,
    onActiveSnapPointChange,
  )
  const snapping = !!snapPoints?.length
  const last = snapPoints?.[snapPoints.length - 1]
  const expanded = snapping && snap === last
  const snapProps = snapping
    ? { snapPoints, activeSnapPoint: snap, setActiveSnapPoint: setSnap, fadeFromIndex: snapPoints.length - 1 }
    : {}

  return (
    <BottomSheetRoot
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
      dismissible={dismissible}
      handleOnly={handleOnly}
      modal={modal}
      {...snapProps}
    >
      {trigger ? <BottomSheetTrigger asChild>{trigger}</BottomSheetTrigger> : null}
      <BottomSheetContent
        snapping={snapping}
        classNames={classNames}
        {...(description ? {} : { "aria-describedby": undefined })}
        {...props}
      >
        <BottomSheetHeader
          closeButton={closeButton}
          expandButton={
            snapping && snapPoints.length > 1
              ? { expanded, onToggle: () => setSnap(expanded ? snapPoints[0]! : last!) }
              : null
          }
          className={classNames?.header}
          classNames={{ close: classNames?.close, expand: classNames?.expand }}
        >
          <BottomSheetTitle className={cn(hideTitle && "sr-only", classNames?.title)}>{title}</BottomSheetTitle>
          {description ? (
            <BottomSheetDescription className={classNames?.description}>{description}</BottomSheetDescription>
          ) : null}
        </BottomSheetHeader>
        <BottomSheetBody className={classNames?.body}>{children}</BottomSheetBody>
        {footer ? <BottomSheetFooter className={classNames?.footer}>{footer}</BottomSheetFooter> : null}
      </BottomSheetContent>
    </BottomSheetRoot>
  )
}
