/** Which side a floating panel opens on. `start` and `end` follow the reading direction. */
export type LogicalSide = "top" | "bottom" | "start" | "end"

/** Maps a logical side to the physical one Radix expects (R11.1). */
export function radixSide(side: LogicalSide | undefined, dir: "ltr" | "rtl") {
  if (side === "start") return dir === "ltr" ? "left" : "right"
  if (side === "end") return dir === "ltr" ? "right" : "left"
  return side
}
