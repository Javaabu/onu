import { ShareButtons, ThemeToggle } from "@javaabu/onu"
import { FullCalendar } from "@javaabu/onu/calendar"

// Components whose first client render depends on the browser (#66, Part 7): the stored theme, the page's URL and the
// screen width. `scripts/ssr-check.mjs` opens this page at phone width with a stored dark theme, and checks that each
// one follows the browser once hydrated, without a hydration error.
export default function HydrationPage() {
  return (
    <main>
      <ThemeToggle variant="segmented" />
      <ShareButtons native="never" networks={["facebook"]} />
      <FullCalendar />
    </main>
  )
}
