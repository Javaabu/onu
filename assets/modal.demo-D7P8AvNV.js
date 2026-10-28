var e=`import * as React from "react"
import {
  Button,
  FormField,
  Modal,
  ModalBody,
  ModalClose,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalRoot,
  ModalTitle,
  ModalTrigger,
  TextInput,
  Textarea,
  type ModalSize,
} from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"

export const meta = {
  title: "Modal",
  group: "Overlays",
  order: 1,
  description: "Dialog with a simple title/description/footer API. Bottom sheet or full screen on phones.",
}

const sizes: ModalSize[] = ["sm", "md", "lg", "xl", "full"]

export default function ModalDemo() {
  const [open, setOpen] = React.useState(false)
  return (
    <DemoPage>
      <DemoSection title="Simple API" description="Focus moves into the modal and returns to the button on close.">
        <Modal
          trigger={<Button>Edit staff member</Button>}
          title="Edit staff member"
          description="Changes are visible to the HR team straight away."
          footer={
            <>
              <ModalClose asChild>
                <Button variant="outline">Cancel</Button>
              </ModalClose>
              <ModalClose asChild>
                <Button>Save changes</Button>
              </ModalClose>
            </>
          }
        >
          <div className="gap-4 grid">
            <FormField label="Full name" required>
              <TextInput defaultValue="Aishath Ali" />
            </FormField>
            <FormField label="ނަން">
              <TextInput thaana defaultValue="އައިޝަތު ޢަލީ" />
            </FormField>
            <FormField label="Island">
              <TextInput defaultValue="Hulhumalé" />
            </FormField>
          </div>
        </Modal>
      </DemoSection>

      <DemoSection title="Sizes">
        {sizes.map((size) => (
          <Modal
            key={size}
            size={size}
            trigger={<Button variant="outline">{size}</Button>}
            title={\`Size \${size}\`}
            description="Resize the window to see the phone presentation."
          >
            <p className="text-muted-foreground">Modal body content.</p>
          </Modal>
        ))}
      </DemoSection>

      <DemoSection
        title="On phones"
        description="Below 640px: bottom sheet (default), full screen, or a centred dialog."
      >
        <Modal mobile="sheet" trigger={<Button variant="outline">Sheet</Button>} title="Bottom sheet on phones">
          <p>Slides up from the bottom on phones.</p>
        </Modal>
        <Modal
          mobile="fullscreen"
          trigger={<Button variant="outline">Full screen</Button>}
          title="Full screen on phones"
          footer={<Button>Submit application</Button>}
        >
          <Textarea thaana placeholder="ސަބަބު ލިޔުއްވާ" />
        </Modal>
        <Modal mobile="dialog" trigger={<Button variant="outline">Dialog</Button>} title="Centred on phones too">
          <p>Stays a small centred dialog.</p>
        </Modal>
      </DemoSection>

      <DemoSection title="Long content" description="The body scrolls; header and footer stay put.">
        <Modal
          trigger={<Button variant="outline">Terms and conditions</Button>}
          title="Terms and conditions"
          footer={<Button>I agree</Button>}
        >
          {Array.from({ length: 30 }, (_, i) => (
            <p key={i} className="mb-3">
              {i + 1}. Licence holders operating in Malé must renew their permit with the Ministry before the expiry
              date shown on the certificate.
            </p>
          ))}
        </Modal>
      </DemoSection>

      <DemoSection title="Controlled and composable">
        <Button variant="secondary" onClick={() => setOpen(true)}>
          Open controlled modal
        </Button>
        <Modal open={open} onOpenChange={setOpen} title="Controlled" hideTitle>
          <p>This modal has a visually hidden title (still read by screen readers).</p>
        </Modal>
        <ModalRoot>
          <ModalTrigger asChild>
            <Button variant="ghost">Composed from parts</Button>
          </ModalTrigger>
          <ModalContent size="sm">
            <ModalHeader>
              <ModalTitle>Transfer MVR 1,250.00</ModalTitle>
              <ModalDescription>To Mohamed Naseem (BML 7730000123456).</ModalDescription>
            </ModalHeader>
            <ModalBody>Transfers made after 2 PM are processed the next working day.</ModalBody>
            <ModalFooter>
              <ModalClose asChild>
                <Button variant="outline">Cancel</Button>
              </ModalClose>
              <Button>Transfer</Button>
            </ModalFooter>
          </ModalContent>
        </ModalRoot>
      </DemoSection>
    </DemoPage>
  )
}
`;export{e as default};