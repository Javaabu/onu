import{x as e}from"./button-DdNGmfo-.js";import{t}from"./code-block-ClCqPtRu.js";import{i as n,r}from"./index-DhR2uHzt.js";var i=e(),a=`import { WysiwygEditor } from "@javaabu/onu/editor"

export function NewsForm() {
  // Thaana typing on, posted as "body"
  return <WysiwygEditor name="body" thaana />
}
`,o=`Route::post('/islands', function (Request $request) {
    $validated = $request->validate([
        'name' => ['required', 'string', 'max:255'],
        'atoll' => ['required', 'exists:atolls,id'],
    ]);

    return Island::create($validated);
});
`;function s(){return(0,i.jsxs)(r,{children:[(0,i.jsxs)(n,{title:`Languages`,className:`gap-4 grid`,children:[(0,i.jsx)(t,{code:a,language:`tsx`}),(0,i.jsx)(t,{code:o,language:`php`,title:`routes/web.php`,lineNumbers:!0,highlightLines:[3,4]}),(0,i.jsx)(t,{code:`pnpm add @javaabu/onu @tiptap/react @tiptap/pm @tiptap/starter-kit shiki`,language:`bash`})]}),(0,i.jsxs)(n,{title:`Plain text, wrapping and no header`,className:`gap-4 grid`,children:[(0,i.jsx)(t,{code:`MVR 1,250.00 paid to Bank of Maldives
Reference: TRF-2026-000183`}),(0,i.jsx)(t,{code:`A very long line that wraps instead of scrolling horizontally, so it can be read on a phone without panning sideways.`,wrap:!0}),(0,i.jsx)(t,{code:`console.log('ސަލާމް')`,language:`js`,hideHeader:!0})]})]})}export{s as default};