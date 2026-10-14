import { usePage } from "@inertiajs/react"

export type Locale = "en" | "dv"

/**
 * The app's own strings. Onu translates its components itself through
 * `OnuProvider locale`; Laravel's validation messages come from `lang/`.
 */
const messages = {
    en: {
        appName: "Onu Admin",
        navMain: "Main",
        dashboard: "Dashboard",
        newApplication: "New application",
        welcome: "Welcome to Onu",
        welcomeBody: "A Laravel, Inertia and React starter. Switch to ދިވެހި in the header to see the RTL layout.",
        recent: "Recent applications",
        approved: "Approved",
        inReview: "In review",
        applicationTitle: "New application",
        applicationDescription: "Submit the form empty to see Laravel's validation errors under each field.",
        name: "Full name",
        email: "Email",
        atoll: "Atoll",
        reason: "Reason",
        reasonHelp: "At least 10 characters.",
        submit: "Submit application",
    },
    dv: {
        appName: "އޮނު އެޑްމިން",
        navMain: "މައި",
        dashboard: "ޑޭޝްބޯޑް",
        newApplication: "އައު އެޕްލިކޭޝަން",
        welcome: "އޮނަށް މަރުޙަބާ",
        welcomeBody: "ލަރަވެލް، އިނާޝިއާ އަދި ރިއެކްޓް ސްޓާޓަރ. ހެޑަރުން English އަށް ބަދަލުކުރެވޭނެ.",
        recent: "ފަހުގެ އެޕްލިކޭޝަންތައް",
        approved: "ފާސްކޮށްފި",
        inReview: "ރިވިއުކުރަނީ",
        applicationTitle: "އައު އެޕްލިކޭޝަން",
        applicationDescription: "ފޯމު ހުސްކޮށް ފޮނުއްވައިގެން ލަރަވެލްގެ ގޯސްތައް ބައްލަވާ.",
        name: "ފުރިހަމަ ނަން",
        email: "އީމެއިލް",
        atoll: "އަތޮޅު",
        reason: "ސަބަބު",
        reasonHelp: "މަދުވެގެން 10 އަކުރު.",
        submit: "އެޕްލިކޭޝަން ހުށަހަޅާ",
    },
} satisfies Record<Locale, Record<string, string>>

export type Messages = (typeof messages)["en"]

/** The current locale (shared by HandleInertiaRequests) and the app's strings for it. */
export function useMessages(): { locale: Locale; t: Messages } {
    const locale = usePage().props.locale
    return { locale, t: messages[locale] ?? messages.en }
}
