/** The severity scale shared by callouts, badges, notifications and other status displays. */
export type Tone = "neutral" | "info" | "success" | "warning" | "danger"

/** Tinted background and border, for a box that holds content. */
export const toneSurface: Record<Tone, string> = {
  neutral: "bg-card text-card-foreground",
  info: "border-info/30 bg-info/5 text-foreground",
  success: "border-success/30 bg-success/5 text-foreground",
  warning: "border-warning/40 bg-warning/10 text-foreground",
  danger: "border-destructive/30 bg-destructive/5 text-foreground",
}

/** Soft background and matching text, for an icon tile. */
export const toneTint: Record<Tone, string> = {
  neutral: "bg-muted text-muted-foreground",
  info: "bg-info/10 text-info",
  success: "bg-success/10 text-success",
  warning: "bg-warning/15 text-warning",
  danger: "bg-destructive/10 text-destructive",
}

/** Solid background, for a full-width bar. */
export const toneSolid: Record<Tone, string> = {
  neutral: "border-b bg-muted text-foreground",
  info: "bg-info text-info-foreground",
  success: "bg-success text-success-foreground",
  warning: "bg-warning text-warning-foreground",
  danger: "bg-destructive text-destructive-foreground",
}
