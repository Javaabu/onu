var e=`import { AccountSwitcher, Button, Icon, type Account } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"

export const meta = {
  title: "Account switcher",
  group: "Choice inputs",
  order: 16,
  description: "Switch between your own account, organisations and accounts delegated to you.",
}

const accounts: Account[] = [
  { id: "me", name: "Aishath Shifa", description: "A123456", type: "personal" },
  { id: "javaabu", name: "Javaabu Pvt Ltd", description: "C-0412/2014", type: "organisation" },
  { id: "mcc", name: "Malé City Council", description: "Government", type: "organisation" },
  { id: "sports-club", name: "Hulhumalé Sports Club", description: "Association", type: "organisation" },
  { id: "father", name: "Ahmed Rasheed", description: "Delegated to you", type: "delegated" },
  { id: "mother", name: "Mariyam Nisha", description: "Delegated to you", type: "delegated" },
  { id: "expired", name: "Hassan Ali", description: "Delegation expired", type: "delegated", disabled: true },
]

export default function AccountSwitcherDemo() {
  return (
    <DemoPage>
      <DemoSection title="Searchable (many accounts)" className="max-w-xs gap-4 grid w-full">
        <AccountSwitcher
          accounts={accounts}
          defaultValue="me"
          footer={
            <Button variant="ghost" size="sm" className="w-full justify-start">
              <Icon name="settings" />
              Manage delegations
            </Button>
          }
        />
      </DemoSection>
      <DemoSection title="Menu (few accounts)" className="max-w-xs gap-4 grid w-full">
        <AccountSwitcher accounts={accounts.slice(0, 3)} defaultValue="javaabu" size="lg" />
        <AccountSwitcher
          accounts={[
            { id: "1", name: "އައިޝަތު ޝިފާ", description: "A123456" },
            { id: "2", name: "ޖާވާބު", type: "organisation" },
          ]}
        />
      </DemoSection>
    </DemoPage>
  )
}
`;export{e as default};