import * as React from "react"
import { Button, ButtonGroup, ButtonGroupSeparator, LinkButton, SubmitButton } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"

export const meta = {
  title: "Buttons",
  group: "Form scaffolding",
  order: 17,
  description: "Button (loading, icons, success/warning), submit button, link button and button group.",
}

const variants = ["default", "secondary", "outline", "ghost", "link", "destructive", "success", "warning"] as const
const sizes = ["xs", "sm", "default", "lg"] as const

export default function ButtonDemo() {
  const [loading, setLoading] = React.useState(false)
  const [processing, setProcessing] = React.useState(false)
  return (
    <DemoPage>
      <DemoSection title="Variants">
        {variants.map((v) => (
          <Button key={v} variant={v}>
            {v}
          </Button>
        ))}
      </DemoSection>

      <DemoSection title="Sizes and icon buttons" className="items-center">
        {sizes.map((s) => (
          <Button key={s} size={s} startIcon="add">
            {s}
          </Button>
        ))}
        <Button size="icon" variant="outline" aria-label="Edit" startIcon="edit" />
        <Button size="icon-sm" variant="ghost" aria-label="Delete" startIcon="trash" />
      </DemoSection>

      <DemoSection title="Icons" description="Directional icons mirror in RTL.">
        <Button startIcon="back" variant="outline">
          Back
        </Button>
        <Button endIcon="arrow-right">Next</Button>
        <Button variant="success" startIcon="check">
          Approve
        </Button>
        <Button variant="warning" startIcon="warning">
          Suspend
        </Button>
        <Button variant="destructive" startIcon="trash">
          Delete
        </Button>
        <Button startIcon="save" lang="dv">
          ސޭވްކުރޭ
        </Button>
      </DemoSection>

      <DemoSection title="Loading and disabled">
        <Button
          loading={loading}
          loadingText="Saving…"
          startIcon="save"
          onClick={() => {
            setLoading(true)
            setTimeout(() => setLoading(false), 1500)
          }}
        >
          Click to save
        </Button>
        <Button loading variant="outline">
          Loading
        </Button>
        <Button disabled>Disabled</Button>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            setProcessing(true)
            setTimeout(() => setProcessing(false), 1500)
          }}
        >
          <SubmitButton processing={processing} startIcon="send">
            Submit
          </SubmitButton>
        </form>
      </DemoSection>

      <DemoSection title="Link buttons">
        <LinkButton href="#/components/form-scaffolding/form" startIcon="add">
          New application
        </LinkButton>
        <LinkButton href="#/components/form-scaffolding/form" variant="outline" startIcon="back">
          All applications
        </LinkButton>
        <LinkButton href="https://www.gov.mv" external variant="link">
          gov.mv
        </LinkButton>
        <LinkButton href="#" disabled variant="secondary">
          Disabled link
        </LinkButton>
      </DemoSection>

      <DemoSection title="Button groups" className="gap-4 grid">
        <ButtonGroup label="View">
          <Button variant="outline" startIcon="list">
            List
          </Button>
          <Button variant="outline" startIcon="grid">
            Grid
          </Button>
          <Button variant="outline" startIcon="kanban">
            Board
          </Button>
        </ButtonGroup>
        <ButtonGroup label="History">
          <Button variant="outline" size="icon" aria-label="Undo" startIcon="undo" />
          <ButtonGroupSeparator />
          <Button variant="outline" size="icon" aria-label="Redo" startIcon="redo" />
        </ButtonGroup>
        <ButtonGroup attached={false}>
          <Button variant="outline">Cancel</Button>
          <Button>Save</Button>
        </ButtonGroup>
        <ButtonGroup orientation="vertical" label="Zoom">
          <Button variant="outline" size="icon" aria-label="Zoom in" startIcon="zoom-in" />
          <Button variant="outline" size="icon" aria-label="Zoom out" startIcon="zoom-out" />
        </ButtonGroup>
      </DemoSection>
    </DemoPage>
  )
}
