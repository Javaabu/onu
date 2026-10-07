import { cva } from "class-variance-authority"

/**
 * Prose styles for editor content and rendered blocks, shared so a document
 * looks the same while editing and when published. Tuned for Latin and Thaana
 * (R3.7, R12.4): Thaana gets a taller line height and never faux italics, and
 * headings use size rather than weight for emphasis.
 */
export const proseVariants = cva(
  [
    "[overflow-wrap:anywhere] text-foreground",
    "[&_:lang(dv)]:leading-[1.9] [&:lang(dv)]:leading-[1.9]",
    "[&>*:first-child]:mt-0 [&>*:last-child]:mb-0",
    // Text blocks
    "[&_p]:my-3",
    "[&_h1]:mt-8 [&_h1]:mb-3 [&_h1]:text-3xl [&_h1]:leading-tight [&_h1]:font-semibold [&_h1]:tracking-tight",
    "[&_h2]:mt-7 [&_h2]:mb-3 [&_h2]:text-2xl [&_h2]:leading-snug [&_h2]:font-semibold [&_h2]:tracking-tight",
    "[&_h3]:mt-6 [&_h3]:mb-2 [&_h3]:text-xl [&_h3]:leading-snug [&_h3]:font-semibold",
    "[&_h4]:mt-5 [&_h4]:mb-2 [&_h4]:text-lg [&_h4]:font-semibold",
    "[&_h5]:mt-4 [&_h5]:mb-2 [&_h5]:font-semibold [&_h6]:mt-4 [&_h6]:mb-2 [&_h6]:font-semibold",
    // Marks
    "[&_a]:font-medium [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-4",
    "[&_strong]:font-semibold",
    "[&_:not(pre)>code]:px-1 [&_:not(pre)>code]:py-0.5 [&_:not(pre)>code]:rounded-sm [&_:not(pre)>code]:bg-muted [&_:not(pre)>code]:font-mono [&_:not(pre)>code]:text-[0.875em]",
    // Lists
    "[&_ul]:my-3 [&_ul]:ps-6 [&_ol]:my-3 [&_ol]:ps-6 [&_ol]:list-decimal [&_ul]:list-disc",
    "[&_li]:my-1 [&_li]:ps-1 [&_li>p]:my-0 [&_li::marker]:text-muted-foreground",
    // Quote, rule, code
    "[&_blockquote]:my-4 [&_blockquote]:ps-4 [&_blockquote]:border-s-4 [&_blockquote]:border-border [&_blockquote]:text-muted-foreground",
    "[&_hr]:my-6 [&_hr]:border-border",
    "[&_:not(figure)>pre]:my-4 [&_:not(figure)>pre]:p-4 [&_:not(figure)>pre]:text-sm [&_:not(figure)>pre]:leading-relaxed [&_:not(figure)>pre]:overflow-x-auto [&_:not(figure)>pre]:rounded-lg [&_:not(figure)>pre]:bg-muted [&_:not(figure)>pre]:text-start [&_:not(figure)>pre]:font-mono",
    // Media
    "[&_img]:my-4 [&_img]:h-auto [&_img]:max-w-full [&_img]:rounded-lg",
    "[&_[data-type=embed]]:my-4 [&_[data-type=embed]_iframe]:aspect-video [&_[data-type=embed]_iframe]:w-full [&_[data-type=embed]_iframe]:rounded-lg [&_[data-type=embed]_iframe]:border-0",
    // Tables scroll inside their own container (R3.21)
    "[&_.tableWrapper]:my-4 [&_.tableWrapper]:overflow-x-auto",
    "[&_table]:text-sm [&_table]:w-full [&_table]:border-collapse",
    "[&_td]:px-3 [&_td]:py-2 [&_td]:border [&_td]:border-border [&_td]:align-top",
    "[&_th]:px-3 [&_th]:py-2 [&_th]:font-medium [&_th]:border [&_th]:border-border [&_th]:bg-muted [&_th]:text-start [&_th]:align-top",
    "[&_td>p]:my-0 [&_th>p]:my-0",
    // Callouts
    "[&_[data-type=callout]]:my-4 [&_[data-type=callout]]:px-4 [&_[data-type=callout]]:py-3 [&_[data-type=callout]]:rounded-lg [&_[data-type=callout]]:border",
    "[&_[data-type=callout][data-variant=info]]:border-info/30 [&_[data-type=callout][data-variant=info]]:bg-info/10",
    "[&_[data-type=callout][data-variant=success]]:border-success/30 [&_[data-type=callout][data-variant=success]]:bg-success/10",
    "[&_[data-type=callout][data-variant=warning]]:border-warning/40 [&_[data-type=callout][data-variant=warning]]:bg-warning/10",
    "[&_[data-type=callout][data-variant=error]]:border-destructive/30 [&_[data-type=callout][data-variant=error]]:bg-destructive/10",
  ],
  {
    variants: {
      size: {
        sm: "text-sm leading-6",
        default: "text-base leading-7",
        lg: "text-lg leading-8",
      },
    },
    defaultVariants: { size: "default" },
  },
)

/** Extra styles that only apply inside a live ProseMirror editor. */
export const editingClasses = [
  "[&_.ProseMirror]:outline-none [&_.ProseMirror]:whitespace-pre-wrap",
  "[&_.ProseMirror-selectednode]:ring-2 [&_.ProseMirror-selectednode]:ring-ring/50 [&_.ProseMirror-selectednode]:rounded-md",
  "[&_.selectedCell]:bg-primary/10",
  "[&_.ProseMirror-gapcursor]:relative",
  // Placeholder text from the Placeholder extension
  "[&_.is-empty]:before:pointer-events-none [&_.is-empty]:before:float-start [&_.is-empty]:before:h-0 [&_.is-empty]:before:text-muted-foreground [&_.is-empty]:before:content-[attr(data-placeholder)]",
].join(" ")
