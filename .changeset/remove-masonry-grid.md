---
"@javaabu/onu": minor
---

`MasonryGrid`, `MasonryGridProps`, `masonryGridVariants` and `masonryColumnClasses` are removed: masonry is a Tailwind recipe, not a component. `Gallery layout="masonry"` is unchanged. For other content, use CSS columns on a plain container:

```tsx
<div className="sm:columns-2 lg:columns-3 gap-4 [&>*]:mb-4 columns-1 [&>*]:break-inside-avoid">
  {posts.map((post) => (
    <Card key={post.id} title={post.title}>
      {post.excerpt}
    </Card>
  ))}
</div>
```
