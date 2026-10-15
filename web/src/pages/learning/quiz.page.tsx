import * as React from "react"
import { useNavigate } from "react-router"
import {
  Button,
  Callout,
  Card,
  Checkbox,
  ConfirmDialog,
  Countdown,
  Fieldset,
  ProgressBar,
  RadioGroup,
  StatusBadge,
} from "@javaabu/onu"

import { useTr } from "../_shared/i18n"
import { routes } from "../_shared/routes"
import { CitizenShell } from "../_shared/shells"
import { useL } from "../public-portal/_i18n"
import { courses, PASS_MARK, questions } from "./_data"

export const meta = { title: "Quiz", group: "Learning", layout: "bare", order: 4 }

const TIME_LIMIT_MINUTES = 10

export default function QuizPage() {
  const tr = useTr()
  const l = useL()
  const navigate = useNavigate()
  const course = courses[0]
  const [deadline] = React.useState(() => Date.now() + TIME_LIMIT_MINUTES * 60_000)
  const [step, setStep] = React.useState(0) // questions.length = review
  const [answers, setAnswers] = React.useState<Record<string, string[]>>({})
  const headingRef = React.useRef<HTMLHeadingElement>(null)

  const reviewing = step === questions.length
  const answered = questions.filter((q) => answers[q.id]?.length).length
  const unanswered = questions.length - answered

  const goTo = (i: number) => {
    setStep(i)
    requestAnimationFrame(() => headingRef.current?.focus())
  }
  const submit = () => navigate(routes.learning.quizResult, { state: { answers } })

  const q = questions[step]
  const set = (values: string[]) => setAnswers((a) => ({ ...a, [q.id]: values }))

  return (
    <CitizenShell
      breadcrumbs={[
        { label: tr("Learning", "ތަމްރީނު"), href: routes.learning.courses },
        { label: l(course.title), href: routes.learning.courseDetail },
        { label: tr("Quiz", "ކުއިޒް") },
      ]}
    >
      <div className="max-w-3xl gap-6 mx-auto grid">
        <header className="gap-4 flex flex-wrap items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{l(course.title)}</p>
            <h1 className="text-2xl font-semibold tracking-tight">
              {tr("Module 2 quiz: the Public Services Act", "މޮޑިއުލް 2 ކުއިޒް: ޢާންމު ޚިދުމަތުގެ ޤާނޫނު")}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {tr(`Pass mark ${PASS_MARK}%. You can retake it.`, `ފާސްވާ މިންވަރު ${PASS_MARK}%. އަލުން ހެދޭނެ.`)}
            </p>
          </div>
          <div className="gap-1 grid justify-items-end">
            <span className="text-xs text-muted-foreground">{tr("Time left", "ބާކީ ވަގުތު")}</span>
            <Countdown
              to={deadline}
              variant="inline"
              showDays={false}
              className="text-xl font-semibold"
              onComplete={submit}
              completeText={tr("Time's up", "ވަގުތު ހަމަވެއްޖެ")}
            />
          </div>
        </header>

        <ProgressBar
          value={answered}
          max={questions.length}
          label={tr("Answered", "ޖަވާބުދީފައި")}
          formatValue={(v, max) => tr(`${v} of ${max}`, `${max} ން ${v}`)}
        />

        <nav aria-label={tr("Questions", "ސުވާލުތައް")}>
          <ol className="gap-2 flex flex-wrap">
            {questions.map((x, i) => {
              const isDone = !!answers[x.id]?.length
              return (
                <li key={x.id}>
                  <Button
                    size="icon"
                    variant={i === step ? "default" : isDone ? "secondary" : "outline"}
                    aria-current={i === step ? "step" : undefined}
                    aria-label={tr(
                      `Question ${i + 1}${isDone ? ", answered" : ""}`,
                      `ސުވާލު ${i + 1}${isDone ? "، ޖަވާބުދީފައި" : ""}`,
                    )}
                    onClick={() => goTo(i)}
                    className="tabular-nums"
                  >
                    {i + 1}
                  </Button>
                </li>
              )
            })}
            <li>
              <Button
                variant={reviewing ? "default" : "outline"}
                aria-current={reviewing ? "step" : undefined}
                onClick={() => goTo(questions.length)}
                startIcon="list"
              >
                {tr("Review", "ރިވިއު")}
              </Button>
            </li>
          </ol>
        </nav>

        {reviewing ? (
          <Card>
            <div className="gap-4 grid">
              <h2 ref={headingRef} tabIndex={-1} className="text-xl font-semibold outline-none">
                {tr("Review your answers", "ޖަވާބުތައް ބައްލަވާ")}
              </h2>
              {unanswered ? (
                <Callout
                  variant="warning"
                  title={tr(`${unanswered} questions not answered`, `${unanswered} ސުވާލަކަށް ޖަވާބު ނުދެއްވާ`)}
                  description={tr(
                    "Unanswered questions are marked wrong.",
                    "ޖަވާބު ނުދީ ހުރި ސުވާލުތައް ރަނގަޅު ނުވާނެ.",
                  )}
                />
              ) : null}
              <ol className="divide-y rounded-lg border">
                {questions.map((x, i) => {
                  const a = answers[x.id] ?? []
                  return (
                    <li key={x.id} className="gap-3 p-4 sm:flex-row sm:items-center flex flex-col">
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium">
                          {i + 1}. {l(x.text)}
                        </div>
                        <div className="mt-1 text-sm text-muted-foreground">
                          {a.length
                            ? x.options
                                .filter((o) => a.includes(o.value))
                                .map((o) => l(o.label))
                                .join(", ")
                            : "—"}
                        </div>
                      </div>
                      <div className="gap-2 flex items-center">
                        {a.length ? (
                          <StatusBadge status="success" size="sm">
                            {tr("Answered", "ޖަވާބުދީފައި")}
                          </StatusBadge>
                        ) : (
                          <StatusBadge status="warning" size="sm">
                            {tr("Not answered", "ޖަވާބު ނުދީ")}
                          </StatusBadge>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => goTo(i)}
                          aria-label={tr(`Change answer ${i + 1}`, `${i + 1} ގެ ޖަވާބު ބަދަލުކުރޭ`)}
                        >
                          {tr("Change", "ބަދަލުކުރޭ")}
                        </Button>
                      </div>
                    </li>
                  )
                })}
              </ol>
              <div className="gap-2 flex flex-wrap justify-between">
                <Button variant="outline" startIcon="arrow-left" onClick={() => goTo(questions.length - 1)}>
                  {tr("Back", "ފަހަތަށް")}
                </Button>
                <ConfirmDialog
                  trigger={<Button startIcon="send">{tr("Submit answers", "ޖަވާބު ހުށަހަޅާ")}</Button>}
                  title={tr("Submit your answers?", "ޖަވާބުތައް ހުށަހަޅަންތޯ؟")}
                  description={
                    unanswered
                      ? tr(
                          `You have ${unanswered} unanswered questions. You cannot change answers after submitting.`,
                          `${unanswered} ސުވާލަކަށް ޖަވާބު ނުދެއްވާ. ހުށަހެޅުމަށްފަހު ބަދަލެއް ނުގެނެވޭނެ.`,
                        )
                      : tr("You cannot change answers after submitting.", "ހުށަހެޅުމަށްފަހު ބަދަލެއް ނުގެނެވޭނެ.")
                  }
                  confirmLabel={tr("Submit", "ހުށަހަޅާ")}
                  onConfirm={submit}
                />
              </div>
            </div>
          </Card>
        ) : (
          <Card>
            <div className="gap-6 grid">
              <h2 ref={headingRef} tabIndex={-1} className="text-sm font-medium text-muted-foreground outline-none">
                {tr(`Question ${step + 1} of ${questions.length}`, `${questions.length} ސުވާލުން ${step + 1}`)}
              </h2>
              <Fieldset
                key={q.id}
                legend={<span className="text-lg font-semibold">{l(q.text)}</span>}
                description={
                  q.type === "multiple"
                    ? tr("Choose all that apply.", "ހުރިހާ ރަނގަޅު ޖަވާބެއް ޚިޔާރުކުރައްވާ.")
                    : undefined
                }
              >
                {q.type === "single" ? (
                  <RadioGroup
                    aria-label={l(q.text)}
                    variant="card"
                    value={answers[q.id]?.[0] ?? ""}
                    onValueChange={(v) => set([v])}
                    options={q.options.map((o) => ({ value: o.value, label: l(o.label) }))}
                  />
                ) : (
                  <div className="gap-3 grid">
                    {q.options.map((o) => {
                      const checked = answers[q.id]?.includes(o.value) ?? false
                      return (
                        <Checkbox
                          key={o.value}
                          label={l(o.label)}
                          checked={checked}
                          classNames={{ root: "rounded-lg border p-4 has-[[data-state=checked]]:border-primary" }}
                          onCheckedChange={(c) => {
                            const cur = answers[q.id] ?? []
                            set(c ? [...cur, o.value] : cur.filter((v) => v !== o.value))
                          }}
                        />
                      )
                    })}
                  </div>
                )}
              </Fieldset>
              <div className="gap-2 flex flex-wrap justify-between">
                <Button variant="outline" startIcon="arrow-left" disabled={step === 0} onClick={() => goTo(step - 1)}>
                  {tr("Previous", "ކުރީގެ")}
                </Button>
                <Button endIcon="arrow-right" onClick={() => goTo(step + 1)}>
                  {step === questions.length - 1 ? tr("Review answers", "ޖަވާބުތައް ބައްލަވާ") : tr("Next", "ދެން")}
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </CitizenShell>
  )
}
