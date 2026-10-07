import { Icon } from "../../icons/icon"
import { cn } from "../../lib/utils"
import { toArray } from "./form-context"

export interface FieldErrorsProps extends Omit<React.ComponentProps<"div">, "children"> {
  errors?: string | string[] | null
  /** Show only the first message. Default `false`. */
  firstOnly?: boolean
}

/** Error messages for one field, announced politely to screen readers (R14.7). */
export function FieldErrors({ errors, firstOnly, className, ...props }: FieldErrorsProps) {
  const list = toArray(errors)
  const shown = firstOnly ? list.slice(0, 1) : list
  return (
    <div data-slot="field-errors" aria-live="polite" className={cn("text-sm text-destructive", className)} {...props}>
      {shown.map((message, i) => (
        <p key={`${i}-${message}`} className="gap-1.5 flex items-start">
          <Icon name="error" className="mt-0.5 size-3.5 shrink-0" />
          <span>{message}</span>
        </p>
      ))}
    </div>
  )
}
