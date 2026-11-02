import { cookies } from "next/headers"

import { Providers } from "@/components/providers"

import "./globals.css"

export const metadata = { title: "Onu server-rendering fixture" }

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = (await cookies()).get("locale")?.value === "dv" ? "dv" : "en"

  return (
    <html lang={locale} dir={locale === "dv" ? "rtl" : "ltr"}>
      <body>
        <Providers locale={locale}>{children}</Providers>
      </body>
    </html>
  )
}
