import * as React from "react"
import { FormField, Tabs, TabsContent, TabsList, TabsTrigger } from "@javaabu/onu"
import { BlockEditor, BlockRenderer, type JSONContent } from "@javaabu/onu/editor"

import { DemoPage, DemoSection } from "../../components/demo"
import { pageJson } from "./sample-content"

export const meta = {
  title: "Block editor",
  group: "Rich content",
  order: 2,
  description: "Block-based page builder: “/” menu, + menu, drag handles, callouts, embeds and JSON output.",
}

async function fakeUpload(file: File) {
  await new Promise((resolve) => setTimeout(resolve, 800))
  return URL.createObjectURL(file)
}

export default function BlockEditorDemo() {
  const [doc, setDoc] = React.useState<JSONContent>(pageJson)
  return (
    <DemoPage>
      <DemoSection
        title="Page builder"
        description="Type “/” for blocks. Drag the grip to reorder, or press it for Move up / Move down. Ctrl/⌘+Shift+↑/↓ moves the current block."
        className="gap-4 grid"
      >
        <Tabs defaultValue="edit">
          <TabsList>
            <TabsTrigger value="edit">Edit</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="json">JSON</TabsTrigger>
          </TabsList>
          <TabsContent value="edit" className="pt-2">
            <FormField label="Page content" hideLabel>
              <BlockEditor value={doc} onChange={setDoc} onImageUpload={fakeUpload} name="content" />
            </FormField>
          </TabsContent>
          <TabsContent value="preview" className="pt-2">
            <BlockRenderer content={doc} />
          </TabsContent>
          <TabsContent value="json" className="pt-2">
            <pre className="max-h-96 p-3 text-xs overflow-auto rounded-md bg-muted" dir="ltr">
              {JSON.stringify(doc, null, 2)}
            </pre>
          </TabsContent>
        </Tabs>
      </DemoSection>

      <DemoSection title="Thaana and limited blocks" className="gap-4 grid">
        <FormField label="ސަފްހާ" help="Only text, headings, lists and callouts are offered.">
          <BlockEditor
            thaana
            blockTypes={["paragraph", "heading1", "heading2", "bulletList", "orderedList", "callout"]}
            placeholder="ލިޔަން ފައްޓަވާ، ނުވަތަ “/” ޖަހާ"
          />
        </FormField>
      </DemoSection>

      <DemoSection title="Read only and disabled" className="gap-4 grid">
        <BlockEditor aria-label="Read-only page" readOnly defaultValue={pageJson} />
        <BlockEditor
          aria-label="Disabled page"
          disabled
          defaultValue="<p>This page is locked while it is reviewed.</p>"
        />
      </DemoSection>
    </DemoPage>
  )
}
