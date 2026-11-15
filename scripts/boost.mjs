#!/usr/bin/env node
/**
 * Laravel Boost (https://laravel.com/docs/boost) reads guidelines and skills from
 * resources/boost/ in the npm packages a Laravel app depends on directly, and adds
 * them to the app's AGENTS.md / CLAUDE.md and skills folder on `boost:install`.
 *
 * The Onu skill is written once, for the Claude Code plugin
 * (plugins/onu/skills/onu/SKILL.md). This copies it into the package as
 * packages/onu/resources/boost/skills/javaabu-onu/SKILL.md (generated, not in git),
 * named like the other Javaabu packages' skills.
 *
 *   node scripts/boost.mjs           # write the package skill (part of the package build)
 *   node scripts/boost.mjs --check   # fail if a published package doesn't ship its Boost
 *                                    # guideline, skill and llms.txt (CI, after the build)
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs"
import path from "node:path"

const root = path.resolve(import.meta.dirname, "..")
const pluginSkill = path.join(root, "plugins/onu/skills/onu/SKILL.md")
const packageSkill = path.join(root, "packages/onu/resources/boost/skills/javaabu-onu/SKILL.md")

/** The plugin skill with Boost's name and the metadata the other Javaabu skills carry. */
function boostSkill() {
  const source = readFileSync(pluginSkill, "utf8")
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n/.exec(source)
  if (!match || !/^name: onu$/m.test(match[1])) {
    throw new Error(`${path.relative(root, pluginSkill)} must start with front matter containing "name: onu".`)
  }
  const frontMatter = match[1].replace(/^name: onu$/m, "name: javaabu-onu")
  const generated =
    "<!-- Generated from plugins/onu/skills/onu/SKILL.md by scripts/boost.mjs. Edit that file instead. -->\n"
  return `---\n${frontMatter}\nlicense: MIT\nmetadata:\n  author: Javaabu\n---\n\n${generated}${source.slice(match[0].length)}`
}

/** Problems with a published package's AI files; an empty list when it ships them all. */
function problems(dir) {
  const pkg = JSON.parse(readFileSync(path.join(dir, "package.json"), "utf8"))
  if (pkg.private) return []
  const found = []
  const files = pkg.files ?? []
  const shipped = (file) => files.some((entry) => file === entry || file.startsWith(`${entry}/`))
  const guideline = "resources/boost/guidelines/core.blade.php"
  const skills = path.join(dir, "resources/boost/skills")
  const skillFiles = existsSync(skills)
    ? readdirSync(skills).map((name) => `resources/boost/skills/${name}/SKILL.md`)
    : []

  for (const file of ["llms.txt", guideline]) {
    if (!existsSync(path.join(dir, file))) found.push(`${file} is missing`)
    else if (!shipped(file)) found.push(`${file} is not in "files"`)
  }
  if (!skillFiles.length) found.push("resources/boost/skills/<name>/SKILL.md is missing")
  for (const file of skillFiles) {
    if (!shipped(file)) found.push(`${file} is not in "files"`)
    const name = path.basename(path.dirname(file))
    const text = existsSync(path.join(dir, file)) ? readFileSync(path.join(dir, file), "utf8") : ""
    if (!new RegExp(`^---\\r?\\nname: ${name}\\r?\\ndescription: .+`, "m").test(text)) {
      found.push(`${file} needs front matter starting with "name: ${name}" and a description`)
    }
  }
  // Boost compiles guidelines with Blade: {{ }} and @directives would run instead of showing.
  if (existsSync(path.join(dir, guideline))) {
    const text = readFileSync(path.join(dir, guideline), "utf8")
      .replace(/\{\{--[\s\S]*?--\}\}/g, "")
      .replace(/`[^`\n]*`/g, "")
    if (/\{\{|\{!!|(^|\s)@(?!javaabu\/)[a-z]+/m.test(text)) {
      found.push(`${guideline} has Blade syntax outside backticks`)
    }
  }
  return found.map((problem) => `${pkg.name}: ${problem}`)
}

if (process.argv.includes("--check")) {
  const expected = boostSkill()
  const all = readdirSync(path.join(root, "packages"), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .flatMap((entry) => problems(path.join(root, "packages", entry.name)))
  if (existsSync(packageSkill) && readFileSync(packageSkill, "utf8") !== expected) {
    all.push("@javaabu/onu: the Boost skill differs from plugins/onu/skills/onu/SKILL.md; run node scripts/boost.mjs")
  }
  if (all.length) {
    console.error(all.join("\n"))
    process.exit(1)
  }
  console.log("Every package ships its Boost guideline, skill and llms.txt.")
} else {
  mkdirSync(path.dirname(packageSkill), { recursive: true })
  writeFileSync(packageSkill, boostSkill())
  console.log(`Wrote ${path.relative(root, packageSkill)}`)
}
