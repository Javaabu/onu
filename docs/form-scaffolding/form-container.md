# FormContainer

A card-style layout for a form: a header (title, description, actions), the body and a footer for the buttons. It responds to its own width, so it works on a full page, in a dialog or in a narrow column. On narrow containers the footer buttons stack full width with the primary action on top.

```tsx
import { Form, FormContainer, FormField, SubmitButton, LinkButton, TextInput } from "@javaabu/onu"

;<Form onSubmit={save}>
  <FormContainer
    title="New staff member"
    description="They’ll get an email invitation."
    footer={
      <>
        <LinkButton href="/staff" variant="outline">
          Cancel
        </LinkButton>
        <SubmitButton>Invite</SubmitButton>
      </>
    }
  >
    <FormField label="Email" name="email">
      <TextInput type="email" />
    </FormField>
  </FormContainer>
</Form>
```

Wrap the container in the `Form` (as above) so footer buttons submit it, or give the buttons a `form="id"` attribute.

## Props

| Prop           | Type                                                       | Default | Description                            |
| -------------- | ---------------------------------------------------------- | ------- | -------------------------------------- |
| `title`        | `ReactNode`                                                |         | Heading; also names the region         |
| `description`  | `ReactNode`                                                |         | Text under the title                   |
| `headingLevel` | `1 \| 2 \| 3 \| 4`                                         | `2`     | Heading level                          |
| `actions`      | `ReactNode`                                                |         | Beside the title (status badge, links) |
| `media`        | `ReactNode`                                                |         | Above the title (logo)                 |
| `footer`       | `ReactNode`                                                |         | Buttons                                |
| `variant`      | `'card' \| 'plain'`                                        | `card`  | Card surface or none                   |
| `width`        | `'sm' \| 'md' \| 'lg' \| 'xl' \| 'full'`                   | `lg`    | Maximum width                          |
| `centered`     | `boolean`                                                  | `false` | Centre the header (auth pages)         |
| `classNames`   | `{ header, title, description, actions, content, footer }` |         | Classes for each part                  |

`formContainerVariants` is exported.

## Accessibility

Renders a `<section>` labelled by its title, with a real heading. The footer order puts the primary button last in the DOM (first visually when stacked), matching reading order on wide screens.
