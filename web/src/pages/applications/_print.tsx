/**
 * Print rules for receipt and certificate pages: hides the app chrome (sidebar,
 * header, bottom navigation) so only the document prints.
 *
 * AppLayout does not hide its own chrome when printing (reported as a gap), so
 * these pages add the rule themselves.
 */
export function PrintOnlyContent() {
  return (
    <style>{`@media print {
  [data-slot="sidebar"], [data-slot="sidebar-gap"], [data-slot="app-header"], [data-slot="bottom-nav"] { display: none !important; }
  [data-slot="sidebar-wrapper"], [data-slot="app-layout"], [data-slot="app-layout-main"], [data-slot="app-layout-content"] { display: block !important; padding: 0 !important; margin: 0 !important; max-width: none !important; min-height: 0 !important; }
  @page { margin: 12mm; }
}`}</style>
  )
}
