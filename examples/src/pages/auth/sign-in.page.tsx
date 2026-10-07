import * as React from "react"
import { useNavigate } from "react-router"
import { Button, Icon, Notice, SignInForm, toast } from "@javaabu/onu"

import { useTr } from "../_shared/i18n"
import { routes } from "../_shared/routes"
import { AuthShell } from "../_shared/shells"
import { DEMO_EMAIL, DEMO_PASSWORD, Validator, isEmail, wait } from "./_data"

export const meta = { title: "Sign in", group: "Auth", layout: "bare", order: 1 }

/** After this many wrong passwords the account is locked. */
const MAX_ATTEMPTS = 3

export default function SignInPage() {
  const tr = useTr()
  const navigate = useNavigate()
  const [attempts, setAttempts] = React.useState(0)
  const [redirecting, setRedirecting] = React.useState(false)

  return (
    <AuthShell>
      <div className="max-w-sm gap-4 mx-auto grid w-full">
        <SignInForm
          headingLevel={1}
          forgotPasswordHref={routes.auth.forgotPassword}
          registerHref={routes.auth.register}
          // Every check runs on the "server" so all errors come back as a 422.
          formProps={{ noValidate: true }}
          onSubmit={async ({ email, password }) => {
            await wait(700)
            const v = new Validator()
            if (!email) v.add("email", tr("The email field is required.", "އީމެއިލް ލިޔުއްވާ."))
            else if (!isEmail(email))
              v.add("email", tr("The email must be a valid email address.", "ރަނގަޅު އީމެއިލް އެޑްރެހެއް ލިޔުއްވާ."))
            if (!password) v.add("password", tr("The password field is required.", "ޕާސްވޯޑު ލިޔުއްވާ."))
            v.throwIfFailed(tr("The given data was invalid.", "ދީފައިވާ މައުލޫމާތު ރަނގަޅެއް ނޫން."))

            if (email.toLowerCase() !== DEMO_EMAIL || password !== DEMO_PASSWORD) {
              const next = attempts + 1
              setAttempts(next)
              if (next >= MAX_ATTEMPTS) {
                navigate(routes.auth.accountLocked)
                return
              }
              v.add(
                "email",
                tr(
                  `These credentials do not match our records. ${MAX_ATTEMPTS - next} attempt(s) left.`,
                  `މި މައުލޫމާތާ ގުޅޭ އެކައުންޓެއް ނުފެނުނު. ބާކީ ހުރީ ${MAX_ATTEMPTS - next} ފަހަރު.`,
                ),
              )
              v.throwIfFailed(tr("These credentials do not match our records.", "މައުލޫމާތު ދިމައެއް ނުވޭ."))
            }
            toast.success(tr("Password accepted", "ޕާސްވޯޑު ރަނގަޅު"), {
              description: tr("Enter the code we sent to your phone.", "ފޯނަށް ފޮނުވި ކޯޑު ލިޔުއްވާ."),
            })
            navigate(routes.auth.twoFactor)
          }}
          efaas={
            // Placeholder: real projects use the button and assets eFaas supplies (R16.7).
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="touch:min-h-11 w-full"
              disabled={redirecting}
              onClick={async () => {
                setRedirecting(true)
                toast.info(tr("Redirecting to eFaas…", "eFaas އަށް ގެންދަނީ…"))
                await wait(1200)
                setRedirecting(false)
                navigate(routes.auth.twoFactor)
              }}
            >
              <Icon name="log-in" data-icon="inline-start" />
              {tr("Sign in with eFaas", "eFaas އިން ސައިން އިން ކުރައްވާ")}
            </Button>
          }
        />
        <Notice tone="info" variant="bordered" icon="info">
          {tr("Demo account:", "ޑެމޯ އެކައުންޓް:")}{" "}
          <bdi dir="ltr" className="font-mono">
            {DEMO_EMAIL} / {DEMO_PASSWORD}
          </bdi>
          {". "}
          {tr(
            `${MAX_ATTEMPTS} wrong passwords lock the account.`,
            `${MAX_ATTEMPTS} ފަހަރު ޕާސްވޯޑު ނުބައިވެއްޖެނަމަ އެކައުންޓް ބަންދުވާނެ.`,
          )}
        </Notice>
      </div>
    </AuthShell>
  )
}
