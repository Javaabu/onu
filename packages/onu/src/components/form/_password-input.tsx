"use client"

import * as React from "react"

import { Icon } from "../../icons/icon"
import { useTranslation } from "../../providers/onu-provider"
import { TextInput, type TextInputProps } from "../inputs/text-input"
import { registerEnglish } from "../../i18n/english"
import { auth as en_auth } from "../../locales/en/auth"

registerEnglish({ auth: en_auth })

/** Password field with a show/hide toggle, used by the auth forms. Latin only, so no `thaana`. */
export function PasswordField(props: Omit<TextInputProps, "type" | "thaana">) {
  const { t } = useTranslation()
  const [visible, setVisible] = React.useState(false)
  return (
    <TextInput
      {...props}
      type={visible ? "text" : "password"}
      dir="ltr"
      spellCheck={false}
      endAddon={
        <button
          type="button"
          aria-pressed={visible}
          aria-label={t(visible ? "auth.hidePassword" : "auth.showPassword")}
          title={t(visible ? "auth.hidePassword" : "auth.showPassword")}
          onClick={() => setVisible((v) => !v)}
          className="size-7 touch:size-11 -me-1.5 grid place-items-center rounded-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <Icon name={visible ? "eye-off" : "eye"} className="size-4" />
        </button>
      }
    />
  )
}
