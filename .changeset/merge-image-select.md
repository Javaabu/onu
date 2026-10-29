---
"@javaabu/onu": minor
---

`ImageSelect` is folded into `RadioGroup` as `variant="image"`, with no alias left behind. Options take `image: { src, alt }` (so does `Radio`); `minItemWidth` (default `8rem`) and `aspectRatio` (`square`, `video`, `portrait` or a number) are new `RadioGroup` props for that variant, and all four arrow keys move between tiles. `ImageSelect`, `ImageSelectProps` and `ImageOption` are removed. Its `multiple` mode is gone (nothing used it), and `showLabels={false}` becomes `classNames={{ label: "sr-only" }}`. `radioImageVariants` and the `RadioImageAspect` type are exported.

```tsx
// Before
<ImageSelect options={[{ value: "reef", label: "Reef", src: "/reef.jpg", alt: "" }]} aspectRatio="video" />

// After
<RadioGroup variant="image" options={[{ value: "reef", label: "Reef", image: { src: "/reef.jpg", alt: "" } }]} aspectRatio="video" />
```
