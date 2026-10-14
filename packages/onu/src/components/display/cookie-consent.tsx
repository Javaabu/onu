"use client"

import * as React from "react"

import { Icon } from "../../icons/icon"
import { cn } from "../../lib/utils"
import { useTranslation } from "../../providers/onu-provider"
import { Button } from "../../ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog"
import { Switch } from "../../ui/switch"
import { readStorage, writeStorage } from "./_utils"
import { AppLink } from "./_link"
import { registerEnglish } from "../../i18n/english"
import { common as en_common } from "../../locales/en/common"
import { display as en_display } from "../../locales/en/display"

registerEnglish({ common: en_common, display: en_display })

export interface CookieCategory {
  id: string
  label: React.ReactNode
  description?: React.ReactNode
  /** Always on and can't be switched off (e.g. strictly necessary cookies). */
  required?: boolean
  /** Initial state of the switch in the preferences dialog. */
  defaultEnabled?: boolean
}

/** What the user chose, as stored in `localStorage`. */
export interface CookieConsentValue {
  categories: Record<string, boolean>
  version: string | number
  /** ISO timestamp of the decision. */
  updatedAt: string
}

const CHANGE_EVENT = "onu:cookie-consent"
const OPEN_EVENT = "onu:cookie-preferences"
export const COOKIE_CONSENT_STORAGE_KEY = "onu-cookie-consent"

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange)
  window.addEventListener(CHANGE_EVENT, onChange)
  return () => {
    window.removeEventListener("storage", onChange)
    window.removeEventListener(CHANGE_EVENT, onChange)
  }
}

const snapshots = new Map<string, { raw: string | null; value: CookieConsentValue | null }>()

/** Reads the stored consent. Returns the same object until it changes (safe for `useSyncExternalStore`). */
export function readCookieConsent(storageKey = COOKIE_CONSENT_STORAGE_KEY): CookieConsentValue | null {
  let raw: string | null
  try {
    raw = window.localStorage.getItem(storageKey)
  } catch {
    raw = null
  }
  const cached = snapshots.get(storageKey)
  if (cached && cached.raw === raw) return cached.value
  const value = raw === null ? null : readStorage<CookieConsentValue>(storageKey)
  snapshots.set(storageKey, { raw, value })
  return value
}

/** The stored cookie consent, kept up to date across components and tabs. `null` until the user decides. */
export function useCookieConsent(storageKey = COOKIE_CONSENT_STORAGE_KEY) {
  return React.useSyncExternalStore(
    subscribe,
    () => readCookieConsent(storageKey),
    () => null,
  )
}

/** Opens the preferences dialog of the mounted `CookieConsent` (e.g. from a "Cookie settings" footer link). */
export function openCookiePreferences() {
  window.dispatchEvent(new Event(OPEN_EVENT))
}

export interface CookieConsentProps extends Omit<React.ComponentProps<"section">, "title" | "onChange"> {
  /** Cookie categories. Defaults to necessary, preferences, analytics and marketing. */
  categories?: CookieCategory[]
  /** Bump to ask everyone again (e.g. after adding a category). */
  version?: string | number
  storageKey?: string
  /** Called whenever the user saves a choice. */
  onChange?: (consent: CookieConsentValue) => void
  title?: React.ReactNode
  description?: React.ReactNode
  /** Link to the cookie or privacy policy. */
  policyHref?: string
  policyLinkText?: React.ReactNode
  /** Controlled preferences dialog. */
  preferencesOpen?: boolean
  onPreferencesOpenChange?: (open: boolean) => void
  classNames?: { banner?: string; actions?: string; dialog?: string; category?: string }
}

/**
 * Cookie banner with a preferences dialog. Users can accept all, reject
 * non-essential cookies, or choose per category. The choice is saved in
 * `localStorage` and the banner stays away until `version` changes.
 *
 * Read the choice anywhere with `useCookieConsent()`, and reopen the dialog
 * with `openCookiePreferences()`.
 */
export function CookieConsent({
  categories: categoriesProp,
  version = 1,
  storageKey = COOKIE_CONSENT_STORAGE_KEY,
  onChange,
  title,
  description,
  policyHref,
  policyLinkText,
  preferencesOpen,
  onPreferencesOpenChange,
  className,
  classNames,
  ...props
}: CookieConsentProps) {
  const { t } = useTranslation()
  const titleId = React.useId()
  const consent = useCookieConsent(storageKey)
  const decided = !!consent && consent.version === version

  const categories = React.useMemo<CookieCategory[]>(
    () =>
      categoriesProp ?? [
        {
          id: "necessary",
          label: t("display.cookieNecessary"),
          description: t("display.cookieNecessaryDescription"),
          required: true,
        },
        {
          id: "preferences",
          label: t("display.cookiePreferences"),
          description: t("display.cookiePreferencesCategoryDescription"),
        },
        {
          id: "analytics",
          label: t("display.cookieAnalytics"),
          description: t("display.cookieAnalyticsDescription"),
        },
        {
          id: "marketing",
          label: t("display.cookieMarketing"),
          description: t("display.cookieMarketingDescription"),
        },
      ],
    [categoriesProp, t],
  )

  const initialChoices = React.useCallback(
    () =>
      Object.fromEntries(
        categories.map((c) => [c.id, c.required ? true : (consent?.categories[c.id] ?? c.defaultEnabled ?? false)]),
      ),
    [categories, consent],
  )

  const [openState, setOpenState] = React.useState(false)
  const open = preferencesOpen ?? openState
  const [choices, setChoices] = React.useState<Record<string, boolean>>(initialChoices)

  const setOpen = React.useCallback(
    (next: boolean) => {
      if (next) setChoices(initialChoices())
      setOpenState(next)
      onPreferencesOpenChange?.(next)
    },
    [initialChoices, onPreferencesOpenChange],
  )

  React.useEffect(() => {
    const onOpen = () => setOpen(true)
    window.addEventListener(OPEN_EVENT, onOpen)
    return () => window.removeEventListener(OPEN_EVENT, onOpen)
  }, [setOpen])

  const save = (selected: Record<string, boolean>) => {
    const value: CookieConsentValue = {
      categories: Object.fromEntries(categories.map((c) => [c.id, c.required ? true : !!selected[c.id]])),
      version,
      updatedAt: new Date().toISOString(),
    }
    writeStorage(storageKey, value)
    window.dispatchEvent(new Event(CHANGE_EVENT))
    onChange?.(value)
  }

  const acceptAll = () => save(Object.fromEntries(categories.map((c) => [c.id, true])))
  const rejectNonEssential = () => save({})

  return (
    <>
      {decided ? null : (
        <section
          aria-labelledby={titleId}
          data-slot="cookie-consent"
          className={cn(
            "inset-x-0 bottom-0 p-4 sm:p-6 pointer-events-none fixed z-40 pb-[max(1rem,env(safe-area-inset-bottom))]",
            className,
          )}
          {...props}
        >
          <div
            className={cn(
              "gap-4 p-4 shadow-lg max-w-3xl @container pointer-events-auto mx-auto grid rounded-xl border bg-popover text-popover-foreground",
              classNames?.banner,
            )}
          >
            <div className="gap-3 flex items-start">
              <Icon name="cookie" className="mt-0.5 size-5 shrink-0 text-primary" />
              <div className="gap-1 grid">
                <h2 id={titleId} className="text-base font-medium">
                  {title ?? t("display.cookieTitle")}
                </h2>
                <p className="text-sm text-pretty text-muted-foreground">
                  {description ?? t("display.cookieDescription")}{" "}
                  {policyHref ? (
                    <AppLink href={policyHref} className="underline underline-offset-4 hover:text-foreground">
                      {policyLinkText ?? t("display.cookiePolicy")}
                    </AppLink>
                  ) : null}
                </p>
              </div>
            </div>
            <div
              data-slot="cookie-consent-actions"
              className={cn("gap-2 @md:flex @md:flex-wrap @md:justify-end grid", classNames?.actions)}
            >
              <Button variant="ghost" className="touch:h-11" onClick={() => setOpen(true)}>
                {t("display.cookieCustomize")}
              </Button>
              <Button variant="outline" className="touch:h-11" onClick={rejectNonEssential}>
                {t("display.cookieRejectNonEssential")}
              </Button>
              <Button className="touch:h-11" onClick={acceptAll}>
                {t("display.cookieAcceptAll")}
              </Button>
            </div>
          </div>
        </section>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          showCloseButton={false}
          className={cn("sm:max-w-lg max-h-[90dvh] overflow-y-auto", classNames?.dialog)}
        >
          <DialogHeader>
            <DialogTitle>{t("display.cookiePreferencesTitle")}</DialogTitle>
            <DialogDescription>{t("display.cookiePreferencesDescription")}</DialogDescription>
          </DialogHeader>
          <ul className="divide-y">
            {categories.map((category) => {
              const id = `${titleId}-${category.id}`
              return (
                <li
                  key={category.id}
                  data-slot="cookie-category"
                  className={cn("gap-4 py-3 flex items-start justify-between", classNames?.category)}
                >
                  <div className="gap-0.5 grid">
                    <label htmlFor={id} className="text-sm font-medium">
                      {category.label}
                    </label>
                    {category.description ? (
                      <p id={`${id}-description`} className="text-xs text-muted-foreground">
                        {category.description}
                      </p>
                    ) : null}
                    {category.required ? (
                      <span className="text-xs font-medium text-muted-foreground">{t("display.cookieAlwaysOn")}</span>
                    ) : null}
                  </div>
                  <Switch
                    id={id}
                    className="mt-0.5"
                    checked={category.required ? true : !!choices[category.id]}
                    disabled={category.required}
                    aria-describedby={category.description ? `${id}-description` : undefined}
                    onCheckedChange={(checked) => setChoices((prev) => ({ ...prev, [category.id]: checked }))}
                  />
                </li>
              )
            })}
          </ul>
          <DialogFooter className="sm:justify-between">
            <DialogClose asChild>
              <Button variant="ghost">{t("common.cancel")}</Button>
            </DialogClose>
            <div className="gap-2 sm:flex-row flex flex-col-reverse">
              <Button
                variant="outline"
                onClick={() => {
                  rejectNonEssential()
                  setOpen(false)
                }}
              >
                {t("display.cookieRejectNonEssential")}
              </Button>
              <Button
                onClick={() => {
                  save(choices)
                  setOpen(false)
                }}
              >
                {t("display.cookieSave")}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
