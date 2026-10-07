"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Dialog as DialogPrimitive } from "radix-ui"

import { Icon } from "../../icons/icon"
import { cn } from "../../lib/utils"
import { useTranslation } from "../../providers/onu-provider"
import { Button } from "../../ui/button"
import { useRestoreFocus } from "./_use-restore-focus"
import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from "../../ui/dialog"

/** Centred dialog box. Used unprefixed (mobile="dialog") and from `sm` up for the other modes. */
const CENTRED =
  "top-1/2 start-1/2 -translate-x-1/2 rtl:translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] max-h-[calc(100dvh-2rem)] rounded-xl data-open:zoom-in-95 data-closed:zoom-out-95"
const CENTRED_FROM_SM =
  "sm:inset-auto sm:top-1/2 sm:start-1/2 sm:-translate-x-1/2 sm:rtl:translate-x-1/2 sm:-translate-y-1/2 sm:w-[calc(100%-2rem)] sm:h-auto sm:max-h-[calc(100dvh-2rem)] sm:rounded-xl sm:data-open:zoom-in-95 sm:data-closed:zoom-out-95 sm:data-open:slide-in-from-bottom-0 sm:data-closed:slide-out-to-bottom-0"

export const modalContentVariants = cva(
  "group/modal text-sm shadow-lg fixed z-50 flex flex-col overflow-hidden bg-popover text-popover-foreground ring-1 ring-foreground/10 duration-150 outline-none data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
  {
    variants: {
      size: {
        sm: "sm:max-w-sm",
        md: "sm:max-w-lg",
        lg: "sm:max-w-2xl",
        xl: "sm:max-w-4xl",
        full: "sm:max-w-[calc(100%-2rem)] sm:h-[calc(100dvh-2rem)]",
      },
      /** How the modal is presented on phones (below the `sm` breakpoint, R3.20). */
      mobile: {
        dialog: CENTRED,
        sheet: cn(
          "inset-x-0 bottom-0 max-h-[calc(100dvh-3rem)] rounded-t-xl data-open:slide-in-from-bottom-10 data-closed:slide-out-to-bottom-10",
          CENTRED_FROM_SM,
        ),
        fullscreen: cn("inset-0 h-dvh", CENTRED_FROM_SM),
      },
    },
    defaultVariants: { size: "md", mobile: "sheet" },
  },
)

export type ModalSize = NonNullable<VariantProps<typeof modalContentVariants>["size"]>
export type ModalMobile = NonNullable<VariantProps<typeof modalContentVariants>["mobile"]>

/** Root of a composable modal (shadcn `Dialog`). Controls `open` state. */
export const ModalRoot = Dialog
/** Element that opens the modal. Use `asChild` to render your own button. */
export const ModalTrigger = DialogTrigger
/** Closes the modal. Use `asChild` to render your own button. */
export const ModalClose = DialogClose

export interface ModalContentProps
  extends React.ComponentProps<typeof DialogPrimitive.Content>, VariantProps<typeof modalContentVariants> {
  /** Classes for the backdrop. */
  overlayClassName?: string
}

/** The modal panel with backdrop, focus trap and focus return (R14.4). */
export function ModalContent({
  className,
  overlayClassName,
  size,
  mobile,
  children,
  ref,
  onCloseAutoFocus,
  ...props
}: ModalContentProps) {
  const restore = useRestoreFocus(ref, onCloseAutoFocus)
  return (
    <DialogPortal>
      <DialogOverlay className={overlayClassName} />
      <DialogPrimitive.Content
        data-slot="modal-content"
        data-size={size ?? "md"}
        data-mobile={mobile ?? "sheet"}
        className={cn(modalContentVariants({ size, mobile }), className)}
        {...props}
        {...restore}
      >
        {children}
      </DialogPrimitive.Content>
    </DialogPortal>
  )
}

export interface ModalHeaderProps extends React.ComponentProps<"div"> {
  /** Show the close (×) button at the inline end. Default `true`. */
  closeButton?: boolean
  classNames?: { close?: string }
}

/** Title area. Stays put while the body scrolls. */
export function ModalHeader({ className, classNames, closeButton = true, children, ...props }: ModalHeaderProps) {
  const { t } = useTranslation()
  return (
    <div
      data-slot="modal-header"
      className={cn(
        "gap-1.5 px-4 pt-4 pb-2 group-data-[mobile=fullscreen]/modal:max-sm:pt-[max(1rem,env(safe-area-inset-top))] flex shrink-0 flex-col",
        closeButton && "pe-12",
        className,
      )}
      {...props}
    >
      {children}
      {closeButton ? (
        <DialogClose asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            data-slot="modal-close"
            className={cn("top-3 end-3 absolute", classNames?.close)}
          >
            <Icon name="close" />
            <span className="sr-only">{t("overlay.close")}</span>
          </Button>
        </DialogClose>
      ) : null}
    </div>
  )
}

export function ModalTitle({ className, ...props }: React.ComponentProps<typeof DialogTitle>) {
  return (
    <DialogTitle data-slot="modal-title" className={cn("text-base leading-snug font-semibold", className)} {...props} />
  )
}

export function ModalDescription({ className, ...props }: React.ComponentProps<typeof DialogDescription>) {
  return <DialogDescription data-slot="modal-description" className={className} {...props} />
}

/** Scrollable middle part (R3.21: long content scrolls inside the modal, not the page). */
export function ModalBody({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="modal-body"
      className={cn("px-4 py-2 min-h-0 last:pb-4 flex-1 overflow-y-auto overscroll-contain", className)}
      {...props}
    />
  )
}

/** Action bar. Buttons stack on phones, primary action last (closest to the thumb). */
export function ModalFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="modal-footer"
      className={cn(
        "gap-2 px-4 py-3 mt-2 sm:flex-row sm:justify-end flex shrink-0 flex-col-reverse border-t bg-muted/50",
        "group-data-[mobile=sheet]/modal:max-sm:pb-[max(0.75rem,env(safe-area-inset-bottom))] group-data-[mobile=fullscreen]/modal:max-sm:pb-[max(0.75rem,env(safe-area-inset-bottom))]",
        className,
      )}
      {...props}
    />
  )
}

export interface ModalProps
  extends
    Omit<ModalContentProps, "title" | "children">,
    Pick<React.ComponentProps<typeof Dialog>, "open" | "defaultOpen" | "onOpenChange" | "modal"> {
  /** Element that opens the modal (rendered with `asChild`). Optional when you control `open`. */
  trigger?: React.ReactNode
  /** Heading, used as the dialog's accessible name. */
  title: React.ReactNode
  /** Supporting text under the title, used as the accessible description. */
  description?: React.ReactNode
  /** Hide the title visually (it stays available to screen readers). */
  hideTitle?: boolean
  /** Footer actions, e.g. Cancel and Save buttons. */
  footer?: React.ReactNode
  /** Show the × button. Default `true`. */
  closeButton?: boolean
  children?: React.ReactNode
  classNames?: {
    overlay?: string
    header?: string
    title?: string
    description?: string
    body?: string
    footer?: string
    close?: string
  }
}

/**
 * A dialog with a simple `title` / `description` / `footer` API. Traps focus,
 * returns it to the trigger on close, scrolls inside its body, and becomes a
 * bottom sheet (or full screen) on phones. Compose `ModalRoot` + `ModalContent`
 * + parts for full control.
 */
export function Modal({
  open,
  defaultOpen,
  onOpenChange,
  modal,
  trigger,
  title,
  description,
  hideTitle,
  footer,
  closeButton = true,
  children,
  className,
  classNames,
  ...props
}: ModalProps) {
  return (
    <ModalRoot open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange} modal={modal}>
      {trigger ? <ModalTrigger asChild>{trigger}</ModalTrigger> : null}
      <ModalContent
        className={className}
        overlayClassName={classNames?.overlay}
        {...(description ? {} : { "aria-describedby": undefined })}
        {...props}
      >
        <ModalHeader
          closeButton={closeButton}
          className={cn(hideTitle && !description && "pt-0 pb-0", classNames?.header)}
          classNames={{ close: classNames?.close }}
        >
          <ModalTitle className={cn(hideTitle && "sr-only", classNames?.title)}>{title}</ModalTitle>
          {description ? <ModalDescription className={classNames?.description}>{description}</ModalDescription> : null}
        </ModalHeader>
        {children !== undefined && children !== null ? (
          <ModalBody className={classNames?.body}>{children}</ModalBody>
        ) : null}
        {footer ? <ModalFooter className={classNames?.footer}>{footer}</ModalFooter> : null}
      </ModalContent>
    </ModalRoot>
  )
}
