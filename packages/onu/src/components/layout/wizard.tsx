"use client"

import * as React from "react"

import { Icon } from "../../icons/icon"
import { cn } from "../../lib/utils"
import { useTranslation } from "../../providers/onu-provider"
import { Button } from "../../ui/button"
import { registerEnglish } from "../../i18n/english"
import { common as en_common } from "../../locales/en/common"
import { layout as en_layout } from "../../locales/en/layout"

registerEnglish({ common: en_common, layout: en_layout })

export interface WizardStep {
  id: string
  title: React.ReactNode
  /** Plain-text title for announcements when `title` is not a string. */
  textTitle?: string
  description?: React.ReactNode
  optional?: boolean
  content?: React.ReactNode
  /** Per-step validation, run before moving forward. Return `false` to stay. */
  validate?: () => boolean | Promise<boolean>
}

export type WizardStepStatus = "complete" | "current" | "upcoming" | "error"

export interface WizardContextValue {
  index: number
  total: number
  step: WizardStep
  isFirst: boolean
  isLast: boolean
  validating: boolean
  /** Validate the current step and go to the next one (or finish on the last step). */
  next: () => Promise<boolean>
  back: () => void
  /** Go to a step if it is reachable (completed, or the next one). */
  goTo: (index: number) => boolean
  statusOf: (index: number) => WizardStepStatus
}

const WizardContext = React.createContext<WizardContextValue | null>(null)

/** Wizard state and navigation for custom step content and footers. */
export function useWizard() {
  const ctx = React.useContext(WizardContext)
  if (!ctx) throw new Error("useWizard must be used inside <Wizard>.")
  return ctx
}

export interface WizardProps extends Omit<React.ComponentProps<"div">, "onChange"> {
  steps: WizardStep[]
  /** Current step index (controlled). */
  step?: number
  defaultStep?: number
  onStepChange?: (index: number) => void
  /** Validation hook for every step; runs after the step's own `validate`. */
  onValidateStep?: (index: number, step: WizardStep) => boolean | Promise<boolean>
  /** Called when the last step validates. */
  onComplete?: () => void | Promise<void>
  /** Only allow jumping back to completed steps (default). `false` lets users jump anywhere. */
  linear?: boolean
  /** Step ids to mark as having errors (e.g. from server validation). */
  errorSteps?: string[]
  /** Steps on top (default) or in a column at the start. */
  orientation?: "horizontal" | "vertical"
  finishLabel?: React.ReactNode
  /** Hide the built-in Back / Next footer (use `useWizard()` in your own). */
  hideFooter?: boolean
  /** Extra footer content (e.g. "Save draft"). */
  footerExtra?: React.ReactNode
  classNames?: {
    steps?: string
    step?: string
    marker?: string
    panel?: string
    title?: string
    footer?: string
    compact?: string
  }
}

function plain(step: WizardStep) {
  if (step.textTitle) return step.textTitle
  return typeof step.title === "string" || typeof step.title === "number" ? String(step.title) : step.id
}

/**
 * A multi-step flow: a step list with status, Back / Next with per-step
 * validation, jumping back to completed steps, a compact header in narrow
 * containers, and step changes announced to screen readers (focus moves to the
 * step heading).
 */
export function Wizard({
  steps,
  step: stepProp,
  defaultStep = 0,
  onStepChange,
  onValidateStep,
  onComplete,
  linear = true,
  errorSteps,
  orientation = "horizontal",
  finishLabel,
  hideFooter = false,
  footerExtra,
  className,
  classNames,
  children,
  ...props
}: WizardProps) {
  const { t, locale } = useTranslation()
  const [inner, setInner] = React.useState(defaultStep)
  const index = Math.min(Math.max(stepProp ?? inner, 0), Math.max(steps.length - 1, 0))
  const [completed, setCompleted] = React.useState<Set<number>>(() => new Set())
  const [failed, setFailed] = React.useState<Set<number>>(() => new Set())
  const [validating, setValidating] = React.useState(false)
  const [announcement, setAnnouncement] = React.useState("")
  const headingRef = React.useRef<HTMLHeadingElement>(null)
  const moved = React.useRef(false)
  const uid = React.useId()

  const total = steps.length
  const current = steps[index]!
  const errorIds = React.useMemo(() => new Set(errorSteps ?? []), [errorSteps])

  React.useEffect(() => {
    if (!moved.current) return
    headingRef.current?.focus({ preventScroll: false })
  }, [index])

  const reachable = (target: number) => {
    if (target === index || target < 0 || target >= total) return false
    if (!linear) return true
    if (completed.has(target)) return true
    // Otherwise only the step right after the furthest completed one.
    let furthest = -1
    completed.forEach((i) => {
      if (i > furthest) furthest = i
    })
    return target === furthest + 1
  }

  const change = (target: number) => {
    moved.current = true
    if (stepProp === undefined) setInner(target)
    onStepChange?.(target)
    const s = steps[target]!
    setAnnouncement(t("layout.stepOfTitle", { current: target + 1, total, title: plain(s) }))
  }

  const statusOf = (i: number): WizardStepStatus => {
    const s = steps[i]
    if (s && (errorIds.has(s.id) || failed.has(i))) return "error"
    if (i === index) return "current"
    if (completed.has(i)) return "complete"
    return "upcoming"
  }

  const next = async () => {
    if (validating) return false
    setValidating(true)
    let ok = true
    try {
      if (current.validate) ok = await current.validate()
      if (ok && onValidateStep) ok = await onValidateStep(index, current)
    } finally {
      setValidating(false)
    }
    setFailed((prev) => {
      const nextSet = new Set(prev)
      if (ok) nextSet.delete(index)
      else nextSet.add(index)
      return nextSet
    })
    if (!ok) return false
    setCompleted((prev) => new Set(prev).add(index))
    if (index === total - 1) {
      await onComplete?.()
    } else {
      change(index + 1)
    }
    return true
  }

  const back = () => {
    if (index > 0) change(index - 1)
  }

  const goTo = (target: number) => {
    if (!reachable(target)) return false
    change(target)
    return true
  }

  const ctx: WizardContextValue = {
    index,
    total,
    step: current,
    isFirst: index === 0,
    isLast: index === total - 1,
    validating,
    next,
    back,
    goTo,
    statusOf,
  }

  const statusText: Record<WizardStepStatus, string> = {
    complete: t("layout.stepComplete"),
    current: t("layout.stepCurrent"),
    upcoming: t("layout.stepUpcoming"),
    error: t("layout.stepError"),
  }
  const vertical = orientation === "vertical"
  const fmt = new Intl.NumberFormat(locale.numberLocale)
  const headingId = `${uid}-heading`
  const progress = total > 1 ? ((index + 1) / total) * 100 : 100

  return (
    <WizardContext.Provider value={ctx}>
      <div
        data-slot="wizard"
        data-orientation={orientation}
        className={cn(
          "gap-6 @container/wizard flex flex-col",
          vertical && "@2xl/wizard:grid @2xl/wizard:grid-cols-[minmax(12rem,16rem)_minmax(0,1fr)] @2xl/wizard:gap-10",
          className,
        )}
        {...props}
      >
        {/* Compact header for narrow containers */}
        <div data-slot="wizard-compact" className={cn("gap-2 @2xl/wizard:hidden flex flex-col", classNames?.compact)}>
          <p className="text-xs font-medium text-muted-foreground">
            {t("layout.stepOf", { current: index + 1, total })}
          </p>
          <div aria-hidden="true" className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-[width] duration-200 motion-reduce:transition-none"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <nav aria-label={t("layout.steps")} className="@2xl/wizard:block hidden">
          <ol
            data-slot="wizard-steps"
            className={cn("gap-2 flex", vertical ? "flex-col" : "flex-row items-start", classNames?.steps)}
          >
            {steps.map((s, i) => {
              const status = statusOf(i)
              const canGo = reachable(i)
              const marker = (
                <span
                  data-slot="wizard-marker"
                  data-status={status}
                  className={cn(
                    "size-8 text-sm font-medium flex shrink-0 items-center justify-center rounded-full border tabular-nums transition-colors",
                    "data-[status=upcoming]:border-border data-[status=upcoming]:text-muted-foreground",
                    "data-[status=current]:border-primary data-[status=current]:bg-primary data-[status=current]:text-primary-foreground",
                    "data-[status=complete]:border-primary data-[status=complete]:text-primary",
                    "data-[status=error]:border-destructive data-[status=error]:text-destructive",
                    classNames?.marker,
                  )}
                >
                  {status === "complete" ? (
                    <Icon name="check" className="size-4" />
                  ) : status === "error" ? (
                    <Icon name="error" className="size-4" />
                  ) : (
                    fmt.format(i + 1)
                  )}
                </span>
              )
              const text = (
                <span className="gap-0.5 min-w-0 flex flex-col text-start">
                  <span
                    className={cn(
                      "text-sm font-medium",
                      status === "upcoming" && "text-muted-foreground",
                      status === "error" && "text-destructive",
                    )}
                  >
                    {s.title}
                  </span>
                  {s.description ? <span className="text-xs text-muted-foreground">{s.description}</span> : null}
                  {s.optional ? <span className="text-xs text-muted-foreground">{t("common.optional")}</span> : null}
                  <span className="sr-only">, {statusText[status]}</span>
                </span>
              )
              const itemClass = cn(
                "gap-3 p-1.5 min-w-0 flex items-start rounded-lg outline-none",
                canGo && "hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50",
                classNames?.step,
              )
              return (
                <li
                  key={s.id}
                  data-slot="wizard-step"
                  data-status={status}
                  aria-current={i === index ? "step" : undefined}
                  className={cn("gap-2 min-w-0 flex", !vertical && "flex-1 items-center")}
                >
                  {canGo ? (
                    <button type="button" onClick={() => goTo(i)} className={itemClass}>
                      {marker}
                      {text}
                    </button>
                  ) : (
                    <div className={itemClass}>
                      {marker}
                      {text}
                    </div>
                  )}
                  {!vertical && i < total - 1 ? (
                    <span
                      aria-hidden="true"
                      className={cn("min-w-4 h-px flex-1", completed.has(i) ? "bg-primary" : "bg-border")}
                    />
                  ) : null}
                </li>
              )
            })}
          </ol>
        </nav>

        <div className="gap-6 min-w-0 flex flex-col">
          <section
            data-slot="wizard-panel"
            aria-labelledby={headingId}
            className={cn("gap-4 flex flex-col", classNames?.panel)}
          >
            <div className="gap-1 flex flex-col">
              <h2
                id={headingId}
                ref={headingRef}
                tabIndex={-1}
                className={cn("text-lg font-semibold outline-none", classNames?.title)}
              >
                {current.title}
              </h2>
              {current.description ? <p className="text-sm text-muted-foreground">{current.description}</p> : null}
            </div>
            {current.content}
            {children}
          </section>

          {!hideFooter ? (
            <div
              data-slot="wizard-footer"
              className={cn("gap-2 pt-4 flex flex-wrap items-center border-t", classNames?.footer)}
            >
              <Button
                type="button"
                variant="outline"
                onClick={back}
                disabled={index === 0 || validating}
                className="touch:min-h-11"
              >
                <Icon name="back" />
                {t("common.back")}
              </Button>
              <div className="flex-1">{footerExtra}</div>
              <Button
                type="button"
                onClick={() => void next()}
                disabled={validating}
                aria-busy={validating || undefined}
                className="touch:min-h-11"
              >
                {validating ? <Icon name="loading" className="animate-spin motion-reduce:animate-none" /> : null}
                {index === total - 1 ? (finishLabel ?? t("layout.finish")) : t("common.next")}
                {index < total - 1 && !validating ? <Icon name="forward" /> : null}
              </Button>
            </div>
          ) : null}
        </div>

        <span role="status" aria-live="polite" className="sr-only">
          {announcement}
        </span>
      </div>
    </WizardContext.Provider>
  )
}
