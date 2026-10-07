---
title: Block renderer
sidebar_position: 3
---

Renders block editor (or WYSIWYG) JSON to React **without** loading the editor. It uses `@tiptap/static-renderer` with the same node definitions as the editors, so a page looks the same while editing and when published.

```tsx
import { BlockRenderer } from '@javaabu/onu/editor';

<BlockRenderer content={page.content} />
<BlockRenderer content={jsonStringFromDb} empty={<p>No content yet.</p>} />
```

## Safe by default

- No raw HTML is ever injected (`dangerouslySetInnerHTML` is not used); text is text.
- Links keep only `http(s)`, `mailto`, `tel` and relative URLs, with `rel="noopener noreferrer nofollow"`. Others render as plain text.
- Images keep only `http(s)`, relative, `blob:` and raster `data:image` sources.
- Embeds frame only YouTube (via `youtube-nocookie.com`) and Vimeo, in a sandboxed `iframe`. Other URLs become links.
- Content that doesn't fit the schema renders nothing instead of crashing.

Helpers `isSafeUrl`, `isSafeImageUrl` and `toEmbedUrl` are exported.

## Custom rendering

```tsx
<BlockRenderer
  content={doc}
  nodes={{ image: ({ node }) => <Lightbox src={node.attrs.src} alt={node.attrs.alt} /> }}
  marks={{ link: ({ mark, children }) => <InertiaLink href={mark.attrs.href}>{children}</InertiaLink> }}
  codeBlock={{ lineNumbers: true }}
/>
```

Code blocks render with [`CodeBlock`](./code-block); callouts get a status icon and `role="note"`.

## Props

| Prop         | Type                                   | Default     | Description                             |
| ------------ | -------------------------------------- | ----------- | --------------------------------------- |
| `content`    | `JSONContent \| string \| null`        |             | Document JSON, or a JSON string         |
| `size`       | `'sm' \| 'default' \| 'lg'`            | `'default'` | Prose size                              |
| `nodes`      | `Record<string, (props) => ReactNode>` |             | Override node rendering                 |
| `marks`      | `Record<string, (props) => ReactNode>` |             | Override mark rendering                 |
| `extensions` | `Extensions`                           |             | Extra node types (same as the editor's) |
| `codeBlock`  | `Partial<CodeBlockProps>`              |             | Props for every code block              |
| `empty`      | `ReactNode`                            |             | Shown when there is no content          |

Other `<div>` props go to the root. The prose styles are exported as `proseVariants`.

## RTL, Thaana and accessibility

Every block keeps `dir="auto"`, so Dhivehi paragraphs read right-to-left and English ones left-to-right on any page. Prose styles avoid faux italics and bold for Thaana and use size for heading emphasis. Wide tables and code scroll inside their own container. Images keep their alt text, and embeds get a `title` (falling back to "Embedded content").
