import * as React from "react"
import { ActionMenu, Button, ButtonGroup, Icon, toast, type MenuItem } from "@javaabu/onu"
import { docPaths } from "virtual:onu-docs"

/** The docs page for a demo: the same path, or the only page with the same name (`foundations/live-region`). */
export function docPathFor(slug: string) {
  if (docPaths.includes(slug)) return slug
  const name = slug.split("/").pop()
  const matches = docPaths.filter((p) => p.split("/").pop() === name)
  return matches.length === 1 ? matches[0] : undefined
}

/** A file the build puts at the site root (see `llmsDocs` in vite.config.ts). */
function siteFile(file: string) {
  return new URL(file, `${window.location.origin}${window.location.pathname}`).href
}

/**
 * "Copy page" and its menu, like shadcn's docs: the component's docs page as
 * Markdown, to paste into an AI assistant or open there directly.
 */
export function DocActions({ docPath, title }: { docPath: string; title: string }) {
  const markdown = siteFile(`docs/${docPath}.md`)
  const prompt = `Read ${markdown} so I can ask questions about ${title} from Onu (@javaabu/onu), Javaabu's React UI library.`

  const copy = React.useCallback(async () => {
    const text = fetch(markdown).then((res) => {
      if (!res.ok) throw new Error(`${res.status}`)
      return res.text()
    })
    try {
      // Safari only allows a clipboard write started by the click, so hand it the pending text.
      if (typeof ClipboardItem !== "undefined" && navigator.clipboard?.write) {
        await navigator.clipboard.write([
          new ClipboardItem({ "text/plain": text.then((t) => new Blob([t], { type: "text/plain" })) }),
        ])
      } else {
        await navigator.clipboard.writeText(await text)
      }
      toast.success("Copied the page as Markdown")
    } catch {
      toast.error("Couldn't copy the page")
    }
  }, [markdown])

  // In a new tab: menu `href`s go through the app's router link.
  const open = (url: string) => () => void window.open(url, "_blank", "noopener")
  const items: MenuItem[] = [
    { label: "View as Markdown", icon: "file-text", onSelect: open(markdown) },
    { type: "separator" },
    {
      label: "Open in Claude",
      icon: "external-link",
      onSelect: open(`https://claude.ai/new?q=${encodeURIComponent(prompt)}`),
    },
    {
      label: "Open in ChatGPT",
      icon: "external-link",
      onSelect: open(`https://chatgpt.com/?hints=search&q=${encodeURIComponent(prompt)}`),
    },
    { type: "separator" },
    { label: "llms.txt (all components)", icon: "file-text", onSelect: open(siteFile("llms.txt")) },
  ]

  return (
    <ButtonGroup aria-label="Page as Markdown" className="shrink-0">
      <Button variant="outline" size="sm" startIcon={<Icon name="copy" />} onClick={() => void copy()}>
        Copy page
      </Button>
      <ActionMenu
        items={items}
        trigger={
          <Button variant="outline" size="sm" aria-label="More ways to use this page with AI">
            <Icon name="chevron-down" />
          </Button>
        }
      />
    </ButtonGroup>
  )
}
