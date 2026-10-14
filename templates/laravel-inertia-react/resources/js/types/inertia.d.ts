import type { Locale } from "@/lib/i18n"

declare module "@inertiajs/core" {
    export interface InertiaConfig {
        // Laravel sends one message per field in Inertia's `errors` prop.
        errorValueType: string
        // Shared by app/Http/Middleware/HandleInertiaRequests.php.
        sharedPageProps: {
            locale: Locale
            flash: { success?: string | null }
        }
    }
}
