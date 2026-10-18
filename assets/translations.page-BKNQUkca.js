var e=`import * as React from "react"
import { Button, Card, CardContent, FilterTabs, Icon, PageTitle, ProgressBar, toast } from "@javaabu/onu"
import { TranslationsEditor, type TranslationEntry } from "@javaabu/onu/editor"

import { useDv, useTr } from "../_shared/i18n"
import { routes } from "../_shared/routes"
import { AdminShell } from "../_shared/shells"
import { translationEntries, translationGroups, wait } from "./_data"

export const meta = { title: "Translations", group: "Admin: content", layout: "bare", order: 5 }

const filled = (e: TranslationEntry, locale: string) => !!e.values[locale]?.trim()

export default function TranslationsPage() {
  const tr = useTr()
  const dv = useDv()
  const [entries, setEntries] = React.useState(translationEntries)
  const [group, setGroup] = React.useState("all")

  const inGroup = (e: TranslationEntry) => group === "all" || e.key.startsWith(\`\${group}.\`)
  const visible = entries.filter(inGroup)
  const locales = [
    { code: "en", label: tr("English", "އިނގިރޭސި") },
    { code: "dv", label: tr("Dhivehi", "ދިވެހި"), thaana: true },
  ]

  return (
    <AdminShell
      contentWidth="wide"
      breadcrumbs={[{ label: tr("Content", "ކޮންޓެންޓް") }, { label: tr("Translations", "ތަރުޖަމާ") }]}
    >
      <div className="gap-6 grid">
        <PageTitle
          title={tr("Translations", "ތަރުޖަމާ")}
          description={tr(
            "Each cell saves when you leave it, or with Ctrl+Enter. The Dhivehi column types Thaana.",
            "ކޮންމެ ގޮޅިއެއް ސޭވްވާނީ އެއިން ބޭރަށް ދިއުމުން ނުވަތަ Ctrl+Enter އިން. ދިވެހި ކޮލަމުގައި ލިޔެވޭނީ ތާނައިން.",
          )}
          action={
            <Button
              variant="outline"
              onClick={async () => {
                await wait(500)
                toast.success(tr("dv.json downloaded", "dv.json ޑައުންލޯޑްކުރެވިއްޖެ"))
              }}
            >
              <Icon name="download" />
              {tr("Export JSON", "JSON އެކްސްޕޯޓް")}
            </Button>
          }
          links={[{ label: tr("Pages", "ސަފްހާތައް"), href: routes.adminContent.pageBuilder, icon: "file" }]}
        />

        <section aria-labelledby="progress-title" className="gap-4 grid">
          <h2 id="progress-title" className="sr-only">
            {tr("Progress", "ކުރިއެރުން")}
          </h2>
          <div className="gap-4 sm:grid-cols-2 grid">
            {locales.map((l) => {
              const done = visible.filter((e) => filled(e, l.code)).length
              return (
                <Card key={l.code} size="sm">
                  <CardContent>
                    <ProgressBar
                      label={l.label}
                      value={done}
                      max={Math.max(visible.length, 1)}
                      color={done === visible.length ? "success" : "primary"}
                      formatValue={(v, max) =>
                        dv ? \`\${max} އިން \${v} ތަރުޖަމާކުރެވިފައި\` : \`\${v} of \${max} translated\`
                      }
                    />
                    <p className="mt-2 text-sm text-muted-foreground">
                      {visible.length - done
                        ? tr(\`\${visible.length - done} missing\`, \`\${visible.length - done} ނެތް\`)
                        : tr("Complete", "ފުރިހަމަ")}
                    </p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </section>

        <FilterTabs
          controls="translations-list"
          value={group}
          onValueChange={setGroup}
          tabs={translationGroups.map((g) => ({
            value: g.value,
            label: dv ? g.label.dv : g.label.en,
            count: entries.filter((e) => g.value === "all" || e.key.startsWith(\`\${g.value}.\`)).length,
          }))}
        />

        <div id="translations-list">
          <TranslationsEditor
            key={group}
            value={visible}
            onChange={(next) => setEntries((all) => all.map((e) => next.find((n) => n.key === e.key) ?? e))}
            locales={locales}
            onSave={async ({ value, key }) => {
              await wait(500)
              if (value.includes("<script")) throw new Error(tr("HTML is not allowed.", "HTML ބޭނުން ނުކުރެވޭނެ."))
              setEntries((all) => all.map((e) => (e.key === key ? { ...e } : e)))
            }}
          />
        </div>
      </div>
    </AdminShell>
  )
}
`;export{e as default};