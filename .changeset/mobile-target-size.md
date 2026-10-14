---
"@javaabu/onu": patch
---

Touch target fixes on phones (WCAG 2.5.8): `MediaPlayer` hides the seek buttons in narrow players (under 24rem, like the volume slider) and keeps the timeline at least 4rem wide, so the timeline no longer collapses under the time display; the arrow keys still seek. The card `ListingPage` toolbar keeps the search box at least 14rem wide (or the full row) and wraps the tools below it, instead of squeezing the search to a sliver.
