import * as React from "react"
import { cva } from "class-variance-authority"

import { cn } from "../../lib/utils"
import type { LabelLayout } from "../../providers/onu-provider"
import { FormLayoutProvider } from "./form-context"

export const formGroupVariants = cva("gap-x-4 gap-y-5 grid w-full", {
  variants: {
    columns: {
      1: "grid-cols-1",
      2: "@xl/form-group:grid-cols-2 grid-cols-1",
      3: "@xl/form-group:grid-cols-2 @4xl/form-group:grid-cols-3 grid-cols-1",
      4: "@xl/form-group:grid-cols-2 @4xl/form-group:grid-cols-4 grid-cols-1",
    },
  },
  defaultVariants: { columns: 1 },
})

export interface FormGroupProps extends React.ComponentProps<"div"> {
  /**
   * Columns on wide containers. Columns come from the group's own width
   * (container queries, R3.19), so a group in a narrow card stacks to one column.
   */
  columns?: 1 | 2 | 3 | 4
  /** Label layout for the fields inside. */
  labelLayout?: LabelLayout
  /** Disable the fields inside. */
  disabled?: boolean
  classNames?: { grid?: string }
}

/**
 * Lays out related fields in a responsive grid and sets their label layout.
 * Use `className="col-span-full"` on a field that should span every column.
 */
export function FormGroup({
  columns = 1,
  labelLayout,
  disabled,
  className,
  classNames,
  children,
  ...props
}: FormGroupProps) {
  return (
    <div
      data-slot="form-group"
      data-columns={columns}
      className={cn("@container/form-group w-full", className)}
      {...props}
    >
      <div className={cn(formGroupVariants({ columns }), classNames?.grid)}>
        <FormLayoutProvider labelLayout={labelLayout} disabled={disabled}>
          {children}
        </FormLayoutProvider>
      </div>
    </div>
  )
}
