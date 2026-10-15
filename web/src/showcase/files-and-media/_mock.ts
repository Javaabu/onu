import type { UploadFn } from "@javaabu/onu"

/** An illustrative scene as an SVG data URI (no network needed). Colours are picture content, not UI. */
export function scene(label: string, hue: number, w = 1200, h = 800) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="hsl(${hue} 70% 72%)"/>
      <stop offset="1" stop-color="hsl(${hue + 30} 80% 88%)"/>
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#sky)"/>
  <circle cx="${w * 0.75}" cy="${h * 0.3}" r="${h * 0.1}" fill="hsl(45 100% 70%)"/>
  <path d="M0 ${h * 0.68} Q ${w * 0.25} ${h * 0.6} ${w * 0.5} ${h * 0.68} T ${w} ${h * 0.66} V ${h} H 0 Z" fill="hsl(190 70% 45%)"/>
  <path d="M0 ${h * 0.8} Q ${w * 0.3} ${h * 0.74} ${w * 0.6} ${h * 0.8} T ${w} ${h * 0.78} V ${h} H 0 Z" fill="hsl(45 60% 82%)"/>
  <text x="${w / 2}" y="${h * 0.93}" font-family="sans-serif" font-size="${h * 0.06}" text-anchor="middle" fill="hsl(200 40% 20%)">${label}</text>
</svg>`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

export const islandPhotos = [
  { src: scene("Maafushi", 200), alt: "Maafushi beach at noon", title: "Maafushi", description: "Kaafu Atoll" },
  {
    src: scene("Fuvahmulah", 15, 900, 1200),
    alt: "Sunset over Fuvahmulah",
    title: "Fuvahmulah",
    description: "Gnaviyani Atoll",
  },
  { src: scene("Hulhumalé", 210), alt: "Hulhumalé skyline from the beach", title: "ހުޅުމާލެ", description: "Phase 2" },
  { src: scene("Addu", 170, 1200, 900), alt: "Addu City causeway", title: "Addu City", description: "Seenu Atoll" },
  {
    src: scene("Baa Atoll", 185, 800, 1100),
    alt: "Hanifaru Bay lagoon",
    title: "Hanifaru Bay",
    description: "UNESCO biosphere reserve",
  },
  { src: scene("Thoddoo", 120), alt: "Thoddoo farmland and beach", title: "Thoddoo", description: "Alif Alif Atoll" },
]

/**
 * A pretend upload: reports progress in steps and resolves with a Laravel-style resource.
 * Files with "fail" in the name are rejected with a validation message.
 */
export const fakeUpload: UploadFn = (file, { onProgress, signal }) =>
  new Promise((resolve, reject) => {
    let progress = 0
    const timer = setInterval(() => {
      progress = Math.min(100, progress + 8 + Math.round(Math.random() * 14))
      onProgress(progress)
      if (progress >= 100) {
        clearInterval(timer)
        if (/fail/i.test(file.name)) reject(new Error("The file could not be scanned. Please try another file."))
        else resolve({ data: { id: Math.round(Math.random() * 10000), name: file.name } })
      }
    }, 250)
    signal.addEventListener("abort", () => {
      clearInterval(timer)
      reject(new DOMException("Aborted", "AbortError"))
    })
  })
