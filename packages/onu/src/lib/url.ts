const HAS_SCHEME = /^[a-z][a-z0-9+.-]*:/i
const SAFE_PROTOCOLS = /^(https?:|mailto:|tel:)/i
/** `localhost:3000`, `example.mv:8080/x`: a host (localhost, or with a dot) and a port, which looks like a scheme. */
const HOST_PORT = /^(localhost|[a-z\d-]+(\.[a-z\d-]+)+):\d{1,5}(?=$|[/?#])/i

/**
 * True for links that are safe to render: http(s), mailto, tel and relative
 * URLs. `javascript:`, `data:`, `vbscript:` and other schemes are rejected.
 */
export function isSafeUrl(url: string | null | undefined): url is string {
  if (!url) return false
  // Browsers ignore control characters and whitespace inside a scheme.
  // eslint-disable-next-line no-control-regex
  const clean = url.trim().replace(/[\u0000-\u001F\u007F\s]/g, "")
  if (!clean) return false
  // With a scheme, only the allowed ones; without one, a relative URL (/path, #hash, ?query, page.html).
  return HAS_SCHEME.test(clean) ? SAFE_PROTOCOLS.test(clean) : true
}

/**
 * Adds `protocol` to user input without a scheme (`example.mv` → `https://example.mv`,
 * `localhost:3000` → `https://localhost:3000`). Relative URLs (`/page`, `#top`) stay as they are.
 * Returns `null` when empty or unsafe.
 */
export function normalizeUrl(input: string, protocol = "https://"): string | null {
  const value = input.trim()
  if (!value) return null
  const hasScheme = HAS_SCHEME.test(value) && !HOST_PORT.test(value)
  const withProtocol = hasScheme || /^[/#?.]/.test(value) ? value : protocol + value
  return isSafeUrl(withProtocol) ? withProtocol : null
}
