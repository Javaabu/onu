var e=`import * as React from "react"
import {
  Accordion,
  Button,
  Card,
  Icon,
  IconText,
  LinkButton,
  ProgressBar,
  Rating,
  Tag,
  UserAvatar,
  UserAvatarGroup,
  toast,
} from "@javaabu/onu"

import { useTr } from "../_shared/i18n"
import { routes } from "../_shared/routes"
import { PortalShell } from "../_shared/shells"
import { scene, useL, wait } from "../public-portal/_i18n"
import { Container, PortalPageHeader } from "../public-portal/_ui"
import { courses, levels, outline } from "./_data"

export const meta = { title: "Course detail", group: "Learning", layout: "bare", order: 2 }

const kindIcon = { video: "play", reading: "file-text", quiz: "help" } as const

export default function CourseDetailPage() {
  const tr = useTr()
  const l = useL()
  const course = courses[0]
  const [enrolled, setEnrolled] = React.useState(false)
  const [enrolling, setEnrolling] = React.useState(false)

  const allLessons = outline.flatMap((m) => m.lessons)
  const minutes = allLessons.reduce((n, x) => n + x.minutes, 0)

  const enrol = async () => {
    setEnrolling(true)
    await wait(900)
    setEnrolling(false)
    setEnrolled(true)
    toast.success(tr("You are enrolled", "ކޯހަށް ވައްދައިފި"), { description: l(course.title) })
  }

  const cta = enrolled ? (
    <LinkButton href={routes.learning.lesson} size="lg" endIcon="arrow-right" className="w-full">
      {tr("Start learning", "ފައްޓަވާ")}
    </LinkButton>
  ) : (
    <Button size="lg" className="w-full" loading={enrolling} onClick={enrol} startIcon="add">
      {tr("Enrol for free", "ހިލޭ ވައްދަވާ")}
    </Button>
  )

  return (
    <PortalShell>
      <PortalPageHeader
        crumbs={[{ label: tr("Learning", "ތަމްރީނު"), href: routes.learning.courses }, { label: l(course.title) }]}
        eyebrow={tr("Customer service", "ކަސްޓަމަރ ސަރވިސް")}
        title={l(course.title)}
        description={l(course.summary)}
      >
        <div className="gap-x-6 gap-y-3 text-sm flex flex-wrap items-center">
          <span className="gap-2 inline-flex items-center">
            <Rating
              readOnly
              allowHalf
              value={course.rating}
              size="sm"
              aria-label={tr("Rated 4.8 of 5", "5 އިން 4.8")}
            />
            <span className="tabular-nums">{course.rating}</span>
          </span>
          <span className="gap-2 inline-flex items-center">
            <UserAvatarGroup
              size="xs"
              max={4}
              users={[
                { id: 1, name: "Ahmed Ali" },
                { id: 2, name: "Aishath Shiuna" },
                { id: 3, name: "Mohamed Shafeeu" },
                { id: 4, name: "Fathimath Nasha" },
              ]}
            />
            <span className="text-muted-foreground tabular-nums">
              {tr(
                \`\${course.learners.toLocaleString("en")} learners\`,
                \`\${course.learners.toLocaleString("en")} ދަސްކުރާ މީހުން\`,
              )}
            </span>
          </span>
          <Tag size="sm" variant="outline">
            {l(levels.find((x) => x.value === course.level)!.label)}
          </Tag>
        </div>
      </PortalPageHeader>

      <Container className="py-10 gap-10 lg:grid-cols-[1fr_22rem] grid items-start">
        <div className="gap-10 min-w-0 grid">
          <section aria-labelledby="learn-heading" className="p-6 rounded-xl border">
            <h2 id="learn-heading" className="text-xl font-semibold">
              {tr("What you will learn", "ދަސްކުރެވޭނެ ކަންތައް")}
            </h2>
            <ul className="mt-4 gap-3 sm:grid-cols-2 grid">
              {[
                tr("Apply the service charter at the counter", "ކައުންޓަރުގައި ޚިދުމަތުގެ ޗާޓަރު ތަންފީޒުކުރުން"),
                tr("Explain fees and service times clearly", "ފީއާއި މުއްދަތު ސާފުކޮށް ބުނެދިނުން"),
                tr("Serve citizens in Dhivehi and English", "ދިވެހި އަދި އިނގިރޭސިން ޚިދުމަތްދިނުން"),
                tr("Handle complaints and appeals fairly", "ޝަކުވާއާއި އިސްތިޢުނާފު ޢަދުލުވެރިކޮށް ބެލުން"),
              ].map((x) => (
                <li key={x} className="gap-3 flex items-start">
                  <Icon name="check" className="mt-0.5 size-5 shrink-0 text-success" />
                  <span>{x}</span>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="outline-heading">
            <div className="gap-2 flex flex-wrap items-baseline justify-between">
              <h2 id="outline-heading" className="text-xl font-semibold">
                {tr("Course outline", "ކޯހުގެ ތަފްޞީލު")}
              </h2>
              <span className="text-sm text-muted-foreground tabular-nums">
                {tr(
                  \`\${outline.length} modules · \${allLessons.length} lessons · \${Math.round(minutes / 60)} h \${minutes % 60} min\`,
                  \`\${outline.length} މޮޑިއުލް · \${allLessons.length} ފިލާވަޅު · \${Math.round(minutes / 60)} ގަޑި \${minutes % 60} މިނިޓު\`,
                )}
              </span>
            </div>
            <Accordion
              className="mt-4"
              type="multiple"
              variant="separated"
              defaultValue={["m1"]}
              items={outline.map((m, i) => ({
                value: m.id,
                title: (
                  <span className="gap-1 grid text-start">
                    <span className="text-xs font-normal text-muted-foreground">
                      {tr(\`Module \${i + 1}\`, \`މޮޑިއުލް \${i + 1}\`)} ·{" "}
                      {tr(\`\${m.lessons.length} lessons\`, \`\${m.lessons.length} ފިލާވަޅު\`)}
                    </span>
                    <span>{l(m.title)}</span>
                  </span>
                ),
                content: (
                  <ol className="divide-y">
                    {m.lessons.map((x) => (
                      <li key={x.id} className="gap-3 py-2.5 flex items-center">
                        <Icon name={kindIcon[x.kind]} className="size-4 shrink-0 text-muted-foreground" />
                        <span className="flex-1">{l(x.title)}</span>
                        {enrolled && x.done ? (
                          <Icon name="success" className="size-4 text-success" label={tr("Completed", "ނިމިފައި")} />
                        ) : null}
                        <span className="text-xs text-muted-foreground tabular-nums">
                          {tr(\`\${x.minutes} min\`, \`\${x.minutes} މިނިޓު\`)}
                        </span>
                      </li>
                    ))}
                  </ol>
                ),
              }))}
            />
          </section>

          <section aria-labelledby="instructor-heading">
            <h2 id="instructor-heading" className="text-xl font-semibold">
              {tr("Your instructor", "ކިޔަވައިދޭ ފަރާތް")}
            </h2>
            <div className="mt-4 gap-4 flex items-start">
              <UserAvatar name={l(course.instructor)} size="xl" decorative />
              <div>
                <h3 className="font-semibold">{l(course.instructor)}</h3>
                <p className="text-sm text-muted-foreground">
                  {tr("Head of service quality, Ministry of Services", "ސަރވިސް ކޮލިޓީގެ ހެޑް، ޚިދުމަތްތަކުގެ ވުޒާރާ")}
                </p>
                <p className="mt-2 max-w-prose">
                  {tr(
                    "Aishath has trained more than 3,000 counter staff across 40 islands, and led the rollout of service charters in 2024.",
                    "އައިޝަތު 40 ރަށެއްގެ 3,000 އަށް ވުރެ ގިނަ ކައުންޓަރު މުވައްޒަފުންނަށް ތަމްރީނު ދީފައިވާ އިރު، 2024 ގައި ޚިދުމަތުގެ ޗާޓަރުތައް ތަންފީޒުކުރުމުގެ މަސައްކަތް ލީޑުކުރެއްވި.",
                  )}
                </p>
              </div>
            </div>
          </section>
        </div>

        <aside className="lg:sticky lg:top-20" aria-label={tr("Enrol", "ވައްދަވާ")}>
          <Card className="pt-0 overflow-hidden">
            <img src={scene("", course.hue, 800, 450)} alt="" className="aspect-video w-full object-cover" />
            <div className="gap-4 grid">
              {enrolled ? (
                <ProgressBar value={0} label={tr("Your progress", "ކުރިއެރުން")} />
              ) : (
                <div className="text-2xl font-semibold">{tr("Free", "ހިލޭ")}</div>
              )}
              {cta}
              <ul className="gap-2 text-sm grid">
                <li>
                  <IconText icon="play" size="sm">
                    {tr("8 video lessons with captions", "ކެޕްޝަން ހުރި 8 ވީޑިއޯ ފިލާވަޅު")}
                  </IconText>
                </li>
                <li>
                  <IconText icon="file-text" size="sm">
                    {tr("2 readings", "2 ކިޔުން")}
                  </IconText>
                </li>
                <li>
                  <IconText icon="help" size="sm">
                    {tr("2 quizzes", "2 ކުއިޒް")}
                  </IconText>
                </li>
                <li>
                  <IconText icon="star" size="sm">
                    {tr("Certificate when you pass", "ފާސްވުމުން ސެޓްފިކެޓް")}
                  </IconText>
                </li>
                <li>
                  <IconText icon="languages" size="sm">
                    {tr("Dhivehi and English", "ދިވެހި އަދި އިނގިރޭސި")}
                  </IconText>
                </li>
              </ul>
            </div>
          </Card>
        </aside>
      </Container>
    </PortalShell>
  )
}
`;export{e as default};