---
"@javaabu/onu": minor
---

`SearchResults`: new `onShowMore(groupId, group)` shows more results of a group on the same page. Groups with more results than shown (`total`, or the new `hasMore`) get a **Show more** button instead of the `moreHref` link, with a loading state (return a promise or set the group's `loadingMore`), focus moved to the first newly revealed result, and polite announcements of the loaded count or a failure. Without the callback the link behaves as before. `classNames.more` styles the link or button.
