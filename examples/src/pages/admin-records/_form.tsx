import * as React from "react"
import {
  EmailInput,
  Fieldset,
  FormField,
  FormGroup,
  NumberInput,
  PhoneInput,
  SearchableSelect,
  Select,
  Textarea,
  TextInput,
  ThaanaInput,
  ValidationError,
} from "@javaabu/onu"

import { useTr } from "../_shared/i18n"
import { SERVICES, useApplications, type Application, type Labels } from "./_data"
import type { Tr } from "./_ui"

export type ApplicationValues = {
  name: string
  nameDv: string
  idCard: string
  phone: string
  email: string
  address: string
  service: string
  island: string
  amount: number | null
  status: string
  assignee: string
  remarks: string
}

export const EMPTY_VALUES: ApplicationValues = {
  name: "",
  nameDv: "",
  idCard: "",
  phone: "",
  email: "",
  address: "",
  service: "",
  island: "",
  amount: null,
  status: "submitted",
  assignee: "",
  remarks: "",
}

export function toValues(a: Application): ApplicationValues {
  return {
    name: a.name,
    nameDv: a.nameDv,
    idCard: a.idCard,
    phone: a.phone.replace(/[\s-]/g, ""),
    email: a.email,
    address: a.address ?? "",
    service: a.service,
    island: a.island,
    amount: a.amount,
    status: a.status,
    assignee: a.assignee ?? "",
    remarks: a.remarks ?? "",
  }
}

export function fromValues(v: ApplicationValues): Partial<Application> {
  return {
    name: v.name.trim(),
    nameDv: v.nameDv.trim(),
    idCard: v.idCard.trim().toUpperCase(),
    phone: v.phone.replace(/^\+960(\d{3})(\d{4})$/, "+960 $1-$2"),
    email: v.email.trim(),
    address: v.address.trim() || null,
    service: v.service,
    island: v.island,
    amount: v.amount ?? 0,
    status: v.status as Application["status"],
    assignee: v.assignee || null,
    remarks: v.remarks.trim() || null,
  }
}

/** Field labels, in form order, for the save bar's change list. */
export function fieldLabels(tr: Tr): Record<keyof ApplicationValues, string> {
  return {
    name: tr("Name (English)", "ނަން (އިނގިރޭސި)"),
    nameDv: tr("Name (Dhivehi)", "ނަން (ދިވެހި)"),
    idCard: tr("ID card", "އައިޑީ ކާޑު"),
    phone: tr("Phone", "ފޯނު"),
    email: tr("Email", "އީމެއިލް"),
    address: tr("Address", "އެޑްރެސް"),
    service: tr("Service", "ޚިދުމަތް"),
    island: tr("Island", "ރަށް"),
    amount: tr("Fee", "ފީ"),
    status: tr("Status", "ސްޓޭޓަސް"),
    assignee: tr("Assignee", "ޙަވާލުވި"),
    remarks: tr("Remarks", "ރިމާކްސް"),
  }
}

/** Display values for the change list ("Service changes to Land lease"). */
export function fieldFormat(labels: Labels): Partial<Record<keyof ApplicationValues, (v: unknown) => unknown>> {
  return {
    service: (v) => labels.service(v as string),
    island: (v) => labels.island(v as string),
    status: (v) => labels.status(v as string),
    assignee: (v) => labels.staff(v as string),
    amount: (v) => (typeof v === "number" ? labels.mvr(v) : v),
  }
}

/**
 * Pretend server validation: throws a Laravel 422 (`ValidationError`) the
 * `Form` shows under each field. `taken@gmail.com`, or an ID card that another
 * application uses, come back as "already taken".
 */
export function validate(v: ApplicationValues, tr: Tr, others: Application[]) {
  const errors: Record<string, string[]> = {}
  const add = (key: string, message: string) => (errors[key] = [...(errors[key] ?? []), message])
  if (!v.name.trim()) add("name", tr("The name field is required.", "ނަން ލިޔުއްވުން ލާޒިމް."))
  if (!v.nameDv.trim()) add("nameDv", tr("The Dhivehi name field is required.", "ދިވެހި ނަން ލިޔުއްވުން ލާޒިމް."))
  if (!/^A\d{6}$/i.test(v.idCard.trim()))
    add("idCard", tr("Enter an ID card number like A123456.", "A123456 ފަދަ އައިޑީ ކާޑު ނަންބަރެއް ލިޔުއްވާ."))
  else if (others.some((a) => a.idCard === v.idCard.trim().toUpperCase()))
    add(
      "idCard",
      tr(
        "Another application already uses this ID card.",
        "މި އައިޑީ ކާޑު އެހެން އެޕްލިކޭޝަނެއްގައި ބޭނުންކޮށްފައިވޭ.",
      ),
    )
  if (!/^\S+@\S+\.\S+$/.test(v.email.trim()))
    add("email", tr("Enter a valid email address.", "ރަނގަޅު އީމެއިލް އެޑްރެހެއް ލިޔުއްވާ."))
  else if (v.email.trim().toLowerCase() === "taken@gmail.com")
    add("email", tr("The email has already been taken.", "މި އީމެއިލް ކުރިން ބޭނުންކޮށްފައިވޭ."))
  if (!v.service) add("service", tr("Choose a service.", "ޚިދުމަތެއް އިޚްތިޔާރުކުރައްވާ."))
  if (!v.island) add("island", tr("Choose an island.", "ރަށެއް އިޚްތިޔާރުކުރައްވާ."))
  if (v.amount === null || v.amount <= 0)
    add("amount", tr("The fee must be more than zero.", "ފީ ސުމެއްވުރެ ބޮޑުވާން ޖެހޭ."))
  if (Object.keys(errors).length) {
    throw new ValidationError(errors, tr("The given data was invalid.", "ފޯމުގައި މައްސަލަ ހުރި."))
  }
}

/** Applications other than `id`, for uniqueness checks. */
export function useOthers(id?: string) {
  const all = useApplications()
  return React.useMemo(() => all.filter((a) => a.id !== id), [all, id])
}

/** The application fields, grouped into cards (§25.9). Controlled by `values`. */
export function ApplicationFields({
  values,
  onChange,
  labels,
  showStatus = true,
}: {
  values: ApplicationValues
  onChange: (patch: Partial<ApplicationValues>) => void
  labels: Labels
  showStatus?: boolean
}) {
  const tr = useTr()
  const l = fieldLabels(tr)
  const text = (key: keyof ApplicationValues) => ({
    value: (values[key] as string) ?? "",
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange({ [key]: e.target.value }),
  })

  return (
    <>
      <Fieldset
        variant="card"
        legend={tr("Applicant", "އެޕްލިކަންޓް")}
        description={tr("As shown on the national ID card.", "ދިވެހި ރައްޔިތެއްކަން އަންގައިދޭ ކާޑުގައިވާ ގޮތަށް.")}
      >
        <FormGroup columns={2}>
          <FormField label={l.name} name="name" required>
            <TextInput autoComplete="off" {...text("name")} />
          </FormField>
          <FormField label={l.nameDv} name="nameDv" required>
            <ThaanaInput {...text("nameDv")} />
          </FormField>
          <FormField label={l.idCard} name="idCard" required help={tr("For example A123456", "މިސާލަކަށް A123456")}>
            <TextInput dir="ltr" autoComplete="off" {...text("idCard")} />
          </FormField>
          <FormField label={l.phone} name="phone">
            <PhoneInput defaultCountry="MV" value={values.phone} onValueChange={(v) => onChange({ phone: v ?? "" })} />
          </FormField>
          <FormField
            label={l.email}
            name="email"
            required
            help={tr("Use taken@gmail.com to see a server error.", "ސާވަރު އެރަރ ބެލުމަށް taken@gmail.com ބޭނުންކުރޭ.")}
          >
            <EmailInput dir="ltr" {...text("email")} />
          </FormField>
          <FormField label={l.address} name="address">
            <TextInput {...text("address")} />
          </FormField>
        </FormGroup>
      </Fieldset>

      <Fieldset variant="card" legend={tr("Application", "އެޕްލިކޭޝަން")}>
        <FormGroup columns={2}>
          <FormField label={l.service} name="service" required>
            <Select
              placeholder={tr("Choose a service", "ޚިދުމަތެއް އިޚްތިޔާރުކުރޭ")}
              options={labels.options.services}
              value={values.service}
              onValueChange={(service) => {
                const fee = SERVICES.find((s) => s.value === service)?.fee
                onChange(values.amount === null && fee ? { service, amount: fee } : { service })
              }}
            />
          </FormField>
          <FormField label={l.island} name="island" required>
            <SearchableSelect
              placeholder={tr("Choose an island", "ރަށެއް އިޚްތިޔާރުކުރޭ")}
              options={labels.options.islands}
              value={values.island}
              onValueChange={(island) => onChange({ island: (island as string | undefined) ?? "" })}
            />
          </FormField>
          <FormField label={l.amount} name="amount" required>
            <NumberInput
              min={0}
              step={0.01}
              formatOptions={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }}
              value={values.amount}
              onValueChange={(amount) => onChange({ amount })}
            />
          </FormField>
          <FormField label={l.assignee} name="assignee">
            <Select
              placeholder={tr("Unassigned", "ޙަވާލުނުކުރެވޭ")}
              options={labels.options.staff}
              clearable
              value={values.assignee}
              onValueChange={(assignee) => onChange({ assignee: assignee ?? "" })}
            />
          </FormField>
          {showStatus ? (
            <FormField label={l.status} name="status">
              <Select
                options={labels.options.statuses}
                value={values.status}
                onValueChange={(status) => onChange({ status })}
              />
            </FormField>
          ) : null}
        </FormGroup>
        <FormField label={l.remarks} name="remarks">
          <Textarea rows={3} {...text("remarks")} />
        </FormField>
      </Fieldset>
    </>
  )
}
