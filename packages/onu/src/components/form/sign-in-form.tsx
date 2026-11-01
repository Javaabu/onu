"use client"

import * as React from "react"

import { cn } from "../../lib/utils"
import { useTranslation } from "../../providers/onu-provider"
import { PasswordInput } from "../inputs/password-input"
import { TextInput } from "../inputs/text-input"
import { Divider } from "../layout/divider"
import { AuthLink, AuthShell, CheckboxRow, str, type AuthFormProps } from "./_auth-shell"
import { FormField } from "./form-field"
import { registerEnglish } from "../../i18n/english"
import { auth as en_auth } from "../../locales/en/auth"

registerEnglish({ auth: en_auth })

export interface SignInValues {
  email: string
  password: string
  remember: boolean
}

export interface SignInFormProps extends AuthFormProps<SignInValues> {
  /** Link for "Forgot password?". Hidden when omitted. */
  forgotPasswordHref?: string
  /** Link for "Create an account". Hidden when omitted. */
  registerHref?: string
  /** Show "Remember me". Default `true`. */
  showRemember?: boolean
  /** A single sign-on button (or several), shown under an "or" divider. */
  sso?: React.ReactNode
}

/** Email + password sign-in form with remember me, forgot-password link and an optional single sign-on slot. */
export function SignInForm({
  forgotPasswordHref,
  registerHref,
  showRemember = true,
  sso,
  title,
  description,
  defaultValues,
  submitLabel,
  extraFields,
  classNames,
  ...props
}: SignInFormProps) {
  const { t } = useTranslation()
  return (
    <AuthShell<SignInValues>
      title={title ?? t("auth.signInTitle")}
      description={description ?? t("auth.signInDescription")}
      toValues={(v) => ({ email: str(v, "email"), password: str(v, "password"), remember: !!v.remember })}
      submit={submitLabel ?? t("auth.signIn")}
      after={
        <>
          {sso ? (
            <>
              {/* Lines either side of the label, no background, so it suits any card surface. */}
              <Divider label={t("auth.or")} className="text-sm" />
              <div data-slot="auth-sso" className={cn("grid", classNames?.sso)}>
                {sso}
              </div>
            </>
          ) : null}
          {registerHref ? (
            <p className="text-sm text-center text-muted-foreground">
              {t("auth.noAccount")} <AuthLink href={registerHref}>{t("auth.createAccount")}</AuthLink>
            </p>
          ) : null}
        </>
      }
      classNames={classNames}
      {...props}
    >
      <FormField label={t("auth.email")} name="email" required>
        <TextInput
          type="email"
          autoComplete="username"
          inputMode="email"
          dir="ltr"
          defaultValue={defaultValues?.email}
        />
      </FormField>
      <FormField
        label={t("auth.password")}
        name="password"
        required
        labelAside={
          forgotPasswordHref ? <AuthLink href={forgotPasswordHref}>{t("auth.forgotPassword")}</AuthLink> : null
        }
      >
        <PasswordInput autoComplete="current-password" defaultValue={defaultValues?.password} />
      </FormField>
      {showRemember ? (
        <CheckboxRow name="remember" label={t("auth.remember")} defaultChecked={defaultValues?.remember} />
      ) : null}
      {extraFields}
    </AuthShell>
  )
}
