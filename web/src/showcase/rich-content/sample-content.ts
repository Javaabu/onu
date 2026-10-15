import type { JSONContent } from "@javaabu/onu/editor"

/** A short mixed Dhivehi/English article for the editor demos. */
export const articleHtml = `
<h2>Malé City Council update</h2>
<p>The council approved <strong>MVR 2.4 million</strong> for new walkways in Hulhumalé Phase 2.</p>
<p>މާލެ ސިޓީ ކައުންސިލުން ހުޅުމާލޭގެ ފޭސް 2 ގައި އައު ހިނގާ މަގުތައް ހެދުމަށް ފައިސާ ހަވާލުކޮށްފި.</p>
<ul><li>Majeedhee Magu resurfacing</li><li>ބަނދަރު ސަރަހައްދުގެ ބައްތިތައް</li></ul>
<blockquote><p>“Safer streets for everyone in the capital.” — Aminath Shifa</p></blockquote>
<p>Read the full notice on <a href="https://example.mv/notice">the council website</a>.</p>
`

const text = (value: string, marks?: JSONContent["marks"]): JSONContent => ({ type: "text", text: value, marks })
const paragraph = (...content: JSONContent[]): JSONContent => ({ type: "paragraph", content })

/** Block editor content with every block type. */
export const pageJson: JSONContent = {
  type: "doc",
  content: [
    { type: "heading", attrs: { level: 1 }, content: [text("Visiting Addu City")] },
    paragraph(
      text("Addu is the southernmost atoll of the Maldives, home to "),
      text("Hithadhoo", [{ type: "bold" }]),
      text(", Maradhoo and Feydhoo."),
    ),
    { type: "heading", attrs: { level: 2 }, content: [text("އައްޑޫ ސިޓީއަށް ދަތުރުކުރުން")] },
    paragraph(text("އައްޑޫ ސިޓީއަކީ ދިވެހިރާއްޖޭގެ އެންމެ ދެކުނުގައި އޮތް އަތޮޅު.")),
    {
      type: "callout",
      attrs: { variant: "info" },
      content: [text("Ferries from Gan to Hithadhoo run every 30 minutes until 22:00.")],
    },
    {
      type: "bulletList",
      content: [
        { type: "listItem", content: [paragraph(text("Gan Island causeway"))] },
        { type: "listItem", content: [paragraph(text("ކޯއްޓެ ބީޗް"))] },
      ],
    },
    {
      type: "table",
      content: [
        {
          type: "tableRow",
          content: [
            { type: "tableHeader", content: [paragraph(text("Island"))] },
            { type: "tableHeader", content: [paragraph(text("Population"))] },
          ],
        },
        {
          type: "tableRow",
          content: [
            { type: "tableCell", content: [paragraph(text("Hithadhoo"))] },
            { type: "tableCell", content: [paragraph(text("12,000"))] },
          ],
        },
        {
          type: "tableRow",
          content: [
            { type: "tableCell", content: [paragraph(text("Feydhoo"))] },
            { type: "tableCell", content: [paragraph(text("3,800"))] },
          ],
        },
      ],
    },
    { type: "horizontalRule" },
    {
      type: "codeBlock",
      attrs: { language: "bash" },
      content: [text("curl https://api.example.mv/islands?atoll=addu")],
    },
    { type: "embed", attrs: { src: "https://www.youtube.com/watch?v=aqz-KE-bpKQ", title: "Island video" } },
  ],
}
