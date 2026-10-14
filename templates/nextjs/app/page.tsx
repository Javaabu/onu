import { Callout, Card, LinkButton, PageTitle, StatusBadge } from "@javaabu/onu"

import { ContactForm } from "@/components/contact-form"
import { LocaleSwitcher } from "@/components/locale-switcher"
import { getLocale } from "@/lib/get-locale"
import { getMessages } from "@/lib/locale"

const applications = [
  { id: "APP-2026-00412", name: "Aishath Shifa", status: "approved" },
  { id: "APP-2026-00413", name: "Mohamed Ali", status: "review" },
] as const

// A Server Component. Onu's components are client components, but they can be
// rendered from here as long as every prop is serialisable (strings, numbers,
// elements). Anything that takes a function (`onSubmit`, `onChange`) lives in a
// "use client" file under components/.
export default async function HomePage() {
  const t = getMessages(await getLocale())

  return (
    <main className="max-w-4xl gap-6 px-4 py-8 mx-auto flex flex-col">
      <div className="flex justify-end">
        <LocaleSwitcher />
      </div>

      <PageTitle title={t.title} action={<LinkButton href="#contact">{t.newApplication}</LinkButton>} />

      <Callout variant="info" title={t.welcome} description={t.welcomeBody} />

      <Card title={t.recent}>
        <ul className="gap-3 flex flex-col">
          {applications.map((application) => (
            <li key={application.id} className="gap-4 flex items-center justify-between">
              <span>
                <span className="font-medium">{application.name}</span>{" "}
                <span className="text-sm font-mono text-muted-foreground" dir="ltr">
                  {application.id}
                </span>
              </span>
              {application.status === "approved" ? (
                <StatusBadge status="success">{t.approved}</StatusBadge>
              ) : (
                <StatusBadge status="pending">{t.inReview}</StatusBadge>
              )}
            </li>
          ))}
        </ul>
      </Card>

      <Card id="contact" title={t.contact} description={t.contactDescription}>
        <ContactForm t={t} />
      </Card>
    </main>
  )
}
