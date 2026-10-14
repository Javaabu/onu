"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "../../lib/utils"
import { useTranslation } from "../../providers/onu-provider"
import { useDelayedFlag } from "./loading-overlay"
import { registerEnglish } from "../../i18n/english"
import { overlay as en_overlay } from "../../locales/en/overlay"

registerEnglish({ overlay: en_overlay })

export interface PageProgressState {
  /** A load is in progress (or the bar is finishing). */
  active: boolean
  /** 0–1. */
  value: number
}

export interface PageProgressController {
  /** Start (or join) a load. Calls nest: the bar finishes after as many `done()` calls. */
  start(): void
  /** Finish one load. `force` finishes regardless of nesting. */
  done(force?: boolean): void
  /** Set the progress (0–1), starting the bar if needed. */
  set(value: number): void
  /** Nudge the progress forward. */
  inc(amount?: number): void
  getState(): PageProgressState
  subscribe(listener: () => void): () => void
}

const IDLE: PageProgressState = { active: false, value: 0 }

/**
 * Creates an NProgress-style controller: `start()` begins a slow "trickle"
 * towards 90%, `done()` jumps to 100% and hides the bar. Usually you use the
 * shared `pageProgress` instance; create your own for isolated bars or tests.
 */
export function createPageProgress({ trickleMs = 300, finishMs = 300 } = {}): PageProgressController {
  let state = IDLE
  let pending = 0
  let trickle: ReturnType<typeof setInterval> | undefined
  let finish: ReturnType<typeof setTimeout> | undefined
  const listeners = new Set<() => void>()

  const emit = (next: PageProgressState) => {
    state = next
    listeners.forEach((listener) => listener())
  }
  const stopTrickle = () => {
    clearInterval(trickle)
    trickle = undefined
  }
  const startTrickle = () => {
    if (trickle) return
    trickle = setInterval(() => controller.inc(), trickleMs)
  }

  const controller: PageProgressController = {
    start() {
      pending += 1
      clearTimeout(finish)
      if (!state.active || state.value >= 1) emit({ active: true, value: 0.08 })
      startTrickle()
    },
    done(force = false) {
      pending = force ? 0 : Math.max(0, pending - 1)
      if (pending > 0 || !state.active) return
      stopTrickle()
      emit({ active: true, value: 1 })
      clearTimeout(finish)
      finish = setTimeout(() => emit(IDLE), finishMs)
    },
    set(value) {
      const v = Math.min(Math.max(value, 0), 1)
      if (!state.active) pending = Math.max(pending, 1)
      emit({ active: true, value: v })
      if (v >= 1) controller.done(true)
      else startTrickle()
    },
    inc(amount) {
      if (!state.active || state.value >= 1) return
      // Smaller steps the further along it is, never reaching the end on its own.
      const step = amount ?? (state.value < 0.2 ? 0.1 : state.value < 0.5 ? 0.04 : state.value < 0.8 ? 0.02 : 0.005)
      emit({ active: true, value: Math.min(state.value + step, 0.994) })
    },
    getState: () => state,
    subscribe(listener) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
  }
  return controller
}

/**
 * The app-wide page progress bar. Hook it to your router:
 *
 * ```ts
 * router.on("start", () => pageProgress.start())   // Inertia
 * router.on("finish", () => pageProgress.done())
 * ```
 */
export const pageProgress = createPageProgress()

/** Subscribes to a page progress controller. */
export function usePageProgressState(controller: PageProgressController = pageProgress) {
  return React.useSyncExternalStore(controller.subscribe, controller.getState, () => IDLE)
}

/**
 * Shows the page progress bar while `loading` is true, e.g. while a query or
 * a lazy route loads. Several components can use it at once.
 */
export function usePageProgress(loading: boolean, controller: PageProgressController = pageProgress) {
  React.useEffect(() => {
    if (!loading) return
    controller.start()
    return () => controller.done()
  }, [loading, controller])
}

export const pageProgressVariants = cva("", {
  variants: {
    color: {
      primary: "bg-primary",
      success: "bg-success",
      warning: "bg-warning",
      destructive: "bg-destructive",
      info: "bg-info",
    },
  },
  defaultVariants: { color: "primary" },
})

export interface PageProgressProps
  extends Omit<React.ComponentProps<"div">, "color">, VariantProps<typeof pageProgressVariants> {
  /** Controller to follow. Default: the shared `pageProgress`. */
  controller?: PageProgressController
  /** Bar thickness in px. Default 3. */
  height?: number
  /** Wait this long (ms) before showing, so fast navigations don't flash. Default 150. */
  delay?: number
  /** `fixed` pins it to the top of the viewport (default); `absolute` to the top of its container. */
  position?: "fixed" | "absolute"
  classNames?: { bar?: string }
}

/**
 * A thin bar at the top of the page that shows a navigation or long request
 * is in progress (like NProgress). Grows from the inline start, so it runs
 * right-to-left in RTL. Animations are dropped under reduced motion.
 * Mount it once, e.g. in your layout.
 */
export function PageProgress({
  controller = pageProgress,
  height = 3,
  delay = 150,
  position = "fixed",
  color,
  className,
  classNames,
  style,
  ...props
}: PageProgressProps) {
  const { t } = useTranslation()
  const state = usePageProgressState(controller)
  const finishing = state.active && state.value >= 1
  const due = useDelayedFlag(state.active && !finishing, delay)
  // Once shown, stay visible through the finishing animation; loads that end
  // before `delay` never show at all.
  const [shown, setShown] = React.useState(false)
  if (due && !shown) setShown(true)
  if (!state.active && shown) setShown(false)
  if (!due && !(shown && state.active)) return null

  return (
    <div
      role="progressbar"
      aria-label={t("overlay.pageLoading")}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(state.value * 100)}
      data-slot="page-progress"
      data-state={finishing ? "complete" : "loading"}
      className={cn(
        "inset-x-0 top-0 pointer-events-none z-[100]",
        position === "fixed" ? "fixed" : "absolute",
        "transition-opacity duration-300 data-[state=complete]:opacity-0 motion-reduce:transition-none",
        className,
      )}
      style={{ height, ...style }}
      {...props}
    >
      <div
        data-slot="page-progress-bar"
        className={cn(
          "inset-y-0 start-0 ease-out absolute rounded-e-full transition-[width] duration-200 motion-reduce:transition-none",
          pageProgressVariants({ color }),
          classNames?.bar,
        )}
        style={{ width: `${state.value * 100}%` }}
      />
    </div>
  )
}
