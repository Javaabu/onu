// Vendored from shadcn/ui (radix base, nova style, RTL) by scripts/sync-shadcn.mjs.
// Onu changes are marked with "onu:" comments; keep them when re-syncing.
import * as React from "react"
import { cn } from "../lib/utils"

// onu: fixed glyphs passed as Icon fallbacks, so primitives work without OnuProvider and the full icon map.
import { ChevronDownIcon } from "lucide-react"
import { Icon } from "../icons/icon"
import { useFormFieldControl } from "../components/form/form-field"

type NativeSelectProps = Omit<React.ComponentProps<"select">, "size"> & {
  size?: "sm" | "default"
}

function NativeSelect({ className, size = "default", ...rest }: NativeSelectProps) {
  // onu: wire id/name/aria to an enclosing FormField.
  const props = useFormFieldControl(rest)
  return (
    <div
      className={cn("group/native-select relative w-fit has-[select:disabled]:opacity-50", className)}
      data-slot="native-select-wrapper"
      data-size={size}
    >
      <select
        data-slot="native-select"
        data-size={size}
        className="h-8 min-w-0 py-1 pe-8 ps-2.5 text-sm data-[size=sm]:h-7 data-[size=sm]:py-0.5 w-full appearance-none rounded-lg border border-input bg-transparent transition-colors outline-none select-none selection:bg-primary selection:text-primary-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 data-[size=sm]:rounded-[min(var(--radius-md),10px)] dark:bg-input/30 dark:hover:bg-input/50 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40"
        {...props}
      />
      <Icon
        name="chevron-down"
        fallback={ChevronDownIcon}
        className="end-2.5 size-4 pointer-events-none absolute top-1/2 -translate-y-1/2 text-muted-foreground select-none"
        aria-hidden="true"
        data-slot="native-select-icon"
      />
    </div>
  )
}

function NativeSelectOption({ className, ...props }: React.ComponentProps<"option">) {
  return (
    <option data-slot="native-select-option" className={cn("bg-[Canvas] text-[CanvasText]", className)} {...props} />
  )
}

function NativeSelectOptGroup({ className, ...props }: React.ComponentProps<"optgroup">) {
  return (
    <optgroup
      data-slot="native-select-optgroup"
      className={cn("bg-[Canvas] text-[CanvasText]", className)}
      {...props}
    />
  )
}

export { NativeSelect, NativeSelectOptGroup, NativeSelectOption }
