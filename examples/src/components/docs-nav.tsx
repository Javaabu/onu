import * as React from "react"
import { Link, useLocation } from "react-router"
import { Collapsible, CollapsibleContent, CollapsibleTrigger, Icon, TextInput, cn } from "@javaabu/onu"

import { locate, navSections, type NavCategory, type NavItem } from "../registry"

function matches(item: NavItem, query: string) {
  if (!query) return true
  const q = query.toLowerCase()
  return item.title.toLowerCase().includes(q) || item.group.toLowerCase().includes(q)
}

function NavLink({ item, active, onNavigate }: { item: NavItem; active: boolean; onNavigate?: () => void }) {
  return (
    <Link
      to={item.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        "px-2 py-1 text-sm min-h-8 relative flex items-center rounded-md text-foreground/80 transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
        active &&
          "font-medium before:start-0 before:inset-y-1.5 before:w-0.5 bg-primary-subtle text-primary-subtle-foreground before:absolute before:rounded-full before:bg-primary hover:bg-primary-subtle hover:text-primary-subtle-foreground",
      )}
    >
      <span className="truncate">{item.title}</span>
    </Link>
  )
}

function Category({
  category,
  open,
  onOpenChange,
  pathname,
  query,
  onNavigate,
}: {
  category: NavCategory
  open: boolean
  onOpenChange: (open: boolean) => void
  pathname: string
  query: string
  onNavigate?: () => void
}) {
  const items = category.items.filter((i) => matches(i, query))
  if (!items.length) return null
  return (
    <Collapsible open={open || !!query} onOpenChange={onOpenChange}>
      <CollapsibleTrigger className="group/cat gap-2 px-2 py-1 text-sm font-medium min-h-8 flex w-full items-center rounded-md text-start text-foreground hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none">
        <Icon
          name="chevron-right"
          className="size-3.5 shrink-0 text-muted-foreground transition-transform group-data-[state=open]/cat:rotate-90 rtl:group-data-[state=open]/cat:-rotate-90"
        />
        <span className="flex-1 truncate">{category.label}</span>
        <span className="text-xs text-muted-foreground tabular-nums">{items.length}</span>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="ms-3.5 mt-0.5 mb-1 gap-0.5 ps-2 flex flex-col border-s">
          {items.map((item) => (
            <NavLink key={item.href} item={item} active={item.href === pathname} onNavigate={onNavigate} />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

/** The docs sidebar: a live filter, Getting started links, then collapsible categories. */
export function DocsNav({ onNavigate, className }: { onNavigate?: () => void; className?: string }) {
  const { pathname } = useLocation()
  const here = locate(pathname)
  const activeCategory = here ? `${here.section.id}/${here.category.id}` : undefined
  const [query, setQuery] = React.useState("")
  const [open, setOpen] = React.useState<Set<string>>(() => new Set(activeCategory ? [activeCategory] : []))
  const [prevActive, setPrevActive] = React.useState(activeCategory)
  if (prevActive !== activeCategory) {
    // Expand the category of the page we just moved to (state adjusted during render).
    setPrevActive(activeCategory)
    if (activeCategory && !open.has(activeCategory)) setOpen(new Set(open).add(activeCategory))
  }
  const scroller = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const box = scroller.current
    const el = box?.querySelector<HTMLElement>('[aria-current="page"]')
    if (!box || !el) return
    const boxRect = box.getBoundingClientRect()
    const elRect = el.getBoundingClientRect()
    if (elRect.top < boxRect.top || elRect.bottom > boxRect.bottom) {
      box.scrollTop += elRect.top - boxRect.top - box.clientHeight / 3
    }
    // Only on first render: later navigation starts from a link the user can see.
  }, [])

  const toggle = (id: string, next: boolean) => {
    const set = new Set(open)
    if (next) set.add(id)
    else set.delete(id)
    setOpen(set)
  }

  const visible = navSections.some((s) => s.categories.some((c) => c.items.some((i) => matches(i, query))))

  return (
    <div className={cn("min-h-0 flex flex-col", className)}>
      <div className="px-1 pb-3">
        <TextInput
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter"
          aria-label="Filter the menu"
          startAddon={<Icon name="filter" />}
          className="h-8"
        />
      </div>
      <div ref={scroller} className="pe-2 pb-8 min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <nav aria-label="Docs" className="gap-5 flex flex-col">
          {navSections.map((section) => {
            const flat = section.id === "getting-started"
            const items = flat ? section.categories[0]!.items.filter((i) => matches(i, query)) : []
            if (flat && !items.length) return null
            if (!flat && !section.categories.some((c) => c.items.some((i) => matches(i, query)))) return null
            return (
              <div key={section.id}>
                <h2 className="mb-1 px-2 text-xs font-medium text-muted-foreground">{section.label}</h2>
                {flat ? (
                  <div className="gap-0.5 flex flex-col">
                    {items.map((item) => (
                      <NavLink key={item.href} item={item} active={item.href === pathname} onNavigate={onNavigate} />
                    ))}
                  </div>
                ) : (
                  <div className="gap-0.5 flex flex-col">
                    {section.categories.map((category) => (
                      <Category
                        key={category.id}
                        category={category}
                        open={open.has(`${section.id}/${category.id}`)}
                        onOpenChange={(next) => toggle(`${section.id}/${category.id}`, next)}
                        pathname={pathname}
                        query={query}
                        onNavigate={onNavigate}
                      />
                    ))}
                  </div>
                )}
              </div>
            )
          })}
          {!visible ? <p className="px-2 text-sm text-muted-foreground">No matches for “{query}”.</p> : null}
        </nav>
      </div>
    </div>
  )
}
