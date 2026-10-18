var e=`import * as React from "react"
import {
  Card,
  ContentCard,
  EmptyState,
  FilterTabs,
  IconText,
  LinkButton,
  ProgressBar,
  Rating,
  SearchBox,
  Select,
  StatusBadge,
} from "@javaabu/onu"

import { useDv, useTr } from "../_shared/i18n"
import { routes } from "../_shared/routes"
import { PortalShell } from "../_shared/shells"
import { scene, useL } from "../public-portal/_i18n"
import { Container, PortalPageHeader } from "../public-portal/_ui"
import { courses, levels, topics, type Course } from "./_data"

export const meta = { title: "Course catalogue", group: "Learning", layout: "bare", order: 1 }

export default function CourseCataloguePage() {
  const tr = useTr()
  const l = useL()
  const dv = useDv()
  const [tab, setTab] = React.useState("all")
  const [query, setQuery] = React.useState("")
  const [topic, setTopic] = React.useState("")
  const [level, setLevel] = React.useState("")

  const q = query.trim().toLowerCase()
  const base = courses.filter(
    (c) =>
      (!q || [c.title.en, c.title.dv, c.summary.en, c.summary.dv].some((t) => t.toLowerCase().includes(q))) &&
      (!topic || c.topic === topic) &&
      (!level || c.level === level),
  )
  const byTab = (c: Course) =>
    tab === "all" ||
    (tab === "enrolled" && c.progress !== undefined && c.progress < 100) ||
    (tab === "completed" && c.progress === 100)
  const rows = base.filter(byTab)
  const inProgress = courses.filter((c) => c.progress !== undefined && c.progress < 100)

  const clear = () => {
    setTopic("")
    setLevel("")
    setTab("all")
  }

  return (
    <PortalShell>
      <PortalPageHeader
        crumbs={[{ label: tr("Learning", "ތަމްރީނު") }]}
        eyebrow={tr("Civil Service Training Institute", "ސިވިލް ސަރވިސް ޓްރޭނިންގ އިންސްޓިޓިއުޓް")}
        title={tr("Learn at your own pace", "ތިމާއަށް ފަސޭހަ ގޮތަކަށް ދަސްކުރައްވާ")}
        description={tr(
          "Free online courses for public servants, with certificates you can add to your record.",
          "ސިވިލް ސަރވިސްގެ މުވައްޒަފުންނަށް ހިލޭ އޮންލައިން ކޯސްތައް، ރެކޯޑަށް އިތުރުކުރެވޭ ސެޓްފިކެޓްތަކާއެކު.",
        )}
      >
        <SearchBox
          value={query}
          onSearch={setQuery}
          thaana={dv}
          aria-label={tr("Search courses", "ކޯސް ހޯދާ")}
          placeholder={tr("Search courses…", "ކޯސް ހޯދާ…")}
          className="sm:max-w-xl"
          classNames={{ root: "h-11 bg-background" }}
        />
      </PortalPageHeader>

      {inProgress.length ? (
        <Container className="pt-10">
          <h2 className="text-xl font-semibold">{tr("Continue learning", "ކުރިއަށް ގެންދަވާ")}</h2>
          <ul className="mt-4 gap-4 md:grid-cols-2 grid">
            {inProgress.map((c) => (
              <li key={c.id}>
                <Card size="sm" className="h-full">
                  <div className="gap-4 flex items-center">
                    <img src={scene("", c.hue, 240, 240)} alt="" className="size-16 shrink-0 rounded-lg object-cover" />
                    <div className="min-w-0 gap-2 grid flex-1">
                      <h3 className="font-medium">{l(c.title)}</h3>
                      <ProgressBar
                        size="sm"
                        value={c.progress}
                        label={<span className="text-xs text-muted-foreground">{tr("Progress", "ކުރިއެރުން")}</span>}
                      />
                    </div>
                    <LinkButton href={routes.learning.lesson} size="sm" variant="outline" className="shrink-0">
                      {tr("Resume", "ކުރިއަށް")}
                    </LinkButton>
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        </Container>
      ) : null}

      <Container className="py-10">
        <div className="gap-4 lg:flex-row lg:items-end flex flex-col justify-between">
          <FilterTabs
            className="min-w-0"
            tabs={[
              { value: "all", label: tr("All courses", "ހުރިހާ ކޯހެއް"), count: base.length },
              {
                value: "enrolled",
                label: tr("In progress", "ކުރިއަށްދާ"),
                count: base.filter((c) => c.progress !== undefined && c.progress < 100).length,
              },
              {
                value: "completed",
                label: tr("Completed", "ނިމިފައި"),
                count: base.filter((c) => c.progress === 100).length,
              },
            ]}
            value={tab}
            onValueChange={setTab}
            controls="course-grid"
            aria-label={tr("Courses", "ކޯސްތައް")}
          />
          <div className="gap-3 sm:grid-cols-2 lg:w-[26rem] grid">
            <Select
              aria-label={tr("Topic", "ބައި")}
              placeholder={tr("All topics", "ހުރިހާ ބައެއް")}
              clearable
              value={topic}
              onValueChange={setTopic}
              options={topics.map((t) => ({ value: t.value, label: l(t.label) }))}
            />
            <Select
              aria-label={tr("Level", "ފެންވަރު")}
              placeholder={tr("All levels", "ހުރިހާ ފެންވަރެއް")}
              clearable
              value={level}
              onValueChange={setLevel}
              options={levels.map((t) => ({ value: t.value, label: l(t.label) }))}
            />
          </div>
        </div>

        <div id="course-grid" className="mt-8">
          {rows.length ? (
            <ul className="gap-6 sm:grid-cols-2 lg:grid-cols-3 grid">
              {rows.map((c) => (
                <li key={c.id}>
                  <ContentCard
                    className="h-full"
                    href={routes.learning.courseDetail}
                    image={{ src: scene("", c.hue, 800, 400), alt: "" }}
                    title={l(c.title)}
                    excerpt={l(c.summary)}
                    category={l(levels.find((x) => x.value === c.level)!.label)}
                    meta={
                      <span className="gap-x-3 gap-y-1 flex flex-wrap items-center">
                        <IconText icon="user" size="sm" tone="muted">
                          {l(c.instructor)}
                        </IconText>
                        <IconText icon="list" size="sm" tone="muted">
                          {tr(\`\${c.lessons} lessons\`, \`\${c.lessons} ފިލާވަޅު\`)}
                        </IconText>
                        <IconText icon="clock" size="sm" tone="muted">
                          {tr(\`\${c.hours} h\`, \`\${c.hours} ގަޑި\`)}
                        </IconText>
                      </span>
                    }
                    footer={
                      <div className="gap-3 grid">
                        <span className="gap-1 inline-flex items-center">
                          <Rating
                            readOnly
                            value={c.rating}
                            allowHalf
                            size="sm"
                            aria-label={tr(\`Rated \${c.rating} of 5\`, \`5 އިން \${c.rating}\`)}
                          />
                          <span className="text-xs text-muted-foreground tabular-nums">{c.rating}</span>
                        </span>
                        {c.progress === 100 ? (
                          <StatusBadge status="success" className="w-fit">
                            {tr("Completed", "ނިމިފައި")}
                          </StatusBadge>
                        ) : c.progress !== undefined ? (
                          <ProgressBar
                            size="sm"
                            value={c.progress}
                            label={<span className="text-xs">{tr("Your progress", "ކުރިއެރުން")}</span>}
                          />
                        ) : (
                          <span className="text-sm font-medium text-primary">
                            {tr("Free · Enrol now", "ހިލޭ · ވައްދަވާ")}
                          </span>
                        )}
                      </div>
                    }
                  />
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              variant="no-results"
              bordered
              noun={{ one: tr("course", "ކޯސް"), other: tr("courses", "ކޯސް") }}
              search={query || undefined}
              onClearSearch={query ? () => setQuery("") : undefined}
              onClearFilters={topic || level || tab !== "all" ? clear : undefined}
            />
          )}
        </div>
      </Container>
    </PortalShell>
  )
}
`;export{e as default};