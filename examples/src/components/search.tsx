import * as React from "react"
import { useNavigate } from "react-router"
import {
  Button,
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
  Icon,
  Kbd,
  KbdGroup,
  cn,
} from "@javaabu/onu"

import { navSections } from "../registry"

const SearchContext = React.createContext<(open: boolean) => void>(() => {})

const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.userAgent)

function isTyping(target: EventTarget | null) {
  const el = target as HTMLElement | null
  return !!el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName))
}

/** Command palette over every demo and sample page; ⌘K, Ctrl+K or `/` opens it. */
export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false)
  const navigate = useNavigate()

  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      // Full-screen sample pages are apps with their own shortcuts.
      if (!document.querySelector("[data-docs-chrome]")) return
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !isTyping(e.target))) {
        e.preventDefault()
        setOpen((o) => !o)
      }
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [])

  const go = (href: string) => {
    setOpen(false)
    navigate(href)
  }

  return (
    <SearchContext.Provider value={setOpen}>
      {children}
      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="Search documentation"
        description="Find a component or sample page"
        className="sm:max-w-xl"
      >
        <Command>
          <CommandInput placeholder="Search components and pages…" />
          <CommandList className="max-h-[min(24rem,60svh)]">
            <CommandEmpty>No results found.</CommandEmpty>
            {navSections.flatMap((section) =>
              section.categories.map((category) => (
                <CommandGroup
                  key={`${section.id}-${category.id}`}
                  heading={section.id === "pages" ? `Sample pages · ${category.label}` : category.label}
                >
                  {category.items.map((item) => (
                    <CommandItem
                      key={item.href}
                      value={`${item.title} ${item.href}`}
                      keywords={[item.group, section.label, item.description ?? ""]}
                      onSelect={() => go(item.href)}
                    >
                      <Icon name={section.id === "pages" ? "file" : "dot"} className="text-muted-foreground" />
                      <span className="truncate">{item.title}</span>
                      <CommandShortcut className="tracking-normal max-w-[45%] truncate">
                        {category.label}
                      </CommandShortcut>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )),
            )}
          </CommandList>
        </Command>
      </CommandDialog>
    </SearchContext.Provider>
  )
}

/** The header's "Search documentation… ⌘K" button. */
export function SearchButton({ className }: { className?: string }) {
  const setOpen = React.useContext(SearchContext)
  return (
    <>
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        className={cn(
          "w-52 lg:w-72 gap-2 ps-3 pe-1.5 h-8 font-normal md:inline-flex hidden justify-start bg-muted/50 text-muted-foreground shadow-none",
          className,
        )}
      >
        <Icon name="search" />
        <span className="lg:inline hidden" dir="auto">
          Search documentation…
        </span>
        <span className="lg:hidden inline" dir="auto">
          Search…
        </span>
        <KbdGroup className="ms-auto" dir="ltr" aria-hidden>
          <Kbd className="border bg-background">{isMac ? "⌘" : "Ctrl"}</Kbd>
          <Kbd className="border bg-background">K</Kbd>
        </KbdGroup>
      </Button>
      <Button variant="ghost" size="icon" onClick={() => setOpen(true)} aria-label="Search" className="md:hidden">
        <Icon name="search" />
      </Button>
    </>
  )
}
