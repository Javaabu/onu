import * as React from "react"
import {
  Button,
  ForgotPasswordForm,
  RegisterForm,
  ResetPasswordForm,
  SignInForm,
  ValidationError,
  type FormErrors,
} from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"

export const meta = {
  title: "Auth forms",
  group: "Form scaffolding",
  order: 20,
  description: "Sign in (with an eFaas slot), register, forgot password and reset password.",
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))

function Logo() {
  return (
    <div className="size-10 text-lg font-bold grid place-items-center rounded-xl bg-primary text-primary-foreground">
      ޖ
    </div>
  )
}

export default function AuthFormsDemo() {
  const [errors, setErrors] = React.useState<FormErrors | null>(null)
  const [processing, setProcessing] = React.useState(false)
  const [sent, setSent] = React.useState(false)

  return (
    <DemoPage>
      <DemoSection
        title="Sign in"
        description="Any password other than ‘secret’ fails (Inertia-style errors/processing props)."
        className="grid"
      >
        <SignInForm
          logo={<Logo />}
          errors={errors}
          processing={processing}
          forgotPasswordHref="#/components/form-scaffolding/auth-forms"
          registerHref="#/components/form-scaffolding/auth-forms"
          efaas={
            // Placeholder: projects use the official eFaas button and assets (R16.7).
            <Button variant="outline" size="lg" className="w-full">
              Sign in with eFaas
            </Button>
          }
          onSubmit={async ({ password }) => {
            setErrors(null)
            setProcessing(true)
            await wait(1000)
            setProcessing(false)
            if (password !== "secret") setErrors({ email: ["These credentials do not match our records."] })
          }}
        />
      </DemoSection>

      <DemoSection title="Register" description="Submitting throws a 422 for the email." className="grid">
        <RegisterForm
          signInHref="#/components/form-scaffolding/auth-forms"
          termsHref="#/components/form-scaffolding/auth-forms"
          onSubmit={async () => {
            await wait(800)
            throw new ValidationError({ email: ["The email has already been taken."] })
          }}
        />
      </DemoSection>

      <DemoSection title="Forgot password" className="grid">
        <ForgotPasswordForm
          signInHref="#/components/form-scaffolding/auth-forms"
          status={sent ? "We have emailed your password reset link." : undefined}
          onSubmit={async () => {
            await wait(800)
            setSent(true)
          }}
        />
      </DemoSection>

      <DemoSection title="Reset password" className="grid">
        <ResetPasswordForm
          token="demo-token"
          emailReadOnly
          defaultValues={{ email: "mariyam@example.mv" }}
          onSubmit={() => wait(800)}
        />
      </DemoSection>
    </DemoPage>
  )
}
