import * as React from "react"
import { useLocation } from "react-router"
import { cn } from "@javaabu/onu"

import { scrollToAnchor } from "./demo"

interface Heading {
  id: string
  text: string
}

/** "On this page": the page's section headings, with the one being read highlighted. */
export function TableOfContents({ className }: { className?: string }) {
  const { pathname } = useLocation()
  const [headings, setHeadings] = React.useState<Heading[]>([])
  const [active, setActive] = React.useState("")

  React.useEffect(() => {
    let frame = 0
    let collectFrame = 0
    const collect = () => {
      cancelAnimationFrame(collectFrame)
      collectFrame = requestAnimationFrame(() => {
        const nodes = document.querySelectorAll<HTMLElement>("#main-content [data-demo-section] > h2[id]")
        const next = [...nodes].map((n) => ({ id: n.id, text: n.textContent ?? "" }))
        setHeadings((prev) =>
          prev.length === next.length && prev.every((h, i) => h.id === next[i]!.id && h.text === next[i]!.text)
            ? prev
            : next,
        )
        onScroll()
      })
    }
    collect()
    // Demos load lazily (and can switch locale), so re-scan whenever the content changes.
    const main = document.getElementById("main-content")
    const observer = new MutationObserver(collect)
    if (main) observer.observe(main, { childList: true, subtree: true, characterData: true })
    const onScroll = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const nodes = document.querySelectorAll<HTMLElement>("#main-content [data-demo-section] > h2[id]")
        let current = nodes[0]?.id ?? ""
        for (const n of nodes) if (n.getBoundingClientRect().top < 120) current = n.id
        const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2
        if (atBottom && nodes.length) current = nodes[nodes.length - 1]!.id
        setActive(current)
      })
    }
    const initial = window.setTimeout(onScroll, 50)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => {
      observer.disconnect()
      cancelAnimationFrame(collectFrame)
      window.clearTimeout(initial)
      cancelAnimationFrame(frame)
      window.removeEventListener("scroll", onScroll)
    }
  }, [pathname])

  if (headings.length < 2) return null

  return (
    <nav aria-label="On this page" className={cn("text-sm", className)}>
      <p className="mb-2 font-medium">On this page</p>
      <ul className="gap-0.5 flex flex-col">
        {headings.map((h) => (
          <li key={h.id}>
            <a
              href={`#${pathname}#${h.id}`}
              onClick={(e) => scrollToAnchor(e, h.id)}
              aria-current={active === h.id ? "location" : undefined}
              className={cn(
                "py-1 ps-3 -ms-px block border-s text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                active === h.id && "font-medium border-primary text-primary-subtle-foreground",
              )}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
