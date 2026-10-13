"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { Icon } from "../../icons/icon"
import { cn } from "../../lib/utils"
import { useTranslation } from "../../providers/onu-provider"

/**
 * Ant Design tags: 22px, 4px corners, a hairline border and 12px text. `default` is
 * Ant's grey tag, `primary` the brand-tinted one, `outline` a plain bordered tag.
 * `color` picks one of Ant's preset colours instead.
 */
export const tagVariants = cva(
  "group/tag gap-1 font-normal inline-flex max-w-full shrink-0 items-center rounded-sm border transition-colors has-[[data-slot=tag-label]:focus-visible]:ring-3 has-[[data-slot=tag-label]:focus-visible]:ring-ring/50 data-disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "border-input bg-muted text-foreground",
        primary: "border-primary-3 bg-primary-1 text-primary-subtle-foreground",
        outline: "border-input bg-card text-foreground",
      },
      color: {
        blue: "border-preset-blue-border bg-preset-blue text-preset-blue-foreground",
        cyan: "border-preset-cyan-border bg-preset-cyan text-preset-cyan-foreground",
        green: "border-preset-green-border bg-preset-green text-preset-green-foreground",
        red: "border-preset-red-border bg-preset-red text-preset-red-foreground",
        gold: "border-preset-gold-border bg-preset-gold text-preset-gold-foreground",
      },
      size: {
        sm: "h-5 px-1.5 text-xs [&_svg]:size-3",
        md: "h-5.5 px-1.75 text-xs [&_svg]:size-3",
        lg: "h-7 px-2.5 text-sm [&_svg]:size-3.5",
      },
      interactive: {
        true: "hover:border-primary-5 hover:text-primary-7",
        false: "",
      },
    },
    defaultVariants: { variant: "default", size: "md", interactive: false },
  },
)

/** Ant Design preset colours for `Tag`. */
export type TagColor = "blue" | "cyan" | "green" | "red" | "gold"

export interface TagProps
  extends
    Omit<React.ComponentProps<"span">, "onClick" | "color">,
    Omit<VariantProps<typeof tagVariants>, "interactive" | "color"> {
  /** One of Ant Design's preset colours (blue, cyan, green, red, gold). Overrides `variant`'s colours. */
  color?: TagColor
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
  color,
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
      data-color={color}
      data-size={size ?? "md"}
      data-selected={selected || undefined}
      data-disabled={disabled || undefined}
      className={cn(
        tagVariants({ variant, color, size, interactive: interactive && !disabled }),
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
