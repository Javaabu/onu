import { screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { renderWithOnu } from "../../../test/utils"
import { ForgotPasswordForm } from "./forgot-password-form"
import { RegisterForm } from "./register-form"
import { ResetPasswordForm } from "./reset-password-form"
import { SignInForm } from "./sign-in-form"

describe("auth form classNames", () => {
  const classNames = { root: "r", form: "f", status: "st", submit: "su", title: "ti" }

  it.each([
    ["SignInForm", <SignInForm key="1" status="Done" classNames={classNames} />],
    ["RegisterForm", <RegisterForm key="2" status="Done" classNames={classNames} />],
    ["ForgotPasswordForm", <ForgotPasswordForm key="3" status="Done" classNames={classNames} />],
    ["ResetPasswordForm", <ResetPasswordForm key="4" token="t" status="Done" classNames={classNames} />],
  ])("%s applies them to its parts and the card", (_name, form) => {
    const { container } = renderWithOnu(form)
    expect(screen.getByRole("region")).toHaveClass("r")
    expect(container.querySelector("form")).toHaveClass("f")
    expect(screen.getByRole("status")).toHaveClass("st")
    expect(container.querySelector('button[type="submit"]')).toHaveClass("su")
    expect(screen.getByRole("heading")).toHaveClass("ti")
  })
})
