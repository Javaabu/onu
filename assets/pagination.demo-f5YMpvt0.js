var e=`import * as React from "react"
import { Pagination } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"
import { noun } from "./_data"

export const meta = { title: "Pagination", group: "Listing pages", order: 6 }

export default function PaginationDemo() {
  const [page, setPage] = React.useState(2)
  const [perPage, setPerPage] = React.useState(25)
  const [numbered, setNumbered] = React.useState(7)
  return (
    <DemoPage>
      <DemoSection title="Previous / Next with rows per page" className="block">
        <Pagination
          numbered={false}
          page={page}
          perPage={perPage}
          total={312}
          noun={noun}
          onPageChange={setPage}
          onPerPageChange={(n) => {
            setPerPage(n)
            setPage(1)
          }}
        />
      </DemoSection>
      <DemoSection
        title="Numbered pages"
        description="Collapses to “Page 7 of 32” in narrow containers."
        className="block"
      >
        <Pagination numbered page={numbered} perPage={10} total={312} noun={noun} onPageChange={setNumbered} />
      </DemoSection>
      <DemoSection
        title="Laravel API resource"
        description="Pass the JSON response; links become hrefs."
        className="block"
      >
        <Pagination
          noun={noun}
          numbered
          paginator={{
            data: [],
            links: { first: "#?page=1", last: "#?page=13", prev: "#?page=1", next: "#?page=3" },
            meta: {
              current_page: 2,
              from: 26,
              last_page: 13,
              path: "#/components/listing-pages/pagination",
              per_page: 25,
              to: 50,
              total: 312,
            },
          }}
        />
      </DemoSection>
      <DemoSection title="Simple paginator (no total)" className="block">
        <Pagination
          paginator={{ current_page: 4, per_page: 15, next_page_url: "#?page=5", prev_page_url: "#?page=3" }}
        />
      </DemoSection>
    </DemoPage>
  )
}
`;export{e as default};