---
title: SiteFooter
sidebar_position: 9
---

The footer for portals and public pages: brand and description, link columns, social links, a copyright line, legal links and a slot for a [`LanguageSwitcher`](./language-switcher). Columns reflow by the footer's own width (container queries): two columns on phones, four on wide screens.

```tsx
import { LanguageSwitcher, Logo, SiteFooter } from "@javaabu/onu"

;<SiteFooter
  logo={<Logo src="/logo.svg" alt="Javaabu" text="Javaabu" />}
  description="Software for government and businesses in the Maldives."
  name="Javaabu Pvt Ltd"
  columns={[
    { title: "Services", links: [{ label: "Websites", href: "/websites" }] },
    { title: "Company", links: [{ label: "About", href: "/about" }] },
  ]}
  social={[{ label: "Email", href: "mailto:hello@javaabu.com", icon: "mail" }]}
  legalLinks={[{ label: "Privacy", href: "/privacy" }]}
  languageSwitcher={<LanguageSwitcher size="sm" onChange={setLocale} />}
/>
```

The default copyright line is "© {year} {name}. All rights reserved." in the active language.

## Props

| Prop               | Type                                                            | Default      | Description                               |
| ------------------ | --------------------------------------------------------------- | ------------ | ----------------------------------------- |
| `logo`             | `ReactNode`                                                     |              | Brand                                     |
| `description`      | `ReactNode`                                                     |              | Text under the brand                      |
| `columns`          | `{ title, links: { label, href, external? }[] }[]`              |              | Link columns                              |
| `social`           | `{ label, href, icon }[]`                                       |              | Icon links (label is the accessible name) |
| `name`             | `string`                                                        |              | Organisation name for the copyright line  |
| `copyright`        | `ReactNode`                                                     |              | Replaces the copyright line               |
| `year`             | `number`                                                        | current year | Year in the copyright line                |
| `legalLinks`       | `FooterLink[]`                                                  |              | Bottom-bar links                          |
| `languageSwitcher` | `ReactNode`                                                     |              | Slot in the bottom bar                    |
| `classNames`       | `{ brand, columns, column, columnTitle, link, social, bottom }` |              | Classes for each part                     |

Extra `children` render between the columns and the bottom bar.

## Accessibility

- Rendered as `<footer>` (`contentinfo`). Each column is a `navigation` landmark labelled by its heading.
- Social links are icon buttons with an accessible name; external links open in a new tab with `rel="noopener noreferrer"`.
- Links are 44px tall on touch screens.

| Key            | Action             |
| -------------- | ------------------ |
| <kbd>Tab</kbd> | Move between links |

## RTL

Columns and the bottom bar mirror. Use brand icons from Iconify or FontAwesome brands for social links.
