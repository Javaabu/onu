import { cn } from "../../lib/utils"

/** Supporting text under a control. Wire it with `aria-describedby` (FormField does this). */
export function HelpText({ className, ...props }: React.ComponentProps<"p">) {
  return <p data-slot="help-text" className={cn("text-sm text-muted-foreground", className)} {...props} />
}
