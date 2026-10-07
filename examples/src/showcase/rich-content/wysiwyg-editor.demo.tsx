import * as React from "react"
import { FormField } from "@javaabu/onu"
import { WysiwygEditor, type EditorValue } from "@javaabu/onu/editor"

import { DemoPage, DemoSection } from "../../components/demo"
import { articleHtml } from "./sample-content"

export const meta = {
  title: "WYSIWYG editor",
  group: "Rich content",
  order: 1,
  description: "Tiptap rich text editor with a responsive toolbar, links, images, tables and Thaana typing.",
}

/** Pretends to upload: waits, then returns a local object URL. */
async function fakeUpload(file: File) {
  await new Promise((resolve) => setTimeout(resolve, 800))
  return URL.createObjectURL(file)
}

export default function WysiwygEditorDemo() {
  const [html, setHtml] = React.useState<EditorValue>(articleHtml)
  return (
    <DemoPage>
      <DemoSection
        title="Default"
        description="Mixed Dhivehi and English paragraphs each take their own direction (dir=auto). Press Alt+F10 to reach the toolbar."
        className="gap-4 grid"
      >
        <FormField label="News article" help="Images are uploaded through the onImageUpload callback.">
          <WysiwygEditor value={html} onChange={setHtml} onImageUpload={fakeUpload} name="body" />
        </FormField>
        <details className="text-sm">
          <summary className="cursor-pointer text-muted-foreground">HTML output</summary>
          <pre className="mt-2 max-h-60 p-3 text-xs overflow-auto rounded-md bg-muted" dir="ltr">
            {String(html)}
          </pre>
        </details>
      </DemoSection>

      <DemoSection
        title="Thaana typing"
        description="Type on a Latin keyboard to write Thaana. Toggle with the ދ button or Alt+Shift+T."
        className="gap-4 grid"
      >
        <FormField label="ޚަބަރު">
          <WysiwygEditor thaana placeholder="ޚަބަރު ލިޔުއްވާ…" />
        </FormField>
      </DemoSection>

      <DemoSection title="Custom toolbar and JSON output" className="gap-4 grid">
        <FormField label="Short note" help="Only bold, italic, lists and links.">
          <WysiwygEditor
            format="json"
            toolbar={["bold", "italic", "|", "bulletList", "orderedList", "|", "link"]}
            size="sm"
            classNames={{ content: "min-h-24" }}
          />
        </FormField>
      </DemoSection>

      <DemoSection title="States" className="gap-6 grid">
        <FormField label="With an error" error="The description field is required." required>
          <WysiwygEditor />
        </FormField>
        <FormField label="Disabled">
          <WysiwygEditor disabled defaultValue="<p>Editing is turned off.</p>" />
        </FormField>
        <FormField label="Read only">
          <WysiwygEditor readOnly defaultValue="<p>Published on <strong>12 March 2026</strong> by Ahmed Naseem.</p>" />
        </FormField>
      </DemoSection>
    </DemoPage>
  )
}
