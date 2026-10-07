import * as React from "react"
import { ForgotPasswordForm, LinkButton } from "@javaabu/onu"

import { useTr } from "../_shared/i18n"
import { routes } from "../_shared/routes"
import { AuthShell } from "../_shared/shells"
import { Validator, isEmail, maskEmail, wait } from "./_data"

export const meta = { title: "Forgot password", group: "Auth", layout: "bare", order: 3 }

export default function ForgotPasswordPage() {
  const tr = useTr()
  const [sentTo, setSentTo] = React.useState<string | null>(null)

  return (
    <AuthShell>
      <div className="gap-4 grid">
        <ForgotPasswordForm
          headingLevel={1}
          signInHref={routes.auth.signIn}
          formProps={{ noValidate: true }}
          submitLabel={sentTo ? tr("Send the link again", "ލިންކް އަލުން ފޮނުއްވާ") : undefined}
          status={
            sentTo
              ? tr(
                  `If ${maskEmail(sentTo)} has an account, we have emailed a password reset link. It expires in 60 minutes.`,
                  `${maskEmail(sentTo)} ގައި އެކައުންޓެއް ހުރިނަމަ، ޕާސްވޯޑު ބަދަލުކުރާނެ ލިންކެއް ފޮނުވިއްޖެ. 60 މިނިޓުން ލިންކް ބާޠިލުވާނެ.`,
                )
              : undefined
          }
          onSubmit={async ({ email }) => {
            await wait(800)
            const v = new Validator()
            if (!email) v.add("email", tr("The email field is required.", "އީމެއިލް ލިޔުއްވާ."))
            else if (!isEmail(email))
              v.add("email", tr("The email must be a valid email address.", "ރަނގަޅު އީމެއިލް އެޑްރެހެއް ލިޔުއްވާ."))
            v.throwIfFailed(tr("The given data was invalid.", "ދީފައިވާ މައުލޫމާތު ރަނގަޅެއް ނޫން."))
            setSentTo(email)
          }}
        />
        {sentTo ? (
          <p className="text-sm text-center text-muted-foreground">
            {tr("Demo:", "ޑެމޯ:")}{" "}
            <LinkButton
              variant="link"
              className="h-auto p-0"
              href={`${routes.auth.resetPassword}?email=${encodeURIComponent(sentTo)}`}
            >
              {tr("Open the emailed reset link", "އީމެއިލް ކުރި ލިންކް ހުޅުވާ")}
            </LinkButton>
          </p>
        ) : null}
      </div>
    </AuthShell>
  )
}
