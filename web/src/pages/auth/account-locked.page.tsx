import * as React from "react"
import { useSearchParams } from "react-router"
import { Button, Card, Countdown, Icon, LinkButton, Notice, SegmentedControl, toast } from "@javaabu/onu"

import { useTr } from "../_shared/i18n"
import { routes } from "../_shared/routes"
import { AuthShell } from "../_shared/shells"
import { DEMO_EMAIL, maskEmail, wait } from "./_data"

export const meta = { title: "Account locked / verify email", group: "Auth", layout: "bare", order: 6 }

type State = "locked" | "verify"

function Hero({ icon, tone }: { icon: string; tone: "warning" | "primary" }) {
  return (
    <div
      className={
        tone === "warning"
          ? "size-14 mx-auto grid place-items-center rounded-full bg-warning/15 text-warning"
          : "size-14 mx-auto grid place-items-center rounded-full bg-primary/10 text-primary"
      }
    >
      <Icon name={icon} className="size-7" />
    </div>
  )
}

function Locked({ onVerify }: { onVerify: () => void }) {
  const tr = useTr()
  // Locked for 15 minutes from when the page opened.
  const [until] = React.useState(() => Date.now() + 15 * 60 * 1000)
  const [unlocked, setUnlocked] = React.useState(false)

  return (
    <Card className="text-center">
      <div className="gap-5 py-8 grid">
        <Hero icon="lock" tone="warning" />
        <div className="gap-2 grid">
          <h1 className="text-xl font-semibold">
            {tr("Account temporarily locked", "އެކައުންޓް ވަގުތީގޮތުން ބަންދުކުރެވިފައި")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {tr(
              "There were too many unsuccessful sign-in attempts. To protect your account, sign-in is paused.",
              "ގިނަ ފަހަރު ނުރަނގަޅު ޕާސްވޯޑު ލިޔުނުތީ، އެކައުންޓް ރައްކާތެރިކުރުމަށް ސައިން އިން ހުއްޓާލެވިފައި.",
            )}
          </p>
        </div>
        <div className="gap-1 p-4 grid justify-items-center rounded-lg bg-muted/60">
          <span className="text-sm text-muted-foreground">
            {unlocked
              ? tr("You can sign in again.", "އަލުން ސައިން އިން ކުރެވޭނެ.")
              : tr("Try again in", "އަލުން މަސައްކަތް ކުރެވޭނީ")}
          </span>
          {unlocked ? null : <Countdown to={until} showSeconds onComplete={() => setUnlocked(true)} />}
        </div>
        <div className="gap-2 grid">
          <LinkButton href={routes.auth.forgotPassword} startIcon="key" className="touch:min-h-11">
            {tr("Reset your password", "ޕާސްވޯޑު ބަދަލުކުރައްވާ")}
          </LinkButton>
          <LinkButton href={routes.auth.signIn} variant="outline" className="touch:min-h-11" disabled={!unlocked}>
            {tr("Back to sign in", "ސައިން އިން އަށް")}
          </LinkButton>
        </div>
        <Notice tone="info" variant="bordered" icon="mail" className="text-start">
          {tr("Never verified your email?", "އީމެއިލް ވެރިފައި ނުކުރައްވަނީތޯ؟")}{" "}
          <Button variant="link" className="p-0 h-auto" onClick={onVerify}>
            {tr("Verify it to unlock now", "ވެރިފައިކޮށް މިހާރުން ހުޅުއްވާ")}
          </Button>
        </Notice>
        <p className="text-xs text-muted-foreground">
          {tr("Not you? Call 1500 or email", "ތިބާއެއް ނޫންތޯ؟ 1500 އަށް ގުޅުއްވާ، ނުވަތަ އީމެއިލް ކުރައްވާ")}{" "}
          <a className="text-primary underline underline-offset-4" href="mailto:support@example.mv" dir="ltr">
            support@example.mv
          </a>
        </p>
      </div>
    </Card>
  )
}

function Verify({ email }: { email: string }) {
  const tr = useTr()
  const [sending, setSending] = React.useState(false)
  const [checking, setChecking] = React.useState(false)
  const [sentCount, setSentCount] = React.useState(1)

  return (
    <Card className="text-center">
      <div className="gap-5 py-8 grid">
        <Hero icon="mail" tone="primary" />
        <div className="gap-2 grid">
          <h1 className="text-xl font-semibold">{tr("Verify your email", "އީމެއިލް ވެރިފައި ކުރައްވާ")}</h1>
          <p className="text-sm text-muted-foreground">
            {tr("We sent a verification link to", "ވެރިފިކޭޝަން ލިންކެއް ފޮނުވީ")}{" "}
            <span dir="ltr" className="font-medium text-foreground">
              {maskEmail(email)}
            </span>
            {tr(
              ". Open it on this device to activate your account.",
              " އަށް. އެކައުންޓް ހުޅުވުމަށް އެ ލިންކް ހުޅުއްވާ.",
            )}
          </p>
        </div>
        <ol className="gap-2 p-4 text-sm grid list-inside list-decimal rounded-lg bg-muted/60 text-start">
          <li>{tr("Open your inbox (check spam too).", "އިންބޮކްސް ހުޅުއްވާ (ސްޕޭމް ވެސް ބައްލަވާ).")}</li>
          <li>{tr("Find the email from eServices.", "އީ ސަރވިސަސް އިން އައި އީމެއިލް ހޯއްދަވާ.")}</li>
          <li>{tr("Select “Verify email address”.", "“އީމެއިލް ވެރިފައި ކުރައްވާ” އަށް ފިއްތަވާ.")}</li>
        </ol>
        <div className="gap-2 grid">
          <Button
            className="touch:min-h-11"
            disabled={checking}
            onClick={async () => {
              setChecking(true)
              await wait(900)
              setChecking(false)
              toast.error(tr("Not verified yet", "އަދި ވެރިފައި ނުވޭ"), {
                description: tr("Open the link in the email first.", "ފުރަތަމަ އީމެއިލްގެ ލިންކް ހުޅުއްވާ."),
              })
            }}
          >
            <Icon
              name={checking ? "loading" : "check"}
              data-icon="inline-start"
              className={checking ? "animate-spin" : undefined}
            />
            {tr("I've verified my email", "އީމެއިލް ވެރިފައި ކުރީމެވެ")}
          </Button>
          <Button
            variant="outline"
            className="touch:min-h-11"
            disabled={sending || sentCount >= 3}
            onClick={async () => {
              setSending(true)
              await wait(700)
              setSending(false)
              setSentCount((n) => n + 1)
              toast.success(tr("Verification email sent", "ވެރިފިކޭޝަން އީމެއިލް ފޮނުވިއްޖެ"))
            }}
          >
            <Icon name="send" data-icon="inline-start" />
            {sending ? tr("Sending…", "ފޮނުވަނީ…") : tr("Resend the email", "އީމެއިލް އަލުން ފޮނުއްވާ")}
          </Button>
          {sentCount >= 3 ? (
            <p role="status" className="text-xs text-muted-foreground">
              {tr("You can request another email in an hour.", "އިތުރު އީމެއިލެއް ހޯދޭނީ އެއް ގަޑިއިރު ފަހުން.")}
            </p>
          ) : null}
        </div>
        <p className="text-sm text-muted-foreground">
          {tr("Wrong address?", "އެޑްރެސް ނުބައިތޯ؟")}{" "}
          <LinkButton href={routes.auth.register} variant="link" className="p-0 h-auto">
            {tr("Register again", "އަލުން ރަޖިސްޓަރ ކުރައްވާ")}
          </LinkButton>
        </p>
      </div>
    </Card>
  )
}

export default function AccountLockedPage() {
  const tr = useTr()
  const [params, setParams] = useSearchParams()
  const state: State = params.get("state") === "verify" ? "verify" : "locked"
  const email = params.get("email") || DEMO_EMAIL
  const setState = (next: State) =>
    setParams((p) => {
      const out = new URLSearchParams(p)
      out.set("state", next)
      return out
    })

  return (
    <AuthShell>
      <div className="gap-4 grid">
        <SegmentedControl
          aria-label={tr("Page state (demo)", "ސަފުހާގެ ހާލަތު (ޑެމޯ)")}
          fullWidth
          size="sm"
          value={state}
          onValueChange={(v) => v && setState(v as State)}
          options={[
            { value: "locked", label: tr("Account locked", "އެކައުންޓް ބަންދު") },
            { value: "verify", label: tr("Email verification", "އީމެއިލް ވެރިފިކޭޝަން") },
          ]}
        />
        {state === "locked" ? <Locked onVerify={() => setState("verify")} /> : <Verify email={email} />}
      </div>
    </AuthShell>
  )
}
