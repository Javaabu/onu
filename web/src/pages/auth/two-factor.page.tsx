import * as React from "react"
import { useNavigate } from "react-router"
import {
  Button,
  Callout,
  Form,
  FormContainer,
  FormField,
  Icon,
  LinkButton,
  OtpInput,
  SubmitButton,
  TextInput,
  toast,
} from "@javaabu/onu"

import { useTr } from "../_shared/i18n"
import { routes } from "../_shared/routes"
import { AuthShell } from "../_shared/shells"
import { DEMO_CODE, Validator, wait } from "./_data"

export const meta = { title: "Two-factor verification", group: "Auth", layout: "bare", order: 5 }

/** Seconds before another code can be requested. */
const RESEND_AFTER = 30

function useCooldown(seconds: number) {
  const [left, setLeft] = React.useState(seconds)
  React.useEffect(() => {
    if (left <= 0) return
    const id = setTimeout(() => setLeft((s) => s - 1), 1000)
    return () => clearTimeout(id)
  }, [left])
  return [left, () => setLeft(seconds)] as const
}

export default function TwoFactorPage() {
  const tr = useTr()
  const navigate = useNavigate()
  const [mode, setMode] = React.useState<"code" | "recovery">("code")
  const [code, setCode] = React.useState("")
  const [left, restart] = useCooldown(RESEND_AFTER)
  const [resending, setResending] = React.useState(false)

  const resend = async () => {
    setResending(true)
    await wait(700)
    setResending(false)
    setCode("")
    restart()
    toast.success(tr("A new code is on its way", "އާ ކޯޑެއް ފޮނުވިއްޖެ"), {
      description: tr("Sent by SMS to +960 777‑4821.", "+960 777‑4821 އަށް އެސްއެމްއެސް ކޮށްފި."),
    })
  }

  const mmss = `0:${String(left).padStart(2, "0")}`

  return (
    <AuthShell>
      <FormContainer
        headingLevel={1}
        width="sm"
        centered
        media={
          <div className="size-12 grid place-items-center rounded-full bg-primary/10 text-primary">
            <Icon name={mode === "code" ? "phone" : "key"} className="size-6" />
          </div>
        }
        title={tr("Two-factor verification", "ދެ ފިޔަވަޅުގެ ވެރިފިކޭޝަން")}
        description={
          mode === "code" ? (
            <>
              {tr("Enter the 6-digit code we sent by SMS to", "6 ޑިޖިޓުގެ ކޯޑު ފޮނުވީ")}{" "}
              <span dir="ltr" className="font-medium whitespace-nowrap text-foreground">
                +960 777‑4821
              </span>
              {tr(".", " އަށް.")}
            </>
          ) : (
            tr(
              "Enter one of the recovery codes you saved when you turned on two-factor sign-in.",
              "ދެ ފިޔަވަޅުގެ ސައިން އިން ފެށިއިރު ރައްކާކުރި ރިކަވަރީ ކޯޑެއް ލިޔުއްވާ.",
            )
          )
        }
      >
        <Form
          noValidate
          className="gap-5"
          onSubmit={async (values) => {
            await wait(800)
            const v = new Validator()
            if (mode === "code") {
              const value = String(values.code ?? "")
              if (value.length < 6) v.add("code", tr("Enter all 6 digits.", "6 ޑިޖިޓް ހުރިހާ ލިޔުއްވާ."))
              else if (value !== DEMO_CODE)
                v.add("code", tr("The code is invalid or has expired.", "ކޯޑު ރަނގަޅެއް ނޫން، ނުވަތަ ބާޠިލުވެއްޖެ."))
            } else {
              const value = String(values.recovery_code ?? "").trim()
              if (!/^[a-z0-9]{5}-[a-z0-9]{5}$/i.test(value))
                v.add("recovery_code", tr("The recovery code is invalid.", "ރިކަވަރީ ކޯޑު ރަނގަޅެއް ނޫން."))
            }
            v.throwIfFailed(tr("The given data was invalid.", "ދީފައިވާ މައުލޫމާތު ރަނގަޅެއް ނޫން."))
            toast.success(tr("Signed in", "ސައިން އިން ވެއްޖެ"), {
              description: tr("Welcome back, Ahmed.", "މަރުޙަބާ، އަޙްމަދު."),
            })
            navigate(routes.citizen.dashboard)
          }}
        >
          {mode === "code" ? (
            <FormField
              label={tr("Verification code", "ވެރިފިކޭޝަން ކޯޑު")}
              name="code"
              required
              help={tr(`Demo code: ${DEMO_CODE}`, `ޑެމޯ ކޯޑު: ${DEMO_CODE}`)}
            >
              <OtpInput value={code} onValueChange={setCode} groupSize={3} autoSubmit autoComplete="one-time-code" />
            </FormField>
          ) : (
            <FormField
              label={tr("Recovery code", "ރިކަވަރީ ކޯޑު")}
              name="recovery_code"
              required
              help={tr("For example k7m2p-9xq4t.", "މިސާލަކަށް k7m2p-9xq4t")}
            >
              <TextInput dir="ltr" autoComplete="off" spellCheck={false} />
            </FormField>
          )}

          <SubmitButton size="lg" className="touch:min-h-11 w-full">
            {tr("Verify", "ވެރިފައި ކުރައްވާ")}
          </SubmitButton>

          {mode === "code" ? (
            <div className="gap-1 text-sm flex flex-col items-center text-center">
              <span className="text-muted-foreground">{tr("Didn't get the code?", "ކޯޑު ނުލިބުނީތޯ؟")}</span>
              <Button
                type="button"
                variant="link"
                className="touch:min-h-11 h-auto"
                disabled={left > 0 || resending}
                onClick={resend}
              >
                {resending
                  ? tr("Sending…", "ފޮނުވަނީ…")
                  : left > 0
                    ? tr(`Resend code in ${mmss}`, `${mmss} ފަހުން އަލުން ފޮނުވޭނެ`)
                    : tr("Resend code", "ކޯޑު އަލުން ފޮނުއްވާ")}
              </Button>
              {/* Announce once when the button becomes available, not every second. */}
              <span className="sr-only" aria-live="polite">
                {left === 0 ? tr("You can request a new code now.", "އާ ކޯޑެއް މިހާރު ހޯދޭނެ.") : ""}
              </span>
            </div>
          ) : null}

          <div className="gap-2 pt-4 grid border-t">
            <Button
              type="button"
              variant="ghost"
              className="touch:min-h-11"
              onClick={() => setMode((m) => (m === "code" ? "recovery" : "code"))}
            >
              <Icon name={mode === "code" ? "key" : "phone"} data-icon="inline-start" />
              {mode === "code"
                ? tr("Use a recovery code instead", "ރިކަވަރީ ކޯޑެއް ބޭނުން ކުރައްވާ")
                : tr("Use an SMS code instead", "އެސްއެމްއެސް ކޯޑެއް ބޭނުން ކުރައްވާ")}
            </Button>
            <LinkButton href={routes.auth.signIn} variant="ghost" startIcon="back" className="touch:min-h-11">
              {tr("Back to sign in", "ސައިން އިން އަށް")}
            </LinkButton>
          </div>
        </Form>
      </FormContainer>
      <Callout appearance="subtle" icon="lock" className="max-w-sm mt-4 mx-auto">
        {tr(
          "Never share this code. Staff will never ask you for it.",
          "މި ކޯޑު އެއްވެސް މީހަކާ ހިއްސާ ނުކުރައްވާ. މުވައްޒަފުން ކޯޑު ނުއަހާނެ.",
        )}
      </Callout>
    </AuthShell>
  )
}
