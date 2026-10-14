import { Head, useForm } from "@inertiajs/react"
import { Card, Form, FormField, PageTitle, Select, SubmitButton, Textarea, TextInput } from "@javaabu/onu"

import { useMessages } from "@/lib/i18n"

interface Props {
    atolls: { value: string; label: string }[]
}

/**
 * Posts to ApplicationController@store. On a validation failure Laravel redirects
 * back and Inertia fills `form.errors`; Onu's `Form` shows each message under the
 * field with the same `name`, focuses the first one and lists them in a summary.
 */
export default function CreateApplication({ atolls }: Props) {
    const { t } = useMessages()
    const form = useForm({ name: "", email: "", atoll: "", reason: "" })

    return (
        <>
            <Head title={t.applicationTitle} />
            <PageTitle title={t.applicationTitle} />
            <div className="p-4 md:p-6">
                <Card description={t.applicationDescription} className="max-w-2xl">
                    <Form
                        className="gap-4 flex flex-col"
                        errors={form.errors}
                        processing={form.processing}
                        onSubmit={() => form.post("/applications")}
                    >
                        <FormField label={t.name} name="name" required>
                            <TextInput
                                value={form.data.name}
                                onChange={(event) => form.setData("name", event.target.value)}
                                autoComplete="name"
                            />
                        </FormField>
                        <FormField label={t.email} name="email" required>
                            <TextInput
                                type="email"
                                dir="ltr"
                                value={form.data.email}
                                onChange={(event) => form.setData("email", event.target.value)}
                                autoComplete="email"
                            />
                        </FormField>
                        <FormField label={t.atoll} name="atoll" required>
                            <Select
                                options={atolls}
                                value={form.data.atoll}
                                onValueChange={(value) => form.setData("atoll", value)}
                            />
                        </FormField>
                        <FormField label={t.reason} name="reason" required help={t.reasonHelp}>
                            <Textarea
                                rows={4}
                                value={form.data.reason}
                                onChange={(event) => form.setData("reason", event.target.value)}
                            />
                        </FormField>
                        <div>
                            <SubmitButton>{t.submit}</SubmitButton>
                        </div>
                    </Form>
                </Card>
            </div>
        </>
    )
}
