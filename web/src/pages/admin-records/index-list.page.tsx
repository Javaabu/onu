import { CollectionIndex } from "./_index"

export const meta = {
  title: "Index: list view",
  group: "Admin: records",
  layout: "bare",
  order: 3,
}

export default function IndexListPage() {
  return <CollectionIndex view="list" />
}
