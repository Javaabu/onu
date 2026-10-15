import { Button, Icon, VisuallyHidden } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"

export const meta = {
  title: "Visually hidden",
  group: "Foundations",
  order: 3,
  description: "Text for screen readers only: icon button names, hidden headings and skip links.",
}

export default function VisuallyHiddenDemo() {
  return (
    <DemoPage>
      <DemoSection
        title="Icon buttons"
        description="The icon is decorative; the hidden text names the button."
        className="gap-2 flex"
      >
        <Button variant="outline" size="icon">
          <Icon name="edit" />
          <VisuallyHidden>Edit application</VisuallyHidden>
        </Button>
        <Button variant="outline" size="icon">
          <Icon name="trash" />
          <VisuallyHidden>Delete application</VisuallyHidden>
        </Button>
      </DemoSection>

      <DemoSection
        title="Extra context"
        description="Repeated link text gets a hidden suffix, so “Read more” links can be told apart."
        className="gap-2 text-sm grid"
      >
        <a href="#fees" className="text-primary underline underline-offset-4">
          Read more<VisuallyHidden> about passport fees</VisuallyHidden>
        </a>
        <a href="#renewal" className="text-primary underline underline-offset-4">
          Read more<VisuallyHidden> about renewing a passport</VisuallyHidden>
        </a>
      </DemoSection>

      <DemoSection
        title="Skip link"
        description="With focusable, the content appears while it has keyboard focus. Press Tab inside this preview."
        className="gap-3 grid"
      >
        <VisuallyHidden focusable asChild>
          <a href="#main" className="px-3 py-2 text-sm font-medium w-fit rounded-md bg-primary text-primary-foreground">
            Skip to main content
          </a>
        </VisuallyHidden>
        <p className="text-sm text-muted-foreground">The page content starts here.</p>
      </DemoSection>

      <DemoSection title="Hidden heading" className="gap-3 grid">
        <VisuallyHidden asChild>
          <h3>Search filters</h3>
        </VisuallyHidden>
        <p className="text-sm text-muted-foreground">
          The filters above have a heading for screen-reader navigation, without showing one.
        </p>
      </DemoSection>
    </DemoPage>
  )
}
