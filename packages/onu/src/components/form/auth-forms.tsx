"use client"

import * as React from "react"

import { Icon } from "../../icons/icon"
import { cn } from "../../lib/utils"
import { useLinkComponent, useTranslation } from "../../providers/onu-provider"
import { Checkbox } from "../../ui/checkbox"
import { TextInput } from "../inputs/text-input"
import { Divider } from "../layout/divider"
import { PasswordField } from "./_password-input"
import { FieldErrors } from "./field-errors"
import { Form, type FormValues } from "./form"
import { FormContainer, type FormContainerProps } from "./form-container"
import { useFieldErrors, useFormDisabled, type FormErrors } from "./form-context"
import { FormField } from "./form-field"
import { Label } from "./label"
import { SubmitButton } from "./submit-button"
import { registerEnglish } from "../../i18n/english"
import { auth as en_auth } from "../../locales/en/auth"

registerEnglish({ auth: en_auth })

/**
 * What an auth form submits: its built-in fields, typed, plus any other named
 * fields (from `extraFields`) as `FormData` values (`string`, `File` or arrays).
 */
export type AuthFormValues<V> = V & Record<string, unknown>

export interface AuthFormProps<V> extends Omit<FormContainerProps, "onSubmit" | "children" | "title" | "onError"> {
  /**
   * Called with the typed values, plus every other named field in the form
   * (e.g. from `extraFields`) as submitted. May return a promise; throw a
   * Laravel 422 body to show errors.
   */
  onSubmit?: (values: AuthFormValues<V>) => unknown
  /** Server errors by field name (Laravel / Inertia `errors`). */
  errors?: FormErrors | null
  /** Show the submitting state (e.g. Inertia's `processing`). */
  processing?: boolean
  title?: React.ReactNode
  /** A status message above the form, e.g. "We have emailed your password reset link." */
  status?: React.ReactNode
  /** Logo or illustration above the title. */
  logo?: React.ReactNode
  defaultValues?: Partial<V>
  /** Submit button label. */
  submitLabel?: React.ReactNode
  /** Extra fields rendered before the submit button. */
  extraFields?: React.ReactNode
  /** Native form props (`action`, `method`, …) for non-JS submission. */
  formProps?: Omit<React.ComponentProps<"form">, "onSubmit" | "onError" | "children">
}

function str(values: FormValues, key: string) {
  const v = values[key]
  return typeof v === "string" ? v : ""
}

function AuthLink({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) {
  const LinkComponent = useLinkComponent()
  // createElement: the link component comes from context (Inertia/Next Link), not created here.
  return React.createElement(
    LinkComponent,
    {
      href,
      className: cn(
        "font-medium rounded-sm text-primary underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50",
        className,
      ),
    },
    children,
  )
}

function CheckboxRow({
  name,
  label,
  defaultChecked,
  required,
  aside,
}: {
  name: string
  label: React.ReactNode
  defaultChecked?: boolean
  required?: boolean
  aside?: React.ReactNode
}) {
  const id = React.useId()
  const errors = useFieldErrors(name)
  const disabled = useFormDisabled()
  const errorId = errors.length ? `${id}-error` : undefined
  return (
    <div className="gap-1.5 grid">
      <div className="gap-x-2 gap-y-1 flex flex-wrap items-center">
        <Checkbox
          id={id}
          name={name}
          value="1"
          defaultChecked={defaultChecked}
          required={required}
          disabled={disabled}
          aria-invalid={errors.length ? true : undefined}
          aria-describedby={errorId}
          className="touch:size-5"
        />
        <Label htmlFor={id} required={required} className="font-normal leading-snug">
          {label}
        </Label>
        {aside}
      </div>
      <FieldErrors id={errorId} errors={errors} />
    </div>
  )
}

function AuthShell<V>({
  title,
  description,
  status,
  logo,
  errors,
  processing,
  onSubmit,
  toValues,
  formProps,
  children,
  submit,
  after,
  className,
  defaultValues: _defaultValues,
  submitLabel: _submitLabel,
  extraFields: _extraFields,
  ...props
}: AuthFormProps<V> & {
  description: React.ReactNode
  toValues: (values: FormValues) => V
  children: React.ReactNode
  submit: React.ReactNode
  after?: React.ReactNode
}) {
  return (
    <FormContainer
      title={title}
      description={description}
      media={logo}
      width="sm"
      centered
      className={cn("@container/auth", className)}
      {...props}
    >
      <Form
        errors={errors}
        processing={processing}
        onSubmit={onSubmit ? (values: FormValues) => onSubmit({ ...values, ...toValues(values) }) : undefined}
        className="gap-5"
        {...formProps}
      >
        {status ? (
          <p
            role="status"
            className="gap-2 p-3 text-sm flex items-start rounded-lg border border-success/30 bg-success/10 text-foreground"
          >
            <Icon name="success" className="mt-0.5 size-4 shrink-0 text-success" />
            <span>{status}</span>
          </p>
        ) : null}
        {children}
        <SubmitButton size="lg" className="touch:min-h-11 w-full">
          {submit}
        </SubmitButton>
        {after}
      </Form>
    </FormContainer>
  )
}

// ---------------------------------------------------------------- Sign in

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
  /**
   * An eFaas (or other single sign-on) button, shown under an "or" divider.
   * Usually an `EfaasButton` with the eFaas icon from eFaas's brand kit (R16.7).
   */
  efaas?: React.ReactNode
}

/** Email + password sign-in form with remember me, forgot-password link and an optional eFaas slot. */
export function SignInForm({
  forgotPasswordHref,
  registerHref,
  showRemember = true,
  efaas,
  title,
  description,
  defaultValues,
  submitLabel,
  extraFields,
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
          {efaas ? (
            <>
              {/* Lines either side of the label, no background, so it suits any card surface. */}
              <Divider label={t("auth.or")} className="text-sm" />
              <div data-slot="auth-efaas" className="grid">
                {efaas}
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
        <PasswordField autoComplete="current-password" defaultValue={defaultValues?.password} />
      </FormField>
      {showRemember ? (
        <CheckboxRow name="remember" label={t("auth.remember")} defaultChecked={defaultValues?.remember} />
      ) : null}
      {extraFields}
    </AuthShell>
  )
}

// ---------------------------------------------------------------- Register

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
        <PasswordField autoComplete="new-password" />
      </FormField>
      <FormField label={t("auth.confirmPassword")} name="password_confirmation" required>
        <PasswordField autoComplete="new-password" />
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

// ---------------------------------------------------------------- Forgot password

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

// ---------------------------------------------------------------- Reset password

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
        <PasswordField autoComplete="new-password" />
      </FormField>
      <FormField label={t("auth.confirmPassword")} name="password_confirmation" required>
        <PasswordField autoComplete="new-password" />
      </FormField>
      {extraFields}
    </AuthShell>
  )
}
