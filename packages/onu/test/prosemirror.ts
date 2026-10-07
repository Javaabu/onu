/**
 * jsdom has no layout. ProseMirror measures ranges and text nodes when it
 * scrolls the selection into view; give them empty geometry so editor tests
 * can run headless. Import this at the top of editor tests.
 */
const emptyRect = () => new DOMRect(0, 0, 0, 0)
const emptyRects = () => [] as unknown as DOMRectList

Range.prototype.getBoundingClientRect ??= emptyRect
Range.prototype.getClientRects ??= emptyRects
for (const proto of [Text.prototype, Node.prototype] as unknown as Element[]) {
  const target = proto as unknown as { getClientRects?: () => DOMRectList; getBoundingClientRect?: () => DOMRect }
  target.getClientRects ??= emptyRects
  target.getBoundingClientRect ??= emptyRect
}
document.elementFromPoint ??= () => null

export {}
