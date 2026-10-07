"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { Icon } from "../../icons/icon"
import { cn } from "../../lib/utils"
import { useTranslation } from "../../providers/onu-provider"

export const tagVariants = cva(
  "group/tag gap-1 font-medium inline-flex max-w-full shrink-0 items-center rounded-md border transition-colors has-[[data-slot=tag-label]:focus-visible]:ring-3 has-[[data-slot=tag-label]:focus-visible]:ring-ring/50 data-disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "border-transparent bg-secondary text-secondary-foreground",
        primary: "border-transparent bg-primary-subtle text-primary-subtle-foreground",
        outline: "border-border bg-background text-foreground",
      },
      size: {
        sm: "h-5 px-1.5 text-xs [&_svg]:size-3",
        md: "h-6 px-2 text-xs [&_svg]:size-3.5",
        lg: "h-8 px-2.5 text-sm [&_svg]:size-4",
      },
      interactive: {
        true: "hover:bg-accent hover:text-accent-foreground",
        false: "",
      },
    },
    defaultVariants: { variant: "default", size: "md", interactive: false },
  },
)

export interface TagProps
  extends Omit<React.ComponentProps<"span">, "onClick">, Omit<VariantProps<typeof tagVariants>, "interactive"> {
  /** Makes the tag a button. */
  onClick?: React.MouseEventHandler<HTMLButtonElement>
  /** Makes the tag a link (rendered with a plain `<a>`; use `asChild`-style composition for router links). */
  href?: string
  /** Shows a remove (×) button. Delete or Backspace on a clickable tag also removes it. */
  onRemove?: () => void
  /** Accessible label for the remove button; defaults to "Remove {label}". */
  removeLabel?: string
  /** Semantic icon name or node shown before the label. */
  icon?: string | React.ReactNode
  /** Marks the tag as selected (for filter-style tags). */
  selected?: boolean
  disabled?: boolean
  classNames?: { label?: string; remove?: string; icon?: string }
}

function textOf(node: React.ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node)
  if (Array.isArray(node)) return node.map(textOf).join("")
  if (React.isValidElement<{ children?: React.ReactNode }>(node)) return textOf(node.props.children)
  return ""
}

/** A compact label for categories, keywords or filters. Can be clickable and removable. */
export function Tag({
  children,
  variant,
  size,
  onClick,
  href,
  onRemove,
  removeLabel,
  icon,
  selected,
  disabled,
  className,
  classNames,
  ...props
}: TagProps) {
  const { t } = useTranslation()
  const interactive = !!(onClick || href)
  const iconNode = typeof icon === "string" ? <Icon name={icon} className={classNames?.icon} /> : (icon ?? null)
  const labelClass = cn(
    "gap-1 min-w-0 inline-flex items-center outline-none",
    interactive && "touch:after:-inset-y-2.5 touch:after:inset-x-0 relative cursor-pointer touch:after:absolute",
    classNames?.label,
  )
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (onRemove && !disabled && (e.key === "Delete" || e.key === "Backspace")) {
      e.preventDefault()
      onRemove()
    }
  }

  const content = (
    <>
      {iconNode}
      <span className="truncate">{children}</span>
    </>
  )

  let label: React.ReactNode
  if (href && !disabled) {
    label = (
      <a data-slot="tag-label" href={href} className={labelClass} onKeyDown={onKeyDown}>
        {content}
      </a>
    )
  } else if (onClick) {
    label = (
      <button
        type="button"
        data-slot="tag-label"
        className={labelClass}
        onClick={onClick}
        onKeyDown={onKeyDown}
        disabled={disabled}
        aria-pressed={selected}
      >
        {content}
      </button>
    )
  } else {
    label = (
      <span data-slot="tag-label" className={labelClass}>
        {content}
      </span>
    )
  }

  return (
    <span
      data-slot="tag"
      data-variant={variant ?? "default"}
      data-size={size ?? "md"}
      data-selected={selected || undefined}
      data-disabled={disabled || undefined}
      className={cn(
        tagVariants({ variant, size, interactive: interactive && !disabled }),
        selected && "border-primary bg-primary text-primary-foreground hover:bg-primary/90",
        onRemove && "pe-0.5",
        className,
      )}
      {...props}
    >
      {label}
      {onRemove ? (
        <button
          type="button"
          data-slot="tag-remove"
          disabled={disabled}
          onClick={onRemove}
          aria-label={removeLabel ?? t("display.removeTag", { label: textOf(children) })}
          className={cn(
            "size-4 touch:after:-inset-3 relative inline-flex shrink-0 items-center justify-center rounded-sm outline-none hover:bg-foreground/10 focus-visible:ring-2 focus-visible:ring-ring/50 disabled:pointer-events-none touch:after:absolute",
            classNames?.remove,
          )}
        >
          <Icon name="close" className="size-3!" />
        </button>
      ) : null}
    </span>
  )
}
