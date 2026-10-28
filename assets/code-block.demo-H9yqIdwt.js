var e=`import { CodeBlock } from "@javaabu/onu/editor"

import { DemoPage, DemoSection } from "../../components/demo"

export const meta = {
  title: "Code block",
  group: "Rich content",
  order: 4,
  description: "Shiki-highlighted, read-only code with copy, line numbers and light/dark themes. Always LTR.",
}

const tsx = \`import { WysiwygEditor } from "@javaabu/onu/editor"

export function NewsForm() {
  // Thaana typing on, posted as "body"
  return <WysiwygEditor name="body" thaana />
}
\`

const php = \`Route::post('/islands', function (Request $request) {
    $validated = $request->validate([
        'name' => ['required', 'string', 'max:255'],
        'atoll' => ['required', 'exists:atolls,id'],
    ]);

    return Island::create($validated);
});
\`

export default function CodeBlockDemo() {
  return (
    <DemoPage>
      <DemoSection title="Languages" className="gap-4 grid">
        <CodeBlock code={tsx} language="tsx" />
        <CodeBlock code={php} language="php" title="routes/web.php" lineNumbers highlightLines={[3, 4]} />
        <CodeBlock code="pnpm add @javaabu/onu @tiptap/react @tiptap/pm @tiptap/starter-kit shiki" language="bash" />
      </DemoSection>
      <DemoSection title="Plain text, wrapping and no header" className="gap-4 grid">
        <CodeBlock code={"MVR 1,250.00 paid to Bank of Maldives\\nReference: TRF-2026-000183"} />
        <CodeBlock
          code="A very long line that wraps instead of scrolling horizontally, so it can be read on a phone without panning sideways."
          wrap
        />
        <CodeBlock code="console.log('ސަލާމް')" language="js" hideHeader />
      </DemoSection>
    </DemoPage>
  )
}
`;export{e as default};