var e=`import { useNavigate, useSearchParams } from "react-router"
import { ResetPasswordForm, toast } from "@javaabu/onu"

import { useTr } from "../_shared/i18n"
import { routes } from "../_shared/routes"
import { AuthShell } from "../_shared/shells"
import { DEMO_EMAIL, Validator, wait } from "./_data"

export const meta = { title: "Reset password", group: "Auth", layout: "bare", order: 4 }

const COMMON = ["password", "password1", "12345678", "maldives1", "qwerty123"]

export default function ResetPasswordPage() {
  const tr = useTr()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const email = params.get("email") || DEMO_EMAIL

  return (
    <AuthShell>
      <ResetPasswordForm
        headingLevel={1}
        token="3f9c1e7a52b04d8c"
        emailReadOnly
        defaultValues={{ email }}
        signInHref={routes.auth.signIn}
        formProps={{ noValidate: true }}
        extraFields={
          <p className="text-sm text-muted-foreground">
            {tr(
              "Use at least 8 characters. Avoid common passwords and ones you use elsewhere.",
              "މަދުވެގެން 8 އަކުރު ބޭނުން ކުރައްވާ. އާންމު ޕާސްވޯޑާއި އެހެން ތަންތާނގައި ބޭނުންކުރާ ޕާސްވޯޑު ނުލައްވާ.",
            )}
          </p>
        }
        onSubmit={async ({ password, password_confirmation }) => {
          await wait(800)
          const v = new Validator()
          if (!password) v.add("password", tr("The password field is required.", "ޕާސްވޯޑު ލިޔުއްވާ."))
          else if (password.length < 8)
            v.add(
              "password",
              tr("The password must be at least 8 characters.", "ޕާސްވޯޑުގައި މަދުވެގެން 8 އަކުރު ހުންނަން ވާނެ."),
            )
          else if (COMMON.includes(password.toLowerCase()))
            v.add(
              "password",
              tr(
                "This password has appeared in a data leak. Choose a different one.",
                "މި ޕާސްވޯޑު ލީކުވެފައިވާ ޕާސްވޯޑެއް. އެހެން ޕާސްވޯޑެއް ލައްވާ.",
              ),
            )
          if (password !== password_confirmation)
            v.add(
              "password_confirmation",
              tr("The password confirmation does not match.", "ޕާސްވޯޑު ދެވަނަ ފަހަރު ލިޔުނީ ތަފާތަށް."),
            )
          v.throwIfFailed(tr("The given data was invalid.", "ދީފައިވާ މައުލޫމާތު ރަނގަޅެއް ނޫން."))
          toast.success(tr("Your password has been reset", "ޕާސްވޯޑު ބަދަލުކުރެވިއްޖެ"), {
            description: tr("Sign in with your new password.", "އާ ޕާސްވޯޑުން ސައިން އިން ކުރައްވާ."),
          })
          navigate(routes.auth.signIn)
        }}
      />
    </AuthShell>
  )
}
`;export{e as default};