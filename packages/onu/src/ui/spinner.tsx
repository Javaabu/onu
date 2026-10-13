// Vendored from shadcn/ui (radix base, nova style, RTL) by scripts/sync-shadcn.mjs.
// Onu changes are marked with "onu:" comments; keep them when re-syncing.
import { cn } from "../lib/utils"

// onu: fixed glyphs passed as Icon fallbacks, so primitives work without OnuProvider and the full icon map.
import { Loader2Icon } from "lucide-react"
import { Icon } from "../icons/icon"

// onu: decorative only (no hard-coded English label). It is mostly used inside
// buttons that carry their own text; for a standalone, announced spinner use
// Onu's `Spinner` from "@javaabu/onu".
function Spinner({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <Icon
      name="loading"
      fallback={Loader2Icon}
      data-slot="spinner"
      className={cn("size-4 animate-spin", className)}
      {...props}
    />
  )
}

export { Spinner }
