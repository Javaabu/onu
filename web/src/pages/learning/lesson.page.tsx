import * as React from "react"
import {
  AutosaveIndicator,
  Button,
  Card,
  FormField,
  LinkButton,
  ProgressBar,
  SideNav,
  Tabs,
  Textarea,
  toast,
  useAutosave,
} from "@javaabu/onu"
import { MediaPlayer } from "@javaabu/onu/media"

import { useTr } from "../_shared/i18n"
import { routes } from "../_shared/routes"
import { CitizenShell } from "../_shared/shells"
import { scene, useL, wait } from "../public-portal/_i18n"
import { courses, outline } from "./_data"

export const meta = { title: "Lesson player", group: "Learning", layout: "bare", order: 3 }

const vtt = (lines: [string, string, string][]) =>
  `data:text/vtt;charset=utf-8,${encodeURIComponent(
    "WEBVTT\n\n" + lines.map(([a, b, t]) => `${a} --> ${b}\n${t}`).join("\n\n") + "\n",
  )}`

const captionsEn = vtt([
  ["00:00.000", "00:05.000", "Most people we serve speak Dhivehi at home."],
  ["00:05.000", "00:10.000", "Many also read English, and some prefer it for forms."],
  ["00:10.000", "00:16.000", "Always ask which language they would like, and use it in every letter."],
])
const captionsDv = vtt([
  ["00:00.000", "00:05.000", "އަޅުގަނޑުމެން ޚިދުމަތްދޭ ގިނަ ބައެއް ގޭގައި ވާހަކަދައްކަނީ ދިވެހިން."],
  ["00:05.000", "00:10.000", "ގިނަ ބަޔަކަށް އިނގިރޭސި ވެސް ކިޔަވައިލެވޭ، ބައެއް މީހުން ފޯމުތަކަށް އެ ބަސް ބޭނުންކުރާ."],
  ["00:10.000", "00:16.000", "ބޭނުންވާ ބަސް ސުވާލުކޮށް، ކޮންމެ ސިޓީއެއްގައި އެ ބަސް ބޭނުންކުރައްވާ."],
])

const lessons = outline.flatMap((m) => m.lessons.map((lesson) => ({ ...lesson, module: m.id })))

export default function LessonPlayerPage() {
  const tr = useTr()
  const l = useL()
  const course = courses[0]
  const [currentId, setCurrentId] = React.useState("l6")
  const [done, setDone] = React.useState<Set<string>>(() => new Set(lessons.filter((x) => x.done).map((x) => x.id)))
  const [notes, setNotes] = React.useState(
    "Ask which language first. Letters must match the language chosen.\nސިޓީ ލިޔާނީ އެދުނު ބަހުން.",
  )
  const autosave = useAutosave(notes, { onSave: () => wait(600), delay: 800 })

  const index = lessons.findIndex((x) => x.id === currentId)
  const current = lessons[index]
  const prev = lessons[index - 1]
  const next = lessons[index + 1]
  const progress = Math.round((done.size / lessons.length) * 100)
  const topRef = React.useRef<HTMLHeadingElement>(null)

  const go = (id: string) => {
    setCurrentId(id)
    topRef.current?.focus()
    window.scrollTo({ top: 0, behavior: "smooth" })
  }
  const complete = () => {
    setDone((d) => new Set(d).add(current.id))
    toast.success(tr("Lesson completed", "ފިލާވަޅު ނިމިއްޖެ"), { description: l(current.title) })
    if (next) go(next.id)
  }

  const lessonNav = (
    <SideNav
      aria-label={tr("Lessons", "ފިލާވަޅުތައް")}
      size="sm"
      groups={outline.map((m, i) => ({
        label: `${i + 1}. ${l(m.title)}`,
        items: m.lessons.map((x) => ({
          id: x.id,
          label: l(x.title),
          icon: done.has(x.id) ? "success" : x.kind === "quiz" ? "help" : x.kind === "reading" ? "file-text" : "play",
          isActive: x.id === currentId,
          badge: (
            <span className="text-xs text-muted-foreground tabular-nums">
              {tr(`${x.minutes} min`, `${x.minutes} މިނިޓު`)}
            </span>
          ),
          onSelect: () => go(x.id),
        })),
      }))}
    />
  )

  return (
    <CitizenShell
      breadcrumbs={[
        { label: tr("Learning", "ތަމްރީނު"), href: routes.learning.courses },
        { label: l(course.title), href: routes.learning.courseDetail },
        { label: l(current.title) },
      ]}
    >
      <div className="gap-8 lg:grid-cols-[1fr_18rem] grid items-start">
        <div className="min-w-0 gap-6 grid">
          <div>
            <p className="text-sm text-muted-foreground">
              {tr(`Lesson ${index + 1} of ${lessons.length}`, `${lessons.length} ފިލާވަޅުގެ ތެރެއިން ${index + 1}`)}
            </p>
            <h1 ref={topRef} tabIndex={-1} className="mt-1 text-2xl font-semibold tracking-tight outline-none">
              {l(current.title)}
            </h1>
          </div>

          <MediaPlayer
            key={current.id}
            className="w-full overflow-hidden rounded-xl"
            title={l(current.title)}
            src="https://stream.mux.com/A3VXy02VoUinw01pSeZaghmfBBHnNVYrXk/low.mp4"
            poster={scene("", course.hue, 1280, 720)}
            tracks={[
              { src: captionsDv, srcLang: "dv", label: "ދިވެހި" },
              { src: captionsEn, srcLang: "en", label: "English", default: true },
            ]}
          />

          <div className="gap-3 flex flex-wrap items-center justify-between">
            <Button variant="outline" startIcon="arrow-left" disabled={!prev} onClick={() => prev && go(prev.id)}>
              {tr("Previous", "ކުރީގެ")}
            </Button>
            <div className="gap-2 flex flex-wrap">
              {done.has(current.id) ? null : (
                <Button variant="secondary" startIcon="check" onClick={complete}>
                  {tr("Mark as complete", "ނިމިއްޖެ")}
                </Button>
              )}
              {next ? (
                next.kind === "quiz" ? (
                  <LinkButton href={routes.learning.quiz} endIcon="arrow-right">
                    {tr("Next: quiz", "ދެން: ކުއިޒް")}
                  </LinkButton>
                ) : (
                  <Button endIcon="arrow-right" onClick={() => go(next.id)}>
                    {tr("Next lesson", "ދެން އޮތް ފިލާވަޅު")}
                  </Button>
                )
              ) : null}
            </div>
          </div>

          <Tabs
            listLabel={tr("Lesson", "ފިލާވަޅު")}
            variant="line"
            items={[
              {
                value: "overview",
                label: tr("Overview", "ޚުލާޞާ"),
                content: (
                  <div className="gap-3 pt-2 max-w-prose leading-relaxed grid">
                    <p>
                      {tr(
                        "Every citizen has the right to be served in Dhivehi or English. In this lesson you will see how to ask, record and keep to a person's language choice across counters, phone calls and letters.",
                        "ކޮންމެ ރައްޔިތަކަށް ދިވެހި ނުވަތަ އިނގިރޭސިން ޚިދުމަތް ހޯދުމުގެ ޙައްޤު ލިބިގެންވޭ. މި ފިލާވަޅުގައި، ކައުންޓަރު، ފޯނު އަދި ސިޓީތަކުގައި އެ ފަރާތެއްގެ ބަސް ޚިޔާރު ސުވާލުކޮށް، ރެކޯޑުކޮށް، ތަބާވާނެ ގޮތް ދައްކައިދޭނެ.",
                      )}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {tr(
                        "Captions are available in Dhivehi and English (press C).",
                        "ދިވެހި އަދި އިނގިރޭސި ކެޕްޝަން ލިބޭނެ (C އަށް ފިއްތަވާ).",
                      )}
                    </p>
                  </div>
                ),
              },
              {
                value: "notes",
                label: tr("My notes", "ނޯޓު"),
                content: (
                  <div className="gap-2 pt-2 max-w-2xl grid">
                    <FormField
                      label={tr("Notes for this lesson", "މި ފިލާވަޅުގެ ނޯޓު")}
                      help={tr(
                        "Only you can see your notes. They save as you type.",
                        "ނޯޓު ފެންނާނީ ހަމައެކަނި ތިބާއަށް. ލިޔަމުން ދާއިރު ސޭވްވާނެ.",
                      )}
                      labelAside={<AutosaveIndicator {...autosave} />}
                    >
                      <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} thaanaToggle rows={6} />
                    </FormField>
                  </div>
                ),
              },
              {
                value: "transcript",
                label: tr("Transcript", "ޓްރާންސްކްރިޕްޓް"),
                content: (
                  <ol className="gap-3 pt-2 max-w-prose grid">
                    {[
                      [
                        "0:00",
                        tr(
                          "Most people we serve speak Dhivehi at home.",
                          "އަޅުގަނޑުމެން ޚިދުމަތްދޭ ގިނަ ބައެއް ގޭގައި ވާހަކަދައްކަނީ ދިވެހިން.",
                        ),
                      ],
                      [
                        "0:05",
                        tr(
                          "Many also read English, and some prefer it for forms.",
                          "ގިނަ ބަޔަކަށް އިނގިރޭސި ވެސް ކިޔަވައިލެވޭ، ބައެއް މީހުން ފޯމުތަކަށް އެ ބަސް ބޭނުންކުރާ.",
                        ),
                      ],
                      [
                        "0:10",
                        tr(
                          "Always ask which language they would like, and use it in every letter.",
                          "ބޭނުންވާ ބަސް ސުވާލުކޮށް، ކޮންމެ ސިޓީއެއްގައި އެ ބަސް ބޭނުންކުރައްވާ.",
                        ),
                      ],
                    ].map(([t, text]) => (
                      <li key={t} className="gap-4 flex">
                        <span className="w-10 text-sm shrink-0 font-mono text-muted-foreground" dir="ltr">
                          {t}
                        </span>
                        <span>{text}</span>
                      </li>
                    ))}
                  </ol>
                ),
              },
            ]}
          />
        </div>

        <aside aria-label={tr("Course progress", "ކޯހުގެ ކުރިއެރުން")} className="lg:sticky lg:top-20">
          <Card size="sm" title={l(course.title)} headingLevel={2}>
            <div className="gap-4 px-2 grid">
              <ProgressBar
                className="px-2"
                value={progress}
                label={tr(`${done.size} of ${lessons.length} lessons`, `${lessons.length} ފިލާވަޅުން ${done.size}`)}
              />
              {lessonNav}
            </div>
          </Card>
        </aside>
      </div>
    </CitizenShell>
  )
}
