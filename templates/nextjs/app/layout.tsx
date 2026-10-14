import type { Metadata } from "next"

import { Providers } from "@/components/providers"
import { ThemeScript } from "@/components/theme-script"
import { getLocale } from "@/lib/get-locale"
import { dirOf } from "@/lib/locale"

import "./globals.css"

export const metadata: Metadata = {
  title: "Onu + Next.js",
  description: "A Next.js App Router starter using @javaabu/onu",
}

// A Server Component: it reads the locale cookie so the first HTML already has the
// right `lang` and `dir` (no flash of LTR content for Dhivehi visitors).
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale()

  return (
    <html lang={locale} dir={dirOf(locale)} suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body>
        <Providers locale={locale}>{children}</Providers>
      </body>
    </html>
  )
}
