import {
  Badge,
  Form,
  FormContainer,
  FormField,
  FormGroup,
  LinkButton,
  SubmitButton,
  TextInput,
  Textarea,
} from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"

export const meta = {
  title: "Form container",
  group: "Form scaffolding",
  order: 9,
  description: "A card layout for forms with a header, body and footer; buttons stack on narrow containers.",
}

export default function FormContainerDemo() {
  return (
    <DemoPage>
      <DemoSection title="Card" className="grid">
        <Form onSubmit={() => new Promise((r) => setTimeout(r, 1000))}>
          <FormContainer
            title="New staff member"
            description="They’ll receive an email invitation to set a password."
            actions={<Badge variant="secondary">Draft</Badge>}
            footer={
              <>
                <LinkButton href="#/components/form-scaffolding/form-container" variant="outline">
                  Cancel
                </LinkButton>
                <SubmitButton startIcon="send">Send invitation</SubmitButton>
              </>
            }
          >
            <FormGroup columns={2}>
              <FormField label="Full name" name="name" required>
                <TextInput defaultValue="Hawwa Nashidha" />
              </FormField>
              <FormField label="Email" name="email" required>
                <TextInput type="email" dir="ltr" defaultValue="nashidha@health.gov.mv" />
              </FormField>
              <FormField label="Note" name="note" className="col-span-full">
                <Textarea placeholder="Optional message" />
              </FormField>
            </FormGroup>
          </FormContainer>
        </Form>
      </DemoSection>

      <DemoSection title="In a narrow column" description="The footer stacks full width." className="grid">
        <div className="max-w-xs w-full">
          <FormContainer
            title="Change password"
            width="full"
            footer={<SubmitButton form="pw">Update password</SubmitButton>}
          >
            <form id="pw" className="gap-4 grid" onSubmit={(e) => e.preventDefault()}>
              <FormField label="New password">
                <TextInput type="password" dir="ltr" />
              </FormField>
            </form>
          </FormContainer>
        </div>
      </DemoSection>

      <DemoSection title="Plain variant" className="grid">
        <FormContainer
          variant="plain"
          width="md"
          title="ދިވެހި ފޯމު"
          description="ތިރީގައިވާ މަޢުލޫމާތު ފުރިހަމަކުރައްވާ."
        >
          <FormField label="ނަން">
            <TextInput thaana />
          </FormField>
        </FormContainer>
      </DemoSection>
    </DemoPage>
  )
}
