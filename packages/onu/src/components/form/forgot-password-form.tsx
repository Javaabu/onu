"use client"

import { useTranslation } from "../../providers/onu-provider"
import { TextInput } from "../inputs/text-input"
import { AuthLink, AuthShell, str, type AuthFormProps } from "./_auth-shell"
import { FormField } from "./form-field"
import { registerEnglish } from "../../i18n/english"
import { auth as en_auth } from "../../locales/en/auth"

registerEnglish({ auth: en_auth })

export interface ForgotPasswordValues {
  email: string
}

export interface ForgotPasswordFormProps extends AuthFormProps<ForgotPasswordValues> {
  /** Link back to sign in. */
  signInHref?: string
}

/** Asks for an email to send a password reset link to. Pass `status` once the link is sent. */
export function ForgotPasswordForm({
  signInHref,
  title,
  description,
  defaultValues,
  submitLabel,
  extraFields,
  ...props
}: ForgotPasswordFormProps) {
  const { t } = useTranslation()
  return (
    <AuthShell<ForgotPasswordValues>
      title={title ?? t("auth.forgotTitle")}
      description={description ?? t("auth.forgotDescription")}
      toValues={(v) => ({ email: str(v, "email") })}
      submit={submitLabel ?? t("auth.sendResetLink")}
      after={
        signInHref ? (
          <p className="text-sm text-center">
            <AuthLink href={signInHref}>{t("auth.backToSignIn")}</AuthLink>
          </p>
        ) : null
      }
      {...props}
    >
      <FormField label={t("auth.email")} name="email" required>
        <TextInput type="email" autoComplete="email" inputMode="email" dir="ltr" defaultValue={defaultValues?.email} />
      </FormField>
      {extraFields}
    </AuthShell>
  )
}
