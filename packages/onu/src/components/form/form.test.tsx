import * as React from "react"
import { act, fireEvent, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useForm } from "react-hook-form"
import { describe, expect, it, vi } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../../test/utils"
import { TextInput } from "../inputs/text-input"
import { Fieldset } from "./fieldset"
import { Form, formDataToObject, useOnuForm } from "./form"
import { FormField } from "./form-field"
import { SubmitButton } from "./submit-button"
import { ValidationError } from "./validation"

function deferred<T = void>() {
  let resolve!: (v: T) => void
  let reject!: (e: unknown) => void
  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}

function Fields() {
  return (
    <>
      <FormField label="Name" name="name">
        <TextInput defaultValue="Aishath" />
      </FormField>
      <FormField label="Email" name="email">
        <TextInput defaultValue="aisha@example.mv" />
      </FormField>
      <SubmitButton>Save</SubmitButton>
    </>
  )
}

describe("Form", () => {
  it("submits FormData values to onSubmit", async () => {
    const onSubmit = vi.fn()
    renderWithOnu(
      <Form onSubmit={onSubmit} aria-label="Profile">
        <Fields />
      </Form>,
    )
    await userEvent.click(screen.getByRole("button", { name: "Save" }))
    expect(onSubmit).toHaveBeenCalledWith({ name: "Aishath", email: "aisha@example.mv" }, expect.anything())
    await expectNoA11yViolations()
  })

  it("shows a spinner, disables fields and blocks double submits while saving (§25.9 Saving)", async () => {
    const d = deferred()
    const onSubmit = vi.fn(() => d.promise)
    const onSuccess = vi.fn()
    renderWithOnu(
      <Form onSubmit={onSubmit} onSuccess={onSuccess}>
        <Fields />
      </Form>,
    )
    const button = screen.getByRole("button", { name: "Save" })
    await userEvent.click(button)
    expect(button).toHaveAttribute("aria-busy", "true")
    expect(screen.getByLabelText("Name")).toBeDisabled()
    expect(document.querySelector("form")).toHaveAttribute("aria-busy", "true")
    await userEvent.click(button)
    fireEvent.submit(document.querySelector("form")!)
    expect(onSubmit).toHaveBeenCalledTimes(1)
    await act(async () => d.resolve())
    expect(button).not.toHaveAttribute("aria-busy")
    expect(onSuccess).toHaveBeenCalled()
    expect(document.querySelector("form")).toHaveAttribute("data-status", "success")
  })

  it("on a 422 shows errors under fields, focuses the first invalid one and summarises (§25.9 On error)", async () => {
    const onError = vi.fn()
    renderWithOnu(
      <Form
        onSubmit={() => {
          throw {
            response: { status: 422, data: { message: "Invalid", errors: { email: ["Email is already taken"] } } },
          }
        }}
        onError={onError}
      >
        <Fields />
      </Form>,
    )
    await userEvent.click(screen.getByRole("button", { name: "Save" }))
    const email = screen.getByLabelText("Email")
    await waitFor(() => expect(email).toHaveFocus())
    expect(email).toHaveAttribute("aria-invalid", "true")
    expect(email).toHaveAccessibleDescription("Email is already taken")
    const summary = screen.getByRole("alert")
    expect(summary).toHaveTextContent("There is 1 problem with this form")
    expect(summary).toHaveTextContent("Fix the highlighted fields and try again.")
    expect(onError).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ message: "Invalid" }))
    expect(document.querySelector("form")).toHaveAttribute("data-status", "error")
    await expectNoA11yViolations()
  })

  it("clears a field's server error when it is edited", async () => {
    renderWithOnu(
      <Form
        onSubmit={() => {
          throw new ValidationError({ name: "Too short", email: "Taken" })
        }}
      >
        <Fields />
      </Form>,
    )
    await userEvent.click(screen.getByRole("button", { name: "Save" }))
    await waitFor(() => expect(screen.getByLabelText("Name")).toHaveFocus())
    await userEvent.type(screen.getByLabelText("Name"), "x")
    expect(screen.queryByText("Too short")).not.toBeInTheDocument()
    expect(screen.getAllByText("Taken").length).toBeGreaterThan(0)
    await userEvent.type(screen.getByLabelText("Email"), "x")
    expect(screen.queryByRole("alert")).not.toBeInTheDocument()
  })

  it("shows a general message and focuses the summary for other errors", async () => {
    renderWithOnu(
      <Form
        onSubmit={async () => {
          throw new Error("500")
        }}
      >
        <Fields />
      </Form>,
    )
    await userEvent.click(screen.getByRole("button", { name: "Save" }))
    const summary = await screen.findByRole("alert")
    expect(summary).toHaveTextContent("The form could not be submitted.")
    await waitFor(() => expect(summary).toHaveFocus())
  })

  it("reads a fetch Response with status 422", async () => {
    const response = new Response(JSON.stringify({ message: "x", errors: { name: ["Required"] } }), { status: 422 })
    renderWithOnu(
      <Form
        onSubmit={async () => {
          throw response
        }}
      >
        <Fields />
      </Form>,
    )
    await userEvent.click(screen.getByRole("button", { name: "Save" }))
    expect(await screen.findAllByText("Required")).not.toHaveLength(0)
  })

  it("accepts controlled errors and processing (Inertia) and focuses on new errors", async () => {
    const { rerender } = renderWithOnu(
      <Form processing>
        <Fields />
      </Form>,
    )
    expect(screen.getByRole("button", { name: "Save" })).toHaveAttribute("aria-busy", "true")
    rerender(
      <Form errors={{ email: "Taken" }}>
        <Fields />
      </Form>,
    )
    await waitFor(() => expect(screen.getByLabelText("Email")).toHaveFocus())
  })

  it("submits natively without onSubmit and can hide the summary", () => {
    const native = vi.fn((e: Event) => e.preventDefault())
    renderWithOnu(
      <Form summary={false} errors={{ name: "Bad" }} focusOnError={false} labelLayout="inline">
        <Fields />
      </Form>,
    )
    const form = document.querySelector("form")!
    form.addEventListener("submit", native)
    fireEvent.submit(form)
    expect(native).toHaveBeenCalled()
    expect(screen.queryByRole("alert")).not.toBeInTheDocument()
    expect(screen.getByLabelText("Name")).not.toHaveFocus()
    expect(document.querySelector("[data-slot=form-field]")).toHaveAttribute("data-label-layout", "inline")
  })

  it("opens a collapsed fieldset to focus an invalid field inside", async () => {
    renderWithOnu(
      <Form errors={{ phone: "Required" }}>
        <Fieldset legend="Contact" collapsible defaultOpen={false}>
          <FormField label="Phone" name="phone">
            <TextInput />
          </FormField>
        </Fieldset>
      </Form>,
    )
    await waitFor(() => expect(screen.getByLabelText("Phone")).toHaveFocus())
    expect(screen.getByRole("button", { name: "Contact" })).toHaveAttribute("aria-expanded", "true")
  })

  it("setErrors from context shows errors", async () => {
    function Probe() {
      const form = useOnuForm()
      return (
        <button type="button" onClick={() => form?.setErrors({ name: ["Server says no"] }, "Nope")}>
          fail
        </button>
      )
    }
    renderWithOnu(
      <Form>
        <Fields />
        <Probe />
      </Form>,
    )
    await userEvent.click(screen.getByRole("button", { name: "fail" }))
    expect(screen.getAllByText("Server says no").length).toBeGreaterThan(0)
    expect(screen.getByRole("alert")).toHaveTextContent("Nope")
  })

  it("forwards refs and className", () => {
    const ref = React.createRef<HTMLFormElement>()
    const cb = vi.fn()
    renderWithOnu(
      <>
        <Form ref={ref} className="custom" />
        <Form ref={cb} />
      </>,
    )
    expect(ref.current).toHaveClass("custom")
    expect(cb).toHaveBeenCalledWith(expect.any(HTMLFormElement))
  })

  it.each(directions)("renders the summary in Dhivehi (%s)", async (dir) => {
    renderWithOnu(
      <Form errors={{ name: ["ނަން ލިޔުއްވާ", "ދިގުކުރައްވާ"] }} focusOnError={false}>
        <Fields />
      </Form>,
      { locale: "dv", dir },
    )
    expect(screen.getByRole("alert")).toHaveTextContent("މި ފޯމުގައި 2 މައްސަލަ ވޭ")
    await expectNoA11yViolations()
  })
})

describe("Form with react-hook-form", () => {
  function RhfForm({ onSubmit }: { onSubmit: (v: { title: string }) => unknown }) {
    const form = useForm<{ title: string }>({ defaultValues: { title: "" } })
    return (
      <Form form={form} onSubmit={onSubmit}>
        <FormField label="Title" name="title">
          <TextInput {...form.register("title", { required: "Title is required" })} />
        </FormField>
        <SubmitButton>Save</SubmitButton>
      </Form>
    )
  }

  it("shows client validation errors from react-hook-form in fields and the summary", async () => {
    const onSubmit = vi.fn()
    renderWithOnu(<RhfForm onSubmit={onSubmit} />)
    await userEvent.click(screen.getByRole("button", { name: "Save" }))
    expect(await screen.findByRole("alert")).toHaveTextContent("Title is required")
    expect(screen.getByLabelText("Title")).toHaveAttribute("aria-invalid", "true")
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it("passes values and maps server errors with setError", async () => {
    const onSubmit = vi.fn(async () => {
      throw { errors: { title: ["The title has already been taken."] } }
    })
    renderWithOnu(<RhfForm onSubmit={onSubmit} />)
    await userEvent.type(screen.getByLabelText("Title"), "Male’ City")
    await userEvent.click(screen.getByRole("button", { name: "Save" }))
    expect(onSubmit).toHaveBeenCalledWith({ title: "Male’ City" }, expect.anything())
    expect(await screen.findAllByText("The title has already been taken.")).not.toHaveLength(0)
    await waitFor(() => expect(screen.getByLabelText("Title")).toHaveFocus())
  })
})

describe("formDataToObject", () => {
  it("collects repeated names into arrays", () => {
    const data = new FormData()
    data.append("tags[]", "a")
    data.append("tags[]", "b")
    data.append("tags[]", "c")
    data.append("name", "x")
    expect(formDataToObject(data)).toEqual({ "tags[]": ["a", "b", "c"], name: "x" })
  })
})
