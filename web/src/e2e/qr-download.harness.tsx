import { QrCode } from "@javaabu/onu/media"

// 8.7: the PNG and SVG downloads complete in a real browser.
export default function QrDownloadHarness() {
  return <QrCode value="https://example.mv/verify/BL-2026-04417" label="Licence QR code" download />
}
