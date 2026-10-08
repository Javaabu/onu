import {
  Button,
  Icon,
  Label,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Slider,
  ToggleGroup,
  ToggleGroupItem,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  cn,
  useTheme,
  type Density,
} from "@javaabu/onu"

import { useSettings } from "../settings"

const PRESETS = [
  { name: "Onu green", value: "" },
  { name: "Ocean", value: "oklch(0.55 0.15 240)" },
  { name: "Indigo", value: "oklch(0.51 0.21 275)" },
  { name: "Coral", value: "oklch(0.63 0.19 32)" },
  { name: "Amber", value: "oklch(0.75 0.16 70)" },
  { name: "Neutral", value: "oklch(0.21 0 0)" },
]

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      {children}
    </div>
  )
}

/**
 * The showcase settings (R18.3): direction, primary colour, radius, density and
 * label layout. With `full`, also theme and language (for bare sample pages,
 * which have no docs header).
 */
export function CustomizePanel({ full = false }: { full?: boolean }) {
  const { settings, update } = useSettings()
  const { theme, setTheme } = useTheme()

  return (
    <div className="space-y-4" data-print="hide">
      <div>
        <p className="font-semibold">Customize</p>
        <p className="text-sm text-muted-foreground">Preview Onu with your own theme and settings.</p>
      </div>
      {full ? (
        <>
          <Row label="Theme">
            <ToggleGroup
              type="single"
              variant="outline"
              size="sm"
              value={theme}
              onValueChange={(v) => v && setTheme(v as typeof theme)}
              aria-label="Theme"
            >
              <ToggleGroupItem value="light">
                <Icon name="sun" /> Light
              </ToggleGroupItem>
              <ToggleGroupItem value="dark">
                <Icon name="moon" /> Dark
              </ToggleGroupItem>
              <ToggleGroupItem value="system">
                <Icon name="monitor" /> System
              </ToggleGroupItem>
            </ToggleGroup>
          </Row>
          <Row label="Language">
            <ToggleGroup
              type="single"
              variant="outline"
              size="sm"
              value={settings.locale}
              onValueChange={(v) => v && update({ locale: v as "en" | "dv" })}
              aria-label="Language"
            >
              <ToggleGroupItem value="en" lang="en">
                English
              </ToggleGroupItem>
              <ToggleGroupItem value="dv" lang="dv">
                ދިވެހި
              </ToggleGroupItem>
            </ToggleGroup>
          </Row>
        </>
      ) : null}
      <Row label="Direction">
        <ToggleGroup
          type="single"
          variant="outline"
          size="sm"
          value={settings.dir}
          onValueChange={(v) => v && update({ dir: v as "ltr" | "rtl" | "auto" })}
          aria-label="Direction"
        >
          <ToggleGroupItem value="auto">Auto</ToggleGroupItem>
          <ToggleGroupItem value="ltr">LTR</ToggleGroupItem>
          <ToggleGroupItem value="rtl">RTL</ToggleGroupItem>
        </ToggleGroup>
      </Row>
      <Row label="Primary colour">
        <div className="gap-2 flex flex-wrap">
          {PRESETS.map((p) => (
            <button
              key={p.name}
              type="button"
              title={p.name}
              aria-label={p.name}
              aria-pressed={settings.primary === p.value}
              onClick={() => update({ primary: p.value })}
              className="size-7 rounded-full ring-offset-2 ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none aria-pressed:ring-2 aria-pressed:ring-ring"
              style={{ background: p.value || "oklch(0.53 0.14 150)" }}
            />
          ))}
          <label
            className="size-7 relative cursor-pointer overflow-hidden rounded-full border focus-within:ring-2 focus-within:ring-ring"
            title="Custom"
          >
            <span className="sr-only">Custom colour</span>
            <input
              type="color"
              className="inset-0 absolute size-full cursor-pointer opacity-0"
              onChange={(e) => update({ primary: e.target.value })}
            />
            <Icon name="plus" className="inset-0 size-4 absolute m-auto" />
          </label>
        </div>
      </Row>
      <div className="space-y-2">
        <Label id="customize-radius" className="text-xs font-medium text-muted-foreground">
          Radius ({settings.radius}rem)
        </Label>
        <Slider
          aria-labelledby="customize-radius"
          min={0}
          max={1.25}
          step={0.125}
          value={[settings.radius]}
          onValueChange={([v]) => update({ radius: v ?? 0.625 })}
        />
      </div>
      <Row label="Density">
        <ToggleGroup
          type="single"
          variant="outline"
          size="sm"
          value={settings.density}
          onValueChange={(v) => v && update({ density: v as Density })}
          aria-label="Density"
          className="flex-wrap"
        >
          {(["compact", "default", "comfortable", "touch"] as const).map((d) => (
            <ToggleGroupItem key={d} value={d} className="capitalize">
              {d}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </Row>
      <Row label="Form labels">
        <ToggleGroup
          type="single"
          variant="outline"
          size="sm"
          value={settings.labelLayout}
          onValueChange={(v) => v && update({ labelLayout: v as "stacked" | "inline" })}
          aria-label="Form labels"
        >
          <ToggleGroupItem value="stacked">Stacked</ToggleGroupItem>
          <ToggleGroupItem value="inline">Inline</ToggleGroupItem>
        </ToggleGroup>
      </Row>
      <Button
        variant="ghost"
        size="sm"
        className="w-full"
        onClick={() => update({ dir: "auto", primary: "", radius: 0.625, density: "default", labelLayout: "stacked" })}
      >
        <Icon name="rotate-ccw" /> Reset
      </Button>
    </div>
  )
}

/** Header button that opens the Customize panel. */
export function CustomizeButton({ full = false, className }: { full?: boolean; className?: string }) {
  return (
    <Popover>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className={cn("gap-2", className)} aria-label="Customize">
              <span className="size-3.5 rounded-full bg-primary ring-1 ring-border" aria-hidden />
              <span className="sm:inline hidden">Customize</span>
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent>Direction, primary colour, radius, density and labels</TooltipContent>
      </Tooltip>
      <PopoverContent align="end" className="w-80 max-w-[calc(100vw-2rem)]">
        <CustomizePanel full={full} />
      </PopoverContent>
    </Popover>
  )
}
