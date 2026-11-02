# exportRows (client-side export)

Builds a **CSV**, **Excel** or **PDF** file in the browser from the rows you already have, for apps without a server export. It lives in its own entry point, `@javaabu/onu/export`, so it never adds to the core bundle. It fits the [`ExportMenu`](./export-menu.md) and [`ListingPage`](./listing-page.md) `onExport` prop in one line.

```tsx
import { useExportRows, type ExportColumn } from "@javaabu/onu/export"

const columns: ExportColumn<Payment>[] = [
  { header: "Reference", accessor: "reference" },
  { header: "Name", accessor: (p) => (dv ? p.nameDv : p.name) },
  { header: "Island", accessor: "island.name" }, // dotted paths work
  { header: "Amount", accessor: "amount", type: "currency" },
  { header: "Paid on", accessor: "paidAt", type: "date" },
]

function Payments() {
  const exportRows = useExportRows() // uses the OnuProvider locale and direction
  return (
    <ListingPage
      {...props}
      onExport={(format) => exportRows({ format, rows: allMatchingRows, columns, filename: "payments", title: "Payments" })}
    />
  )
}
```

`exportRows(options)` works outside React too; pass `locale: "dv"` (or an Onu locale object) and, if needed, `dir`. Export **every row that matches the current search and filters**, not just the visible page: with [`applyListingState`](./use-listing-state.md) that is `applyListingState(all, { ...state, page: 1, perPage: Infinity }, options).rows`.

## Formats

| Format  | What you get                                                                                                                                                                                                                                                                         | Needs              |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------ |
| `csv`   | UTF-8 with a byte order mark (so Excel opens Dhivehi correctly), RFC 4180 quoting, CRLF line endings. Text cells starting with `=`, `+`, `-`, `@`, tab or CR get a leading `'` (formula-injection guard); real numbers such as `-40` are written as numbers.                         | nothing            |
| `excel` | An `.xlsx` workbook: bold, frozen header row, numbers and currency stay numeric (with a `"MVR "#,##0.00` / `"ރ. "#,##0.00` number format), dates are real dates, and the sheet reads **right to left** when `dir` is `rtl`. Thaana text is stored as-is.                             | `write-excel-file` |
| `pdf`   | Opens the browser's print dialog with a styled, paginated table (title, scope line, "Generated …" date and row count, the header row repeated on every page, page numbers). The user picks **Save as PDF**. It uses the page's Onu fonts, so Thaana renders in MV Waheed / Faruma. | nothing            |

Excel loads `write-excel-file` with `import()` on the first Excel export. Install it only if you offer Excel:

```bash
npm install write-excel-file
```

The PDF is printed by the browser, not drawn by a PDF library: browser text shaping is the only reliable way to render Thaana correctly, and it adds no dependency. Landscape is used for more than five columns (`orientation` to override).

## Options

| Option                         | Type                                  | Default        | Description                                                                 |
| ------------------------------ | ------------------------------------- | -------------- | --------------------------------------------------------------------------- |
| `format`                       | `"csv" \| "excel" \| "pdf"`           |                | `"xlsx"` is accepted for Excel; anything else throws                       |
| `rows`                         | `T[]`                                 |                | The records                                                                 |
| `columns`                      | `ExportColumn<T>[]`                   |                | See below                                                                   |
| `filename`                     | `string`                              | `"export"`     | The extension is added; for PDF it is the document title the browser offers |
| `title`                        | `string`                              |                | PDF heading; Excel sheet name unless `sheetName` is set                     |
| `scope`                        | `string`                              |                | PDF line under the title, e.g. "Status: Approved · 312 applications"        |
| `locale` / `dir`               | `OnuLocale \| "en" \| "dv"` / `"ltr" \| "rtl"` | `"en"` / the locale's | Dates, numbers, yes/no and built-in text; `useExportRows` fills them in |
| `delimiter`, `bom`             | `string`, `boolean`                   | `","`, `true`  | CSV                                                                         |
| `sheetName`, `fontFamily`      | `string`                              |                | Excel sheet name (31 characters); default font (Excel and PDF)              |
| `orientation`, `generatedAt`   | `"portrait" \| "landscape"`, `Date`   |                | PDF                                                                         |

### Columns

| Field      | Type                                                                    | Description                                                                                                                 |
| ---------- | ----------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `header`   | `string`                                                                | Header cell                                                                                                                 |
| `accessor` | `string \| (row, index) => unknown`                                     | Property name (dotted paths allowed) or function                                                                             |
| `type`     | `"text" \| "number" \| "currency" \| "date" \| "datetime" \| "boolean"` | Without it, each value is typed by what it is (number, `Date`, boolean, else text). Values that do not fit become text.     |
| `format`   | `(value, row) => string`                                                | Text for CSV and PDF (and Excel text columns). Number, currency and date columns stay numeric/dates in Excel.              |
| `decimals` | `number`                                                                | Decimal places (currency default 2)                                                                                          |
| `width`    | `number`                                                                | Excel column width in characters (default: fitted to the content)                                                           |

## Building blocks

Each format has its own helpers, useful for tests or for sending the file somewhere else:

| Function                                    | Returns                                                     |
| ------------------------------------------- | ----------------------------------------------------------- |
| `toCsv(rows, columns, options?)`            | The CSV text (with BOM)                                     |
| `exportCsv({ rows, columns, filename })`    | Saves the `.csv`                                            |
| `buildExcelSheet(rows, columns, options?)`  | The cells and sheet options handed to `write-excel-file`    |
| `toExcelBlob(rows, columns, options?)`      | `Promise<Blob>` of the `.xlsx`                              |
| `exportExcel({ rows, columns, filename })`  | Saves the `.xlsx`                                           |
| `buildPrintDocument(rows, columns, opts?)`  | The print-ready HTML document (every value HTML-escaped)    |
| `printHtml(html)`                           | Prints a document through a hidden iframe                   |
| `exportPdf({ rows, columns, title })`       | Opens the print dialog                                      |
| `escapeCsvFormula`, `quoteCsvField`, `escapeHtml`, `downloadBlob` | The small pieces above                  |

## Accessibility

The export runs from the [`ExportMenu`](./export-menu.md), which announces "Exporting…" and "Export ready" in a polite live region and keeps `aria-busy` on the button until the file is saved or the print dialog has opened. The print frame is hidden from assistive technology (`aria-hidden`, not focusable) and removed after printing. The PDF table uses real `th scope="col"` headers.

## RTL and Dhivehi

- With `dir: "rtl"` (automatic for Dhivehi through `useExportRows`), Excel sheets are right to left and the PDF document is `dir="rtl" lang="dv"`.
- Dates use the locale's date-fns locale in the PDF ("12 މާޗު 2026"); CSV and Excel use ISO dates and real date cells.
- Currency follows `common.currency` ("MVR 1,250.00" / "ރ. 1,250.00"); booleans use `common.yes` / `common.no`.
- Text cells are wrapped in `<bdi>` in the PDF, so Latin and Thaana values each read in their own direction while the column keeps the page alignment.
