var e=`import { TranslationsEditor, type TranslationChange, type TranslationEntry } from "@javaabu/onu/editor"

import { DemoPage, DemoSection } from "../../components/demo"

export const meta = {
  title: "Translations editor",
  group: "Rich content",
  order: 5,
  description:
    "Edit translation keys in English and Dhivehi side by side, with search, a missing filter and inline saving.",
}

const entries: TranslationEntry[] = [
  { key: "auth.login", values: { en: "Log in", dv: "ލޮގިން" }, description: "Button on the sign-in page" },
  { key: "auth.logout", values: { en: "Log out", dv: "" } },
  { key: "nav.islands", values: { en: "Islands", dv: "ރަށްތައް" } },
  { key: "nav.atolls", values: { en: "Atolls", dv: "" } },
  { key: "payments.amount", values: { en: "Amount (MVR)", dv: "އަދަދު (ރުފިޔާ)" } },
  { key: "payments.receipt", values: { en: "", dv: "ރަސީދު" }, description: "Heading of the receipt page" },
]

/** Pretends to save to an API; values containing "error" fail. */
async function save(change: TranslationChange) {
  await new Promise((resolve) => setTimeout(resolve, 600))
  if (change.value.includes("error")) throw new Error("422")
}

export default function TranslationsEditorDemo() {
  return (
    <DemoPage>
      <DemoSection
        title="Saving on blur"
        description="Changes save when a field loses focus or with Ctrl/⌘+Enter. Type “error” to see a failed save."
        className="block"
      >
        <TranslationsEditor defaultValue={entries} onSave={save} />
      </DemoSection>
      <DemoSection title="Missing only, read only" className="block">
        <TranslationsEditor defaultValue={entries} defaultMissingOnly readOnly />
      </DemoSection>
    </DemoPage>
  )
}
`;export{e as default};