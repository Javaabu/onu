"use client"

import * as React from "react"
import { Command as CommandPrimitive } from "cmdk"

import { Icon } from "../../icons/icon"
import { cn } from "../../lib/utils"
import { useTranslation } from "../../providers/onu-provider"
import { useThaanaField, type ThaanaProp } from "../../thaana/use-thaana-field"
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar"
import { Command, CommandGroup, CommandItem, CommandList } from "../../ui/command"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu"
import { useControllableState } from "./_hooks"
import { Picker, PickerContent, PickerTrigger } from "./_picker"
import { useOpenState } from "./_selection"
import { matchesQuery } from "./options"

export type AccountType = "personal" | "organisation" | "delegated"

export interface Account {
  id: string
  name: string
  /** Secondary line: email, ID card number, role, "Delegated by …". */
  description?: string
  /** Avatar image URL. Initials are shown without it. */
  avatar?: string
  /** Groups the list. Default `personal`. */
  type?: AccountType
  disabled?: boolean
}

export interface AccountSwitcherProps extends Omit<
  React.ComponentProps<"button">,
  "value" | "defaultValue" | "onChange" | "children"
> {
  accounts: ReadonlyArray<Account>
  /** Id of the active account. */
  value?: string
  defaultValue?: string
  onValueChange?: (id: string, account: Account) => void
  /** Show a search field. `auto` (default) shows it for more than 5 accounts. */
  searchable?: boolean | "auto"
  /** Type Thaana in the search field. */
  thaana?: ThaanaProp
  /** Extra content below the list, e.g. a "Manage delegations" link. */
  footer?: React.ReactNode
  /** `lg` for a roomier trigger (sidebars, portals). */
  size?: "default" | "lg"
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /** Bottom sheet on phones (searchable mode). Default `true`. */
  sheet?: boolean
  classNames?: { trigger?: string; content?: string; item?: string; avatar?: string }
}

const GROUPS: { type: AccountType; key: string }[] = [
  { type: "personal", key: "choice.personalAccount" },
  { type: "organisation", key: "choice.organisations" },
  { type: "delegated", key: "choice.delegatedAccounts" },
]

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  const letters = parts.length > 1 ? [parts[0]![0], parts[parts.length - 1]![0]] : [parts[0]?.[0]]
  return letters.filter(Boolean).join("").toLocaleUpperCase()
}

function AccountAvatar({ account, className }: { account: Account; className?: string }) {
  return (
    <Avatar className={cn("size-8", className)} data-slot="account-avatar" aria-hidden="true">
      {account.avatar ? <AvatarImage src={account.avatar} alt="" /> : null}
      <AvatarFallback className={cn(account.type === "organisation" && "rounded-md")}>
        {account.type === "organisation" && !account.avatar ? (
          <Icon name="building" className="size-4" />
        ) : (
          initials(account.name)
        )}
      </AvatarFallback>
    </Avatar>
  )
}

function AccountText({ account }: { account: Account }) {
  return (
    <span className="min-w-0 grid flex-1 text-start">
      <span className="font-medium truncate">{account.name}</span>
      {account.description ? (
        <span className="text-xs truncate text-muted-foreground">{account.description}</span>
      ) : null}
    </span>
  )
}

function SearchInput({
  value,
  onValueChange,
  placeholder,
  thaana,
}: {
  value: string
  onValueChange: (v: string) => void
  placeholder: string
  thaana?: ThaanaProp
}) {
  const ref = React.useRef<HTMLInputElement>(null)
  const { fieldProps } = useThaanaField(ref, thaana)
  return (
    <div className="p-1 pb-0">
      <div className="h-8 gap-2 px-2 touch:h-11 flex items-center rounded-lg border border-input/30 bg-input/30">
        <Icon name="search" className="size-4 shrink-0 opacity-50" />
        <CommandPrimitive.Input
          ref={ref}
          value={value}
          onValueChange={onValueChange}
          placeholder={placeholder}
          className="min-w-0 text-sm h-full flex-1 bg-transparent outline-hidden placeholder:text-muted-foreground"
          {...fieldProps}
        />
      </div>
    </div>
  )
}

/**
 * Switch between your own account and accounts you act for (organisations,
 * delegated individuals). Shows the active account with its avatar; the list
 * is grouped, searchable for long lists, and marks the current account.
 */
export function AccountSwitcher({
  accounts,
  value: valueProp,
  defaultValue,
  onValueChange,
  searchable = "auto",
  thaana,
  footer,
  size = "default",
  open: openProp,
  defaultOpen,
  onOpenChange,
  sheet,
  className,
  classNames,
  ...props
}: AccountSwitcherProps) {
  const { t, locale } = useTranslation()
  const [value, setValue] = useControllableState<string, [Account]>(
    valueProp,
    defaultValue ?? accounts[0]?.id ?? "",
    onValueChange,
  )
  const [open, setOpen] = useOpenState(openProp, defaultOpen, onOpenChange)
  const [query, setQuery] = React.useState("")
  const current = accounts.find((a) => a.id === value) ?? accounts[0]
  const withSearch = searchable === "auto" ? accounts.length > 5 : searchable

  const grouped = GROUPS.map((g) => ({
    ...g,
    accounts: accounts.filter(
      (a) =>
        (a.type ?? "personal") === g.type &&
        (!query || matchesQuery(a.name, query, locale.code) || matchesQuery(a.description ?? "", query, locale.code)),
    ),
  })).filter((g) => g.accounts.length > 0)

  const choose = (account: Account) => {
    if (account.id !== value) setValue(account.id, account)
    setOpen(false)
    setQuery("")
  }

  const trigger = (
    <button
      type="button"
      data-slot="account-switcher"
      data-size={size}
      aria-label={current ? `${t("choice.switchAccount")}: ${current.name}` : undefined}
      {...props}
      className={cn(
        "gap-2.5 p-1.5 pe-2.5 text-sm min-w-0 touch:min-h-11 data-[size=lg]:p-2 flex w-full items-center rounded-lg text-start outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 aria-expanded:bg-muted",
        classNames?.trigger,
        className,
      )}
    >
      {current ? (
        <>
          <AccountAvatar account={current} className={cn(size === "lg" && "size-10", classNames?.avatar)} />
          <AccountText account={current} />
        </>
      ) : (
        <span className="flex-1">{t("choice.switchAccount")}</span>
      )}
      <Icon name="chevrons-up-down" className="size-4 shrink-0 text-muted-foreground" />
    </button>
  )

  if (!withSearch) {
    return (
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
        <DropdownMenuContent className={cn("min-w-64", classNames?.content)}>
          <DropdownMenuRadioGroup
            value={value}
            onValueChange={(id) => {
              const account = accounts.find((a) => a.id === id)
              if (account) choose(account)
            }}
          >
            {grouped.map((g, i) => (
              <React.Fragment key={g.type}>
                {i > 0 ? <DropdownMenuSeparator /> : null}
                <DropdownMenuLabel>{t(g.key)}</DropdownMenuLabel>
                {g.accounts.map((a) => (
                  <DropdownMenuRadioItem
                    key={a.id}
                    value={a.id}
                    disabled={a.disabled}
                    className={cn("gap-2.5 py-1.5 touch:min-h-11", classNames?.item)}
                  >
                    <AccountAvatar account={a} />
                    <AccountText account={a} />
                  </DropdownMenuRadioItem>
                ))}
              </React.Fragment>
            ))}
          </DropdownMenuRadioGroup>
          {footer ? (
            <>
              <DropdownMenuSeparator />
              <div className="p-1">{footer}</div>
            </>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <Picker
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) setQuery("")
      }}
      sheet={sheet}
    >
      <PickerTrigger>{trigger}</PickerTrigger>
      <PickerContent title={t("choice.switchAccount")} className={cn("min-w-72", classNames?.content)}>
        <Command shouldFilter={false} loop label={t("choice.searchAccounts")} className="p-0 bg-transparent">
          <SearchInput
            value={query}
            onValueChange={setQuery}
            placeholder={t("choice.searchAccounts")}
            thaana={thaana}
          />
          <CommandList label={t("choice.switchAccount")} className="p-1 max-h-80">
            {grouped.length === 0 ? (
              <div className="py-6 text-sm text-center text-muted-foreground">{t("choice.noAccounts")}</div>
            ) : null}
            {grouped.map((g) => (
              <CommandGroup key={g.type} heading={t(g.key)}>
                {g.accounts.map((a) => (
                  <CommandItem
                    key={a.id}
                    value={a.id}
                    disabled={a.disabled}
                    data-checked={a.id === value}
                    aria-current={a.id === value || undefined}
                    onSelect={() => choose(a)}
                    className={cn("gap-2.5 touch:min-h-11", classNames?.item)}
                  >
                    <AccountAvatar account={a} />
                    <AccountText account={a} />
                    {a.id === value ? <span className="sr-only">{t("choice.currentAccount")}</span> : null}
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
          {footer ? <div className="p-1 border-t border-border">{footer}</div> : null}
        </Command>
      </PickerContent>
    </Picker>
  )
}
