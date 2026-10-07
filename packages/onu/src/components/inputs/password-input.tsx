"use client"

import * as React from "react"

import { Icon } from "../../icons/icon"
import { cn } from "../../lib/utils"
import { useTranslation } from "../../providers/onu-provider"
import { InputGroupButton } from "../../ui/input-group"
import { TextInput, type TextInputProps } from "./text-input"

/** 0 = very weak … 4 = strong. */
export type PasswordScore = 0 | 1 | 2 | 3 | 4

/**
 * A small, dependency-free strength estimate: length plus character variety,
 * with penalties for repeats and common sequences. Good enough for a hint;
 * enforce real rules on the server.
 */
export function scorePassword(password: string): PasswordScore {
  if (!password) return 0
  let points = 0
  if (password.length >= 8) points++
  if (password.length >= 12) points++
  if (password.length >= 16) points++
  const classes = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((re) => re.test(password)).length
  points += Math.max(0, classes - 1)
  if (/(.)\1{2,}/.test(password)) points--
  if (/(?:0123|1234|2345|3456|4567|5678|6789|abcd|qwer|asdf|password)/i.test(password)) points -= 2
  if (password.length < 6) points = Math.min(points, 1)
  return Math.max(0, Math.min(4, Math.round((points / 5) * 4))) as PasswordScore
}

const LEVELS = ["strengthVeryWeak", "strengthWeak", "strengthFair", "strengthGood", "strengthStrong"] as const
const BAR_COLOURS = ["bg-destructive", "bg-destructive", "bg-warning", "bg-success", "bg-success"] as const

export interface PasswordInputProps extends Omit<TextInputProps, "type" | "thaana" | "thaanaToggle"> {
  /** Show the show/hide button. Default `true`. */
  toggleable?: boolean
  /** Controlled visibility. */
  visible?: boolean
  defaultVisible?: boolean
  onVisibleChange?: (visible: boolean) => void
  /** Warn when Caps Lock is on while typing. Default `true`. */
  capsLockWarning?: boolean
  /** Show a strength meter. Pass a function to use your own scorer (e.g. zxcvbn). */
  strength?: boolean | ((password: string) => PasswordScore)
  classNames?: TextInputProps["classNames"] & { wrapper?: string; capsLock?: string; strength?: string }
}

/**
 * Password input with a show/hide toggle, a Caps Lock warning and an optional
 * strength meter. Always left-to-right; never Thaana.
 */
export function PasswordInput({
  toggleable = true,
  visible: visibleProp,
  defaultVisible = false,
  onVisibleChange,
  capsLockWarning = true,
  strength = false,
  className,
  classNames,
  endAddon,
  autoComplete,
  onKeyDown,
  onKeyUp,
  onBlur,
  onChange,
  ...props
}: PasswordInputProps) {
  const { t } = useTranslation()
  const id = React.useId()
  const [innerVisible, setInnerVisible] = React.useState(defaultVisible)
  const visible = visibleProp ?? innerVisible
  const [capsLock, setCapsLock] = React.useState(false)
  const [typed, setTyped] = React.useState(() => String(props.defaultValue ?? ""))
  const password = props.value !== undefined ? String(props.value) : typed

  const scorer = typeof strength === "function" ? strength : scorePassword
  const score = strength ? scorer(password) : 0
  const capsId = `${id}-caps`
  const strengthId = `${id}-strength`
  const describedBy =
    [props["aria-describedby"], capsLockWarning && capsLock ? capsId : null, strength && password ? strengthId : null]
      .filter(Boolean)
      .join(" ") || undefined

  const checkCaps = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (capsLockWarning && typeof e.getModifierState === "function") setCapsLock(e.getModifierState("CapsLock"))
  }

  const toggle = () => {
    const next = !visible
    setInnerVisible(next)
    onVisibleChange?.(next)
  }

  const end =
    toggleable || endAddon ? (
      <>
        {endAddon}
        {toggleable ? (
          <InputGroupButton
            size="icon-xs"
            data-slot="password-toggle"
            aria-label={t("input.showPassword")}
            aria-pressed={visible}
            title={t("input.showPassword")}
            disabled={props.disabled}
            onClick={toggle}
            className="touch:size-11"
          >
            <Icon name={visible ? "eye-off" : "eye"} />
          </InputGroupButton>
        ) : null}
      </>
    ) : undefined

  return (
    <div data-slot="password-input" className={cn("gap-1.5 grid", classNames?.wrapper, className)}>
      <TextInput
        type={visible ? "text" : "password"}
        autoComplete={autoComplete ?? (strength ? "new-password" : "current-password")}
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        endAddon={end}
        classNames={classNames}
        className={classNames?.root}
        onKeyDown={(e) => {
          checkCaps(e)
          onKeyDown?.(e)
        }}
        onKeyUp={(e) => {
          checkCaps(e)
          onKeyUp?.(e)
        }}
        onBlur={(e) => {
          setCapsLock(false)
          onBlur?.(e)
        }}
        onChange={(e) => {
          setTyped(e.target.value)
          onChange?.(e)
        }}
        {...props}
        aria-describedby={describedBy}
        dir="ltr"
      />
      {capsLockWarning && capsLock ? (
        <p
          id={capsId}
          role="status"
          data-slot="password-caps-lock"
          className={cn("gap-1.5 text-xs flex items-center text-warning", classNames?.capsLock)}
        >
          <Icon name="warning" size="sm" />
          {t("input.capsLockOn")}
        </p>
      ) : null}
      {strength && password ? (
        <div data-slot="password-strength" data-score={score} className={cn("gap-1 grid", classNames?.strength)}>
          <div className="gap-1 grid grid-cols-4" aria-hidden="true">
            {[1, 2, 3, 4].map((step) => (
              <span
                key={step}
                className={cn(
                  "h-1 rounded-full transition-colors",
                  score >= step || (step === 1 && password) ? BAR_COLOURS[score] : "bg-muted",
                )}
              />
            ))}
          </div>
          <p id={strengthId} aria-live="polite" className="text-xs text-muted-foreground">
            {t("input.strength", { level: t(`input.${LEVELS[score]}`) })}
          </p>
        </div>
      ) : null}
    </div>
  )
}
