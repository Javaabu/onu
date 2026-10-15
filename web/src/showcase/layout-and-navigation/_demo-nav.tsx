import * as React from "react"
import { OnuProvider, cn, useOnu, type NavGroup, type NavItem } from "@javaabu/onu"

// Showcase helper: links inside a demo update a local "current page" instead of
// navigating the showcase router.
const NavigateContext = React.createContext<(href: string) => void>(() => {})

const DemoLink = React.forwardRef<HTMLAnchorElement, React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }>(
  function DemoLink({ href, onClick, children, ...props }, ref) {
    const navigate = React.useContext(NavigateContext)
    return (
      <a
        ref={ref}
        href={href}
        onClick={(event) => {
          onClick?.(event)
          if (event.defaultPrevented || /^(https?:|mailto:|tel:)/.test(href)) return
          event.preventDefault()
          navigate(href)
        }}
        {...props}
      >
        {children}
      </a>
    )
  },
)

/** Renders children with a local current href; links in it only update that href. */
export function DemoNav({
  initial = "/",
  children,
}: {
  initial?: string
  children: (current: string, navigate: (href: string) => void) => React.ReactNode
}) {
  const onu = useOnu()
  const [current, setCurrent] = React.useState(initial)
  return (
    <NavigateContext.Provider value={setCurrent}>
      <OnuProvider
        locale={onu.locale}
        dir={onu.dir}
        density={onu.density}
        labelLayout={onu.labelLayout}
        linkComponent={DemoLink}
        syncDocument={false}
      >
        {children(current, setCurrent)}
      </OnuProvider>
    </NavigateContext.Provider>
  )
}

/** A bordered frame that contains `fixed` children (sidebars, bottom bars) for demos. */
export function DemoFrame({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        "relative w-full [transform:translateZ(0)] overflow-hidden rounded-xl border bg-background",
        className,
      )}
    >
      {children}
    </div>
  )
}

export function useDhivehi() {
  return useOnu().locale.code === "dv"
}

export function adminGroups(dv: boolean): NavGroup[] {
  return [
    {
      label: dv ? "މައި" : "Main",
      items: [
        { label: dv ? "ޑޭޝްބޯޑް" : "Dashboard", href: "/", icon: "home" },
        { label: dv ? "އެޕްލިކޭޝަންތައް" : "Applications", href: "/applications", icon: "file-text", badge: 12 },
        {
          label: dv ? "މެމްބަރުން" : "Users",
          href: "/users",
          icon: "users",
          items: [
            { label: dv ? "ހުރިހާ މެމްބަރުން" : "All users", href: "/users/all" },
            { label: dv ? "ދައުވަތު" : "Invitations", href: "/users/invitations", badge: 3 },
            { label: dv ? "ރޯލްތައް" : "Roles", href: "/users/roles" },
          ],
        },
        { label: dv ? "ފައިސާ" : "Payments", href: "/payments", icon: "credit-card" },
        { label: dv ? "ރިޕޯޓްތައް" : "Reports", href: "/reports", icon: "table" },
      ],
    },
    {
      label: dv ? "ސިސްޓަމް" : "System",
      items: [
        { label: dv ? "ސެޓިންގްސް" : "Settings", href: "/settings", icon: "settings" },
        { label: dv ? "އެހީ" : "Help", href: "https://javaabu.com", icon: "help", external: true },
      ],
    },
  ]
}

export function portalItems(dv: boolean): NavItem[] {
  return [
    { label: dv ? "ފުރަތަމަ ސަފްޙާ" : "Home", href: "/" },
    {
      label: dv ? "ޚިދުމަތްތައް" : "Services",
      items: [
        {
          label: dv ? "ދިވެހި ކާޑު" : "ID cards",
          href: "/services/id",
          description: dv ? "އައު ކާޑު ހެދުމާއި އާކުރުން" : "Apply for or renew an ID card",
          icon: "user",
        },
        {
          label: dv ? "ޕާސްޕޯޓް" : "Passports",
          href: "/services/passports",
          description: dv ? "ޕާސްޕޯޓް އާކުރުން" : "Renew a Maldivian passport",
          icon: "globe",
        },
        {
          label: dv ? "ބިމުގެ ހުއްދަ" : "Land permits",
          href: "/services/land",
          description: dv ? "ބިމާ ބެހޭ ހުއްދަތައް" : "Building and land use permits",
          icon: "map-pin",
        },
      ],
    },
    { label: dv ? "ޚަބަރު" : "News", href: "/news", badge: 2 },
    { label: dv ? "ގުޅުއްވާ" : "Contact", href: "/contact" },
  ]
}
