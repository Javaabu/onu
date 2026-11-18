var e=`import * as React from "react"
import { useNavigate } from "react-router"
import { FormField, PhoneInput, RegisterForm, TextInput, toast } from "@javaabu/onu"

import { useTr } from "../_shared/i18n"
import { routes } from "../_shared/routes"
import { AuthShell } from "../_shared/shells"
import { TAKEN_EMAILS, Validator, isEmail, wait } from "./_data"

export const meta = { title: "Register", group: "Auth", layout: "bare", order: 2 }

export default function RegisterPage() {
  const tr = useTr()
  const navigate = useNavigate()
  const formRef = React.useRef<HTMLFormElement>(null)

  return (
    <AuthShell>
      <RegisterForm
        headingLevel={1}
        signInHref={routes.auth.signIn}
        termsHref={routes.public.laws}
        formProps={{ noValidate: true, ref: formRef }}
        extraFields={
          <>
            <FormField
              label={tr("National ID card number", "ދިވެހި ރައްޔިތެއްގެ ކާޑު ނަންބަރު")}
              name="id_card"
              required
              help={tr("For example A123456.", "މިސާލަކަށް A123456")}
            >
              <TextInput dir="ltr" autoComplete="off" autoCapitalize="characters" maxLength={7} />
            </FormField>
            <FormField label={tr("Mobile number", "މޯބައިލް ނަންބަރު")} name="phone" required>
              <PhoneInput defaultCountry="MV" />
            </FormField>
          </>
        }
        onSubmit={async (values) => {
          // The typed values only cover the built-in fields; read the extra ones from the form
          // (before the fake request: fields are disabled while it runs).
          const data = formRef.current ? new FormData(formRef.current) : new FormData()
          const idCard = String(data.get("id_card") ?? "").trim()
          const phone = String(data.get("phone") ?? "").trim()
          await wait(800)

          const v = new Validator()
          if (!values.name.trim()) v.add("name", tr("The name field is required.", "ނަން ލިޔުއްވާ."))
          if (!values.email) v.add("email", tr("The email field is required.", "އީމެއިލް ލިޔުއްވާ."))
          else if (!isEmail(values.email))
            v.add("email", tr("The email must be a valid email address.", "ރަނގަޅު އީމެއިލް އެޑްރެހެއް ލިޔުއްވާ."))
          else if (TAKEN_EMAILS.includes(values.email.toLowerCase()))
            v.add("email", tr("The email has already been taken.", "މި އީމެއިލް އެޑްރެހުގައި އެކައުންޓެއް އެބައޮތް."))
          if (!/^A\\d{6}$/i.test(idCard))
            v.add(
              "id_card",
              tr("The ID card number must look like A123456.", "ކާޑު ނަންބަރު ލިޔުއްވާނީ A123456 ގެ ގޮތަށް."),
            )
          if (!phone) v.add("phone", tr("The mobile number field is required.", "މޯބައިލް ނަންބަރު ލިޔުއްވާ."))
          if (values.password.length < 8)
            v.add(
              "password",
              tr("The password must be at least 8 characters.", "ޕާސްވޯޑުގައި މަދުވެގެން 8 އަކުރު ހުންނަން ވާނެ."),
            )
          if (values.password !== values.password_confirmation)
            v.add(
              "password_confirmation",
              tr("The password confirmation does not match.", "ޕާސްވޯޑު ދެވަނަ ފަހަރު ލިޔުނީ ތަފާތަށް."),
            )
          if (!values.terms) v.add("terms", tr("You must accept the terms.", "ޝަރުތުތަކަށް އެއްބަސްވާން ޖެހޭނެ."))
          v.throwIfFailed(tr("The given data was invalid.", "ދީފައިވާ މައުލޫމާތު ރަނގަޅެއް ނޫން."))

          toast.success(tr("Account created", "އެކައުންޓް ހެދިއްޖެ"), {
            description: tr("Check your email to verify it.", "އީމެއިލް ޗެކްކޮށް ވެރިފައި ކުރައްވާ."),
          })
          navigate(\`\${routes.auth.accountLocked}?state=verify&email=\${encodeURIComponent(values.email)}\`)
        }}
      />
    </AuthShell>
  )
}
`;export{e as default};