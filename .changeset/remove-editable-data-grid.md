---
"@javaabu/onu": minor
---

`EditableDataGrid`, `EditableDataGridProps` and `EditableColumn` are removed, with the `listing.editCell`, `listing.cell*` and `listing.gridInstructions` strings. Use `RepeatingGroup` for editable rows (line items) and `InlineEdit` for a single cell in a `DataTable`; a spreadsheet-style grid needs a dedicated grid library.

```tsx
<RepeatingGroup label="Items" name="items" value={items} onChange={setItems} createItem={() => ({ name: "", qty: 1 })}>
  {({ item, name }) => (
    <FormField label="Item" name={name("name")}>
      <TextInput defaultValue={item.name} />
    </FormField>
  )}
</RepeatingGroup>

<DataTable
  data={users}
  columns={[
    {
      id: "name",
      header: "Name",
      cell: (u) => <InlineEdit label="Name" defaultValue={u.name} onSave={(name) => api.patch(`/users/${u.id}`, { name })} />,
    },
  ]}
/>
```
