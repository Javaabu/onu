"use client"

import * as React from "react"

import { cn } from "../../lib/utils"
import { SubmitButton, type SubmitButtonProps } from "./submit-button"

export interface FloatingSubmitProps extends SubmitButtonProps {
  /**
   * The main submit button to watch. When it scrolls out of view the floating
   * button appears. Defaults to the first other submit button in the same form.
   */
  target?: React.RefObject<HTMLElement | null>
  /** Show regardless of the target (useful for tests and screenshots). */
  forceVisible?: boolean
  classNames?: { root?: string; button?: string }
}

/**
 * A submit button that floats at the bottom of the screen while the form's
 * main submit button is out of view, so long forms can be submitted from anywhere.
 */
export function FloatingSubmit({ target, forceVisible = false, className, classNames, ...props }: FloatingSubmitProps) {
  const anchor = React.useRef<HTMLSpanElement>(null)
  const [outOfView, setOutOfView] = React.useState(false)

  React.useEffect(() => {
    const el =
      target?.current ??
      Array.from(anchor.current?.closest("form")?.querySelectorAll<HTMLElement>("[type=submit]") ?? []).find(
        (b) => !b.closest("[data-slot=floating-submit]"),
      )
    if (!el || typeof IntersectionObserver === "undefined") return
    const observer = new IntersectionObserver(([entry]) => setOutOfView(!entry!.isIntersecting))
    observer.observe(el)
    return () => observer.disconnect()
  }, [target])

  const visible = forceVisible || outOfView

  return (
    <span ref={anchor} data-slot="floating-submit-anchor" className="contents">
      {visible ? (
        <div
          data-slot="floating-submit"
          className={cn(
            "inset-x-4 sm:inset-x-auto sm:end-6 fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] z-40 animate-in fade-in-0 slide-in-from-bottom-2",
            classNames?.root,
          )}
        >
          <SubmitButton
            size="lg"
            className={cn("shadow-lg sm:w-auto px-5 w-full rounded-full", classNames?.button, className)}
            {...props}
          />
        </div>
      ) : null}
    </span>
  )
}
