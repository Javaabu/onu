"use client"

import { useTranslation } from "../../providers/onu-provider"
import { PasswordInput } from "../inputs/password-input"
import { TextInput } from "../inputs/text-input"
import { AuthLink, AuthShell, str, type AuthFormProps } from "./_auth-shell"
import { FormField } from "./form-field"
import { registerEnglish } from "../../i18n/english"
import { auth as en_auth } from "../../locales/en/auth"

registerEnglish({ auth: en_auth })

export interface ResetPasswordValues {
  token: string
  email: string
  password: string
  password_confirmation: string
}

export interface ResetPasswordFormProps extends AuthFormProps<ResetPasswordValues> {
  /** The reset token from the emailed link; sent as a hidden `token` field. */
  token: string
  /** Lock the email field (it usually comes from the link). Default `false`. */
  emailReadOnly?: boolean
  signInHref?: string
}

/** Sets a new password from an emailed reset link. */
export function ResetPasswordForm({
  token,
  emailReadOnly = false,
  signInHref,
  title,
  description,
  defaultValues,
  submitLabel,
  extraFields,
  ...props
}: ResetPasswordFormProps) {
  const { t } = useTranslation()
  return (
    <AuthShell<ResetPasswordValues>
      title={title ?? t("auth.resetTitle")}
      description={description ?? t("auth.resetDescription")}
      toValues={(v) => ({
        token: str(v, "token"),
        email: str(v, "email"),
        password: str(v, "password"),
        password_confirmation: str(v, "password_confirmation"),
      })}
      submit={submitLabel ?? t("auth.resetPassword")}
      after={
        signInHref ? (
          <p className="text-sm text-center">
            <AuthLink href={signInHref}>{t("auth.backToSignIn")}</AuthLink>
          </p>
        ) : null
      }
      {...props}
    >
      <input type="hidden" name="token" value={token} />
      <FormField label={t("auth.email")} name="email" required>
        <TextInput
          type="email"
          autoComplete="email"
          inputMode="email"
          dir="ltr"
          readOnly={emailReadOnly}
          defaultValue={defaultValues?.email}
        />
      </FormField>
      <FormField label={t("auth.newPassword")} name="password" required>
        <PasswordInput autoComplete="new-password" />
      </FormField>
      <FormField label={t("auth.confirmPassword")} name="password_confirmation" required>
        <PasswordInput autoComplete="new-password" />
      </FormField>
      {extraFields}
    </AuthShell>
  )
}
