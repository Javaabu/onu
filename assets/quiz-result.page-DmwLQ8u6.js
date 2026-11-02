var e=`import { useLocation } from "react-router"
import { Accordion, Card, Icon, LinkButton, ProgressBar, StatusBadge, cn } from "@javaabu/onu"

import { useTr } from "../_shared/i18n"
import { routes } from "../_shared/routes"
import { CitizenShell } from "../_shared/shells"
import { useL } from "../public-portal/_i18n"
import { courses, PASS_MARK, questions, sampleAnswers, score } from "./_data"

export const meta = { title: "Quiz result", group: "Learning", layout: "bare", order: 5 }

export default function QuizResultPage() {
  const tr = useTr()
  const l = useL()
  const location = useLocation()
  const course = courses[0]
  const answers: Record<string, string[]> =
    (location.state as { answers?: Record<string, string[]> } | null)?.answers ?? sampleAnswers
  const result = score(answers)
  const passed = result.percent >= PASS_MARK

  return (
    <CitizenShell
      breadcrumbs={[
        { label: tr("Learning", "ތަމްރީނު"), href: routes.learning.courses },
        { label: l(course.title), href: routes.learning.courseDetail },
        { label: tr("Quiz result", "ކުއިޒްގެ ނަތީޖާ") },
      ]}
    >
      <div className="max-w-3xl gap-6 mx-auto grid">
        <Card>
          <div className="gap-6 sm:flex-row sm:items-center flex flex-col">
            <div
              className={cn(
                "size-28 grid shrink-0 place-items-center rounded-full border-8 text-center",
                passed ? "border-success/30 text-success" : "border-destructive/30 text-destructive",
              )}
            >
              <div>
                <div className="text-3xl font-semibold tabular-nums">{result.percent}%</div>
                <div className="text-xs text-muted-foreground tabular-nums">
                  {result.correct}/{result.total}
                </div>
              </div>
            </div>
            <div className="min-w-0 gap-2 grid flex-1">
              <StatusBadge status={passed ? "success" : "danger"} className="w-fit">
                {passed ? tr("Passed", "ފާސް") : tr("Not passed", "ފާސްނުވި")}
              </StatusBadge>
              <h1 className="text-2xl font-semibold tracking-tight">
                {passed
                  ? tr("Well done — you passed the quiz", "މަރުޙަބާ — ކުއިޒް ފާސްވެއްޖެ")
                  : tr("Not quite — try again", "ފާސްނުވި — އަލުން މަސައްކަތްކުރައްވާ")}
              </h1>
              <p className="text-muted-foreground">
                {tr(
                  \`You answered \${result.correct} of \${result.total} questions correctly. The pass mark is \${PASS_MARK}%.\`,
                  \`\${result.total} ސުވާލުން \${result.correct} ސުވާލަށް ރަނގަޅު ޖަވާބު ދެއްވައިފި. ފާސްވާ މިންވަރަކީ \${PASS_MARK}%.\`,
                )}
              </p>
              <ProgressBar
                value={result.percent}
                color={passed ? "success" : "destructive"}
                aria-label={tr("Score", "ޕޮއިންޓް")}
                size="sm"
              />
            </div>
          </div>
          <div className="mt-6 gap-2 flex flex-wrap">
            {passed ? (
              <LinkButton href={routes.learning.certificate} startIcon="star">
                {tr("View certificate", "ސެޓްފިކެޓް ބައްލަވާ")}
              </LinkButton>
            ) : null}
            <LinkButton href={routes.learning.lesson} variant={passed ? "outline" : "default"} endIcon="arrow-right">
              {tr("Continue the course", "ކޯސް ކުރިއަށް")}
            </LinkButton>
            <LinkButton href={routes.learning.quiz} variant="outline" startIcon="refresh">
              {tr("Retake quiz", "އަލުން ހަދާ")}
            </LinkButton>
          </div>
        </Card>

        <section aria-labelledby="review-heading">
          <h2 id="review-heading" className="text-xl font-semibold">
            {tr("Question review", "ސުވާލުތައް")}
          </h2>
          <Accordion
            className="mt-4"
            type="multiple"
            variant="separated"
            defaultValue={questions.filter((q) => !isCorrect(q.answer, answers[q.id])).map((q) => q.id)}
            items={questions.map((q, i) => {
              const given = answers[q.id] ?? []
              const ok = isCorrect(q.answer, given)
              return {
                value: q.id,
                title: (
                  <span className="gap-3 flex items-start text-start">
                    <Icon
                      name={ok ? "success" : "error"}
                      className={cn("mt-0.5 size-5 shrink-0", ok ? "text-success" : "text-destructive")}
                      label={ok ? tr("Correct", "ރަނގަޅު") : tr("Incorrect", "ނުބައި")}
                    />
                    <span>
                      {i + 1}. {l(q.text)}
                    </span>
                  </span>
                ),
                content: (
                  <div className="gap-3 grid">
                    <ul className="gap-2 grid">
                      {q.options.map((o) => {
                        const right = q.answer.includes(o.value)
                        const chosen = given.includes(o.value)
                        return (
                          <li
                            key={o.value}
                            className={cn(
                              "gap-3 px-3 py-2 flex items-center rounded-md border",
                              right && "border-success/40 bg-success/10",
                              chosen && !right && "border-destructive/40 bg-destructive/10",
                            )}
                          >
                            <Icon
                              name={right ? "check" : chosen ? "close" : "dot"}
                              className={cn(
                                "size-4 shrink-0",
                                right ? "text-success" : chosen ? "text-destructive" : "text-muted-foreground",
                              )}
                            />
                            <span className="flex-1">{l(o.label)}</span>
                            {chosen ? (
                              <span className="text-xs text-muted-foreground">
                                {tr("Your answer", "ތިބާގެ ޖަވާބު")}
                              </span>
                            ) : right ? (
                              <span className="text-xs text-muted-foreground">
                                {tr("Correct answer", "ރަނގަޅު ޖަވާބު")}
                              </span>
                            ) : null}
                          </li>
                        )
                      })}
                    </ul>
                    <p className="text-sm text-muted-foreground">{l(q.explanation)}</p>
                  </div>
                ),
              }
            })}
          />
        </section>
      </div>
    </CitizenShell>
  )
}

function isCorrect(answer: string[], given: string[] = []) {
  return [...answer].sort().join(",") === [...given].sort().join(",")
}
`;export{e as default};