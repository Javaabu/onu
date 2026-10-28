# Auth forms

Ready-made, presentational authentication forms: `SignInForm`, `RegisterForm`, `ForgotPasswordForm` and `ResetPasswordForm`. They render the fields Laravel's auth scaffolding expects, call `onSubmit` with typed values, and show the `errors`, `processing` and `status` you pass. They never make requests themselves.

```tsx
import { LinkButton, SignInForm } from "@javaabu/onu"
import { useForm } from "@inertiajs/react"

const form = useForm({ email: "", password: "", remember: false })

<SignInForm
  onSubmit={(values) => router.post("/login", values)}
  errors={errors}
  processing={processing}
  forgotPasswordHref="/forgot-password"
  registerHref="/register"
  sso={<LinkButton href="/login/sso" variant="outline" className="w-full">Sign in with eFaas</LinkButton>}
/>
```

`onSubmit` may also return a promise and throw a Laravel 422 body; the errors then show under the fields (see [`Form`](./form.md)).

Fields you add with `extraFields` are submitted too: `onSubmit` receives the typed built-in values plus every other named field as the form submitted it (`AuthFormValues<V>` = `V & Record<string, unknown>`).

```tsx
<SignInForm
  extraFields={<FormField label="Island" name="island"><TextInput /></FormField>}
  onSubmit={(values) => router.post("/login", { ...values, island: String(values.island ?? "") })}
/>
```

## SignInForm

Fields: `email`, `password` (with show/hide), `remember`. Values: `{ email, password, remember: boolean }`.

| Prop                 | Type        | Default | Description                                      |
| -------------------- | ----------- | ------- | ------------------------------------------------ |
| `forgotPasswordHref` | `string`    |         | Shows "Forgot password?" beside the password     |
| `registerHref`       | `string`    |         | Shows "Don’t have an account? Create an account" |
| `showRemember`       | `boolean`   | `true`  | "Remember me" checkbox                           |
| `sso`                | `ReactNode` |         | Single sign-on button(s) under an "or" divider   |

Pass your own single sign-on button in `sso`. A provider's branding (eFaas, Google, …) follows that provider's guidelines and assets, so it belongs in your app rather than in Onu.

## RegisterForm

Fields: `name`, `email`, `password`, `password_confirmation`, and `terms` when `termsHref` is set.

| Prop         | Type      | Description                                     |
| ------------ | --------- | ----------------------------------------------- |
| `signInHref` | `string`  | "Already have an account? Sign in"              |
| `termsHref`  | `string`  | Adds a required "I agree to the terms" checkbox |
| `nameThaana` | `boolean` | Type the name in Thaana (with a toggle)         |

## ForgotPasswordForm

Field: `email`. Pass `status` once the link is sent ("We have emailed your password reset link."). `signInHref` adds "Back to sign in".

## ResetPasswordForm

Fields: hidden `token`, `email`, `password`, `password_confirmation`.

| Prop            | Type      | Default | Description                 |
| --------------- | --------- | ------- | --------------------------- |
| `token`         | `string`  |         | Token from the emailed link |
| `emailReadOnly` | `boolean` | `false` | Lock the email field        |
| `signInHref`    | `string`  |         | "Back to sign in"           |

## Shared props

| Prop                   | Type                                 | Description                                      |
| ---------------------- | ------------------------------------ | ------------------------------------------------ |
| `onSubmit`             | `(values) => unknown`                | Typed values plus any `extraFields` values; may return a promise |
| `errors`               | `Record<string, string \| string[]>` | Server errors by field                           |
| `processing`           | `boolean`                            | Spinner on the button, fields disabled           |
| `status`               | `ReactNode`                          | Success / info message above the fields          |
| `title`, `description` | `ReactNode`                          | Override the default heading and text            |
| `logo`                 | `ReactNode`                          | Above the title                                  |
| `defaultValues`        | `Partial<Values>`                    | Initial values                                   |
| `submitLabel`          | `ReactNode`                          | Button text                                      |
| `extraFields`          | `ReactNode`                          | Extra fields before the button                   |
| `formProps`            | `<form>` props                       | `action`, `method`, `id` … for non-JS submission |

Plus every [`FormContainer`](./form-container.md) prop except `title` and `children`. Links render through the provider's `linkComponent`.

## Accessibility

- Proper `autocomplete` values (`username`, `current-password`, `new-password`, `email`, `name`) so password managers work.
- Email and password inputs stay `dir="ltr"` in RTL pages.
- The password toggle is a button with `aria-pressed` and a translated name.
- Errors are linked to fields and the first invalid field gets focus.
