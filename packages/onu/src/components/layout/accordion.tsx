"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Accordion as AccordionPrimitive } from "radix-ui"

import { cn } from "../../lib/utils"
import { AccordionContent, AccordionItem, AccordionTrigger } from "../../ui/accordion"
import { NavIcon } from "./_nav"

export const accordionVariants = cva("flex w-full flex-col", {
  variants: {
    variant: {
      default: "",
      bordered: "px-4 rounded-xl border",
      separated:
        "gap-2 *:data-[slot=accordion-item]:px-4 *:data-[slot=accordion-item]:rounded-xl *:data-[slot=accordion-item]:border",
    },
  },
  defaultVariants: { variant: "default" },
})

export interface AccordionItemData {
  value: string
  title: React.ReactNode
  content: React.ReactNode
  /** Semantic icon name or node before the title. */
  icon?: string | React.ReactNode
  disabled?: boolean
}

interface AccordionExtraProps extends VariantProps<typeof accordionVariants> {
  /** Data-driven items. Without `items`, compose `AccordionItem`/`AccordionTrigger`/`AccordionContent`. */
  items?: AccordionItemData[]
  classNames?: { item?: string; trigger?: string; content?: string }
}

type SingleProps = Omit<AccordionPrimitive.AccordionSingleProps, "type"> & {
  /** One panel open at a time (default) or several. */
  type?: "single"
}
type MultipleProps = AccordionPrimitive.AccordionMultipleProps

export type AccordionProps = (SingleProps | MultipleProps) & AccordionExtraProps & { ref?: React.Ref<HTMLDivElement> }

/**
 * shadcn `Accordion`, extended with an `items` API and visual variants. `type`
 * defaults to `"single"` and a single accordion is collapsible by default.
 */
export function Accordion({ items, variant, className, classNames, children, ...props }: AccordionProps) {
  const rootProps =
    props.type === "multiple"
      ? props
      : ({ collapsible: true, ...props, type: "single" } as AccordionPrimitive.AccordionSingleProps)

  return (
    <AccordionPrimitive.Root
      data-slot="accordion"
      data-variant={variant ?? "default"}
      className={cn(accordionVariants({ variant }), className)}
      {...rootProps}
    >
      {items
        ? items.map((item) => (
            <AccordionItem key={item.value} value={item.value} disabled={item.disabled} className={classNames?.item}>
              <AccordionTrigger className={cn("gap-2 touch:min-h-11", classNames?.trigger)}>
                <span className="gap-2 flex items-center">
                  <NavIcon icon={item.icon} className="size-4 text-muted-foreground" />
                  {item.title}
                </span>
              </AccordionTrigger>
              <AccordionContent className={classNames?.content}>{item.content}</AccordionContent>
            </AccordionItem>
          ))
        : null}
      {children}
    </AccordionPrimitive.Root>
  )
}
