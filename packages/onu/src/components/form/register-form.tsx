"use client"

import { useTranslation } from "../../providers/onu-provider"
import { PasswordInput } from "../inputs/password-input"
import { TextInput } from "../inputs/text-input"
import { AuthLink, AuthShell, CheckboxRow, str, type AuthFormProps } from "./_auth-shell"
import { FormField } from "./form-field"
import { registerEnglish } from "../../i18n/english"
import { auth as en_auth } from "../../locales/en/auth"

registerEnglish({ auth: en_auth })

export interface RegisterValues {
  name: string
  email: string
  password: string
  password_confirmation: string
  terms: boolean
}

export interface RegisterFormProps extends AuthFormProps<RegisterValues> {
  /** Link for "Already have an account? Sign in". */
  signInHref?: string
  /** Link to the terms. When set, an "I agree to the terms" checkbox is required. */
  termsHref?: string
  /** Type the name in Thaana (R13.3). */
  nameThaana?: boolean
}

/** Registration form: name, email, password and confirmation, optional terms checkbox. */
export function RegisterForm({
  signInHref,
  termsHref,
  nameThaana,
  title,
  description,
  defaultValues,
  submitLabel,
  extraFields,
  ...props
}: RegisterFormProps) {
  const { t } = useTranslation()
  return (
    <AuthShell<RegisterValues>
      title={title ?? t("auth.registerTitle")}
      description={description ?? t("auth.registerDescription")}
      toValues={(v) => ({
        name: str(v, "name"),
        email: str(v, "email"),
        password: str(v, "password"),
        password_confirmation: str(v, "password_confirmation"),
        terms: !!v.terms,
      })}
      submit={submitLabel ?? t("auth.register")}
      after={
        signInHref ? (
          <p className="text-sm text-center text-muted-foreground">
            {t("auth.haveAccount")} <AuthLink href={signInHref}>{t("auth.signIn")}</AuthLink>
          </p>
        ) : null
      }
      {...props}
    >
      <FormField label={t("auth.name")} name="name" required>
        <TextInput
          autoComplete="name"
          thaana={nameThaana}
          thaanaToggle={nameThaana}
          defaultValue={defaultValues?.name}
        />
      </FormField>
      <FormField label={t("auth.email")} name="email" required>
        <TextInput type="email" autoComplete="email" inputMode="email" dir="ltr" defaultValue={defaultValues?.email} />
      </FormField>
      <FormField label={t("auth.password")} name="password" required>
        <PasswordInput autoComplete="new-password" />
      </FormField>
      <FormField label={t("auth.confirmPassword")} name="password_confirmation" required>
        <PasswordInput autoComplete="new-password" />
      </FormField>
      {extraFields}
      {termsHref ? (
        <CheckboxRow
          name="terms"
          label={t("auth.acceptTerms")}
          required
          defaultChecked={defaultValues?.terms}
          aside={
            <AuthLink href={termsHref} className="text-sm">
              {t("auth.readTerms")}
            </AuthLink>
          }
        />
      ) : null}
    </AuthShell>
  )
}
