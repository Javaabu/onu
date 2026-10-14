import { Link, router, usePage } from "@inertiajs/react"
import {
    AppHeader,
    AppLayout,
    AppSidebar,
    LanguageSwitcher,
    Logo,
    OnuProvider,
    ThemeToggle,
    type LinkComponent,
} from "@javaabu/onu"
import type { ReactNode } from "react"

import { useMessages } from "@/lib/i18n"

// Inertia's Link types its onClick for any element, not just <a>, so it needs a cast.
const InertiaLink = Link as LinkComponent

/**
 * The admin shell: Onu's provider (locale + Inertia links), the sidebar and the
 * header with the English / ދިވެހި switch. Used as a persistent layout, so the
 * sidebar keeps its state between visits.
 */
export function AppShell({ children }: { children: ReactNode }) {
    const { url } = usePage()
    const { locale, t } = useMessages()

    return (
        <OnuProvider locale={locale} linkComponent={InertiaLink}>
            <AppLayout
                sidebar={
                    <AppSidebar
                        currentHref={url}
                        match="exact"
                        header={<Logo alt={t.appName} text={t.appName} />}
                        groups={[
                            {
                                label: t.navMain,
                                items: [
                                    { label: t.dashboard, href: "/", icon: "home" },
                                    { label: t.newApplication, href: "/applications/create", icon: "file-text" },
                                ],
                            },
                        ]}
                    />
                }
                header={
                    <AppHeader
                        sidebarTrigger
                        actions={
                            <div className="gap-2 flex items-center">
                                <LanguageSwitcher
                                    variant="toggle"
                                    size="sm"
                                    value={locale}
                                    // The locale lives in the session, so the server renders the next page in it.
                                    onChange={(code) =>
                                        router.post("/locale", { locale: code }, { preserveScroll: true })
                                    }
                                />
                                <ThemeToggle />
                            </div>
                        }
                    />
                }
            >
                {children}
            </AppLayout>
        </OnuProvider>
    )
}
