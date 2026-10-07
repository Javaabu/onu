"use client"

import * as React from "react"

import { Icon } from "../../icons/icon"
import { cn } from "../../lib/utils"
import { Button } from "../../ui/button"

export interface CalendarHeaderProps {
  caption: string
  /** Accessible name of the caption button when it zooms out. */
  captionLabel?: string
  /** Zoom out. Omit when the caption is not clickable. */
  onCaptionClick?: () => void
  prevLabel: string
  nextLabel: string
  onPrev: () => void
  onNext: () => void
  canPrev?: boolean
  canNext?: boolean
  /** Announce caption changes. Off when the content announces itself (react-day-picker does). */
  live?: boolean
  className?: string
  classNames?: { caption?: string; nav?: string }
}

/** ‹ caption › header shared by every calendar view. Chevrons mirror in RTL. */
export function CalendarHeader({
  caption,
  captionLabel,
  onCaptionClick,
  prevLabel,
  nextLabel,
  onPrev,
  onNext,
  canPrev = true,
  canNext = true,
  live = true,
  className,
  classNames,
}: CalendarHeaderProps) {
  const navButton = cn("touch:size-11 size-[var(--cell-size,2rem)]", classNames?.nav)
  return (
    <div data-slot="calendar-header" className={cn("gap-1 flex items-center justify-between", className)}>
      <Button
        variant="ghost"
        size="icon"
        className={navButton}
        aria-label={prevLabel}
        disabled={!canPrev}
        onClick={onPrev}
      >
        <Icon name="chevron-left" />
      </Button>
      <Button
        variant="ghost"
        className={cn(
          "px-3 font-medium touch:h-11 h-[var(--cell-size,2rem)] aria-disabled:cursor-default aria-disabled:hover:bg-transparent",
          classNames?.caption,
        )}
        aria-label={onCaptionClick ? captionLabel : undefined}
        aria-disabled={onCaptionClick ? undefined : true}
        onClick={onCaptionClick}
        data-slot="calendar-caption"
      >
        {caption}
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className={navButton}
        aria-label={nextLabel}
        disabled={!canNext}
        onClick={onNext}
      >
        <Icon name="chevron-right" />
      </Button>
      <span className="sr-only" aria-live="polite">
        {live ? caption : ""}
      </span>
    </div>
  )
}
