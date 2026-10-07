"use client"

import * as React from "react"
import {
  Button as AriaButton,
  Checkbox as AriaCheckbox,
  Collection,
  I18nProvider,
  Tree,
  TreeItem,
  TreeItemContent,
  type Key,
  type Selection,
} from "react-aria-components"

import { Icon } from "../../icons/icon"
import { cn } from "../../lib/utils"
import { useOnu, useTranslation } from "../../providers/onu-provider"

export interface TreeNode {
  id: string
  label: string
  /** Semantic icon name or node. */
  icon?: string | React.ReactNode
  /** Extra content at the end of the row (badges, counts, actions). */
  end?: React.ReactNode
  children?: TreeNode[]
  disabled?: boolean
  href?: string
}

export interface TreeViewProps {
  items: TreeNode[]
  /** Accessible name. */
  "aria-label"?: string
  "aria-labelledby"?: string
  selectionMode?: "none" | "single" | "multiple"
  selectedKeys?: string[]
  defaultSelectedKeys?: string[]
  onSelectionChange?: (keys: string[]) => void
  /**
   * With `selectionMode="multiple"`: ticking a parent ticks everything under
   * it, unticking clears them, and a parent is ticked when all of its children
   * are. Default `false` (each row is selected on its own). Either way a parent
   * with only some rows under it selected shows a dash (indeterminate).
   */
  selectionPropagation?: boolean
  expandedKeys?: string[]
  defaultExpandedKeys?: string[]
  onExpandedChange?: (keys: string[]) => void
  /** Enter or click on a row (e.g. open the record). */
  onAction?: (id: string) => void
  /** Shown when there are no items. */
  empty?: React.ReactNode
  className?: string
  classNames?: { item?: string; content?: string; chevron?: string; checkbox?: string }
}

function toKeys(selection: Selection, all: () => string[]): string[] {
  return selection === "all" ? all() : [...selection].map(String)
}

function allIds(nodes: TreeNode[]): string[] {
  return nodes.flatMap((n) => [n.id, ...allIds(n.children ?? [])])
}

function descendantIds(node: TreeNode, disabled: Set<string>): string[] {
  return (node.children ?? []).flatMap((c) => [...(disabled.has(c.id) ? [] : [c.id]), ...descendantIds(c, disabled)])
}

/**
 * Applies a selection change with propagation: added rows bring their
 * descendants, removed rows take them away, and each parent then follows its
 * children (ticked when all its enabled children are).
 */
export function propagateTreeSelection(
  items: TreeNode[],
  previous: ReadonlySet<string>,
  next: ReadonlySet<string>,
  disabled: ReadonlySet<string> = new Set(),
): string[] {
  const disabledSet = new Set(disabled)
  const result = new Set(next)
  const byId = new Map<string, TreeNode>()
  ;(function index(nodes: TreeNode[]) {
    for (const n of nodes) {
      byId.set(n.id, n)
      index(n.children ?? [])
    }
  })(items)
  for (const id of next) {
    if (!previous.has(id)) for (const d of descendantIds(byId.get(id) ?? { id, label: "" }, disabledSet)) result.add(d)
  }
  for (const id of previous) {
    if (!next.has(id)) for (const d of descendantIds(byId.get(id) ?? { id, label: "" }, disabledSet)) result.delete(d)
  }
  ;(function settle(nodes: TreeNode[]) {
    for (const n of nodes) {
      if (!n.children?.length) continue
      settle(n.children)
      const enabled = n.children.filter((c) => !disabledSet.has(c.id))
      if (!enabled.length || disabledSet.has(n.id)) continue
      if (enabled.every((c) => result.has(c.id))) result.add(n.id)
      else result.delete(n.id)
    }
  })(items)
  // Keep the tree's order.
  return allIds(items).filter((id) => result.has(id))
}

/** Rows that are not selected but have selected rows under them (shown with a dash). */
function partiallySelected(items: TreeNode[], selected: ReadonlySet<string>): Set<string> {
  const partial = new Set<string>()
  ;(function walk(nodes: TreeNode[]): boolean {
    let any = false
    for (const n of nodes) {
      const below = walk(n.children ?? [])
      if (below && !selected.has(n.id)) partial.add(n.id)
      if (below || selected.has(n.id)) any = true
    }
    return any
  })(items)
  return partial
}

/**
 * A tree of records (folders, categories, org units) on React Aria's `Tree`:
 * the WAI-ARIA tree grid pattern with arrow-key navigation (mirrored in RTL),
 * expand/collapse and optional selection with checkboxes (a dash on parents
 * with some rows under them selected, and optional `selectionPropagation`).
 */
export function TreeView({
  items,
  selectionMode = "none",
  selectedKeys,
  defaultSelectedKeys,
  onSelectionChange,
  selectionPropagation = false,
  expandedKeys,
  defaultExpandedKeys,
  onExpandedChange,
  onAction,
  empty,
  className,
  classNames,
  ...aria
}: TreeViewProps) {
  const { t } = useTranslation()
  const { locale, dir } = useOnu()
  const disabledKeys = React.useMemo(
    () =>
      (function walk(nodes: TreeNode[]): string[] {
        return nodes.flatMap((n) => [...(n.disabled ? [n.id] : []), ...walk(n.children ?? [])])
      })(items),
    [items],
  )

  const [ownSelection, setOwnSelection] = React.useState<string[]>(defaultSelectedKeys ?? [])
  const selected = selectedKeys ?? ownSelection
  const selectedSet = React.useMemo(() => new Set(selected), [selected])
  const partial = React.useMemo(
    () => (selectionMode === "multiple" ? partiallySelected(items, selectedSet) : new Set<string>()),
    [items, selectedSet, selectionMode],
  )
  const changeSelection = (selection: Selection) => {
    let next = toKeys(selection, () => allIds(items))
    if (selectionPropagation && selectionMode === "multiple") {
      next = propagateTreeSelection(items, selectedSet, new Set(next), new Set(disabledKeys))
    }
    if (selectedKeys === undefined) setOwnSelection(next)
    onSelectionChange?.(next)
  }

  const renderNode = (node: TreeNode): React.ReactElement => (
    <TreeItem
      id={node.id}
      textValue={node.label}
      href={node.href}
      className={({ isFocusVisible, isSelected, isDisabled }) =>
        cn(
          "group/tree-item text-sm rounded-md outline-none",
          isFocusVisible && "ring-3 ring-ring/50",
          isSelected && "bg-primary/10",
          isDisabled && "opacity-50",
          classNames?.item,
        )
      }
    >
      <TreeItemContent>
        {({ hasChildItems, isExpanded, level, selectionMode: mode }) => (
          <div
            className={cn(
              "gap-1.5 py-1 pe-2 min-h-8 touch:min-h-11 flex items-center rounded-md hover:bg-muted/60",
              classNames?.content,
            )}
            style={{ paddingInlineStart: `${(level - 1) * 1.25 + 0.25}rem` }}
          >
            {hasChildItems ? (
              <AriaButton
                slot="chevron"
                aria-label={isExpanded ? t("listing.collapse") : t("listing.expand")}
                className={cn(
                  "size-6 touch:size-11 inline-flex shrink-0 items-center justify-center rounded-md text-muted-foreground outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50",
                  classNames?.chevron,
                )}
              >
                <Icon
                  name="chevron-right"
                  className={cn(
                    "size-4 transition-transform motion-reduce:transition-none",
                    isExpanded && "rotate-90 rtl:-rotate-90",
                  )}
                />
              </AriaButton>
            ) : (
              <span className="size-6 shrink-0" aria-hidden="true" />
            )}
            {mode === "multiple" ? (
              <AriaCheckbox
                slot="selection"
                isIndeterminate={partial.has(node.id)}
                className={cn(
                  "group/check size-4 flex shrink-0 items-center justify-center rounded-[4px] border border-input outline-none data-focus-visible:ring-3 data-focus-visible:ring-ring/50 data-indeterminate:bg-primary data-indeterminate:text-primary-foreground data-selected:border-primary data-selected:bg-primary data-selected:text-primary-foreground",
                  classNames?.checkbox,
                )}
              >
                {({ isSelected, isIndeterminate }) =>
                  isIndeterminate ? (
                    <Icon name="minus" className="size-3.5" />
                  ) : isSelected ? (
                    <Icon name="check" className="size-3.5" />
                  ) : null
                }
              </AriaCheckbox>
            ) : null}
            {node.icon ? (
              <span className="[&_svg]:size-4 shrink-0 text-muted-foreground">
                {typeof node.icon === "string" ? <Icon name={node.icon} /> : node.icon}
              </span>
            ) : null}
            <span className="flex-1 truncate">{node.label}</span>
            {node.end}
          </div>
        )}
      </TreeItemContent>
      {node.children?.length ? (
        <Collection items={node.children} dependencies={[partial]}>
          {renderNode}
        </Collection>
      ) : null}
    </TreeItem>
  )

  return (
    <I18nProvider locale={dir === locale.dir ? locale.code : dir === "rtl" ? "ar" : "en"}>
      <Tree
        {...aria}
        aria-label={aria["aria-label"] ?? (aria["aria-labelledby"] ? undefined : t("listing.tree"))}
        data-slot="tree-view"
        items={items}
        selectionMode={selectionMode}
        selectedKeys={selected}
        onSelectionChange={changeSelection}
        dependencies={[partial]}
        expandedKeys={expandedKeys}
        defaultExpandedKeys={defaultExpandedKeys}
        onExpandedChange={onExpandedChange ? (keys: Set<Key>) => onExpandedChange([...keys].map(String)) : undefined}
        onAction={onAction ? (key: Key) => onAction(String(key)) : undefined}
        disabledKeys={disabledKeys}
        renderEmptyState={() => (
          <div className="p-4 text-sm text-center text-muted-foreground">{empty ?? t("common.noResults")}</div>
        )}
        className={cn("gap-0.5 grid outline-none", className)}
      >
        {renderNode}
      </Tree>
    </I18nProvider>
  )
}
