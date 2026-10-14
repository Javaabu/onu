"use client"

import { LanguageSwitcher, ThemeToggle } from "@javaabu/onu"
import { useRouter } from "next/navigation"
import { useTransition } from "react"

import { LOCALE_COOKIE } from "@/lib/locale"

/** English / ދިވެހި switch: stores the choice in a cookie and re-renders the server components. */
export function LocaleSwitcher() {
  const router = useRouter()
  const [, startTransition] = useTransition()

  return (
    <div className="gap-2 flex items-center">
      <LanguageSwitcher
        variant="toggle"
        size="sm"
        onChange={(code) => {
          document.cookie = `${LOCALE_COOKIE}=${code}; path=/; max-age=31536000; samesite=lax`
          startTransition(() => router.refresh())
        }}
      />
      <ThemeToggle />
    </div>
  )
}
