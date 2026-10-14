// Shared by server and client components: no "use client" here.

export const LOCALE_COOKIE = "locale"

export type Locale = "en" | "dv"

export function parseLocale(value: string | undefined): Locale {
  return value === "dv" ? "dv" : "en"
}

export function dirOf(locale: Locale) {
  return locale === "dv" ? "rtl" : "ltr"
}

/** The app's own strings. Onu translates its components itself (through `OnuProvider locale`). */
const messages = {
  en: {
    title: "Applications",
    subtitle: "A Next.js App Router page built with Onu.",
    newApplication: "New application",
    welcome: "Welcome to Onu",
    welcomeBody: "Server components render this page; only the interactive parts are client components.",
    recent: "Recent applications",
    approved: "Approved",
    inReview: "In review",
    contact: "Contact us",
    contactDescription: "Submit the form empty to see server-side validation errors under the fields.",
    name: "Name",
    email: "Email",
    message: "Message",
    send: "Send",
    sent: "Thanks, your message was sent.",
    nameRequired: "The name field is required.",
    emailInvalid: "The email field must be a valid email address.",
    messageMin: "The message field must be at least 10 characters.",
  },
  dv: {
    title: "އެޕްލިކޭޝަންތައް",
    subtitle: "އޮނު ބޭނުންކޮށްގެން ހަދާފައިވާ Next.js ޞަފްޙާއެއް.",
    newApplication: "އައު އެޕްލިކޭޝަން",
    welcome: "އޮނަށް މަރުޙަބާ",
    welcomeBody: "މި ޞަފްޙާ ރެންޑަރކުރަނީ ސާވަރުންނެވެ.",
    recent: "ފަހުގެ އެޕްލިކޭޝަންތައް",
    approved: "ފާސްކޮށްފި",
    inReview: "ރިވިއުކުރަނީ",
    contact: "ގުޅުއްވާ",
    contactDescription: "ފޯމު ހުސްކޮށް ފޮނުއްވައިގެން ސާވަރުގެ ގޯސްތައް ބައްލަވާ.",
    name: "ނަން",
    email: "އީމެއިލް",
    message: "މެސެޖް",
    send: "ފޮނުވާ",
    sent: "ޝުކުރިއްޔާ، މެސެޖް ފޮނުވިއްޖެ.",
    nameRequired: "ނަން ލިޔުއްވުން ލާޒިމު.",
    emailInvalid: "ރަނގަޅު އީމެއިލް އެޑްރެހެއް ލިޔުއްވާ.",
    messageMin: "މެސެޖުގައި މަދުވެގެން 10 އަކުރު ލިޔުއްވާ.",
  },
} satisfies Record<Locale, Record<string, string>>

export type Messages = (typeof messages)["en"]

export function getMessages(locale: Locale): Messages {
  return messages[locale]
}
