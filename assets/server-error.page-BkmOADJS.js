var e=`import * as React from "react"
import { CopyInput, FormField, ServerErrorPage, toast } from "@javaabu/onu"

import { useTr } from "../_shared/i18n"
import { routes } from "../_shared/routes"
import { SystemShell } from "./_shell"

export const meta = { title: "500 Server error", group: "System", layout: "bare", order: 3 }

const REFERENCE = "ERR-20261007-7F3A9C"

export default function ServerErrorSamplePage() {
  const tr = useTr()
  const [tries, setTries] = React.useState(0)

  return (
    <SystemShell>
      <ServerErrorPage
        as="div"
        homeHref={routes.public.home}
        className="pb-6"
        message={tr(
          "Something went wrong on our side and your request wasn't completed. Nothing was charged. Try again in a moment.",
          "އަޅުގަނޑުމެންގެ ފަރާތުން މައްސަލައެއް ދިމާވެގެން ތިޔަ އެދުން ފުރިހަމަ ނުވި. އެއްވެސް ފައިސާއެއް ނުކެނޑޭ. ކުޑަ ވަގުތުކޮޅަކުން އަލުން މަސައްކަތް ކުރައްވާ.",
        )}
        onRetry={() => {
          const next = tries + 1
          setTries(next)
          toast.error(tr("Still not working", "އަދިވެސް ރަނގަޅެއް ނުވޭ"), {
            description: tr(
              \`Attempt \${next} failed. If it keeps happening, contact support with the reference below.\`,
              \`\${next} ވަނަ މަސައްކަތްވެސް ނާކާމިޔާބު. މައްސަލަ ދެމިހުރިނަމަ، ތިރީގައިވާ ރެފަރެންސް ނަންބަރާއެކު ގުޅުއްވާ.\`,
            ),
          })
        }}
      />
      <div className="max-w-sm gap-2 mx-auto grid w-full">
        <FormField
          label={tr("Error reference", "މައްސަލައިގެ ރެފަރެންސް")}
          help={tr("Quote this when you call 1500.", "1500 އަށް ގުޅުއްވާއިރު މި ނަންބަރު ދެއްވާ.")}
        >
          <CopyInput value={REFERENCE} dir="ltr" mono />
        </FormField>
      </div>
    </SystemShell>
  )
}
`;export{e as default};