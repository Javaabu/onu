import { Head, usePage } from "@inertiajs/react"
import { Callout, Card, LinkButton, PageTitle, StatusBadge } from "@javaabu/onu"

import { useMessages } from "@/lib/i18n"

const applications = [
    { id: "APP-2026-00412", name: "Aishath Shifa", approved: true },
    { id: "APP-2026-00413", name: "Mohamed Ali", approved: false },
]

export default function Dashboard() {
    const { t } = useMessages()
    const { flash } = usePage().props

    return (
        <>
            <Head title={t.dashboard} />
            <PageTitle
                title={t.dashboard}
                action={
                    <LinkButton href="/applications/create" startIcon="add">
                        {t.newApplication}
                    </LinkButton>
                }
            />
            <div className="gap-6 p-4 md:p-6 flex flex-col">
                {flash.success && <Callout variant="success" title={flash.success} />}
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
                                {application.approved ? (
                                    <StatusBadge status="success">{t.approved}</StatusBadge>
                                ) : (
                                    <StatusBadge status="pending">{t.inReview}</StatusBadge>
                                )}
                            </li>
                        ))}
                    </ul>
                </Card>
            </div>
        </>
    )
}
