import { createInertiaApp } from "@inertiajs/react"
import { ThemeProvider, TooltipProvider } from "@javaabu/onu"
import type { ComponentType, ReactNode } from "react"
import { createRoot } from "react-dom/client"

import { AppShell } from "@/layouts/app-shell"

type PageModule = { default: ComponentType & { layout?: (page: ReactNode) => ReactNode } }

const appName = import.meta.env.VITE_APP_NAME || "Laravel"

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: async (name) => {
        const pages = import.meta.glob<PageModule>("./pages/**/*.tsx")
        const page = await pages[`./pages/${name}.tsx`]!()
        // Every page gets the admin shell as a persistent layout unless it sets its own.
        page.default.layout ??= (children) => <AppShell>{children}</AppShell>
        return page.default
    },
    setup({ el, App, props }) {
        createRoot(el).render(
            <ThemeProvider>
                {/* Tooltips (e.g. the collapsed sidebar's labels) need one provider at the root. */}
                <TooltipProvider>
                    <App {...props} />
                </TooltipProvider>
            </ThemeProvider>,
        )
    },
    progress: { color: "var(--primary)" },
})
