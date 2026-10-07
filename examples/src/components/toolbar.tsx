import {
  Button,
  Icon,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Label,
  Slider,
  ToggleGroup,
  ToggleGroupItem,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
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

/** Global showcase toolbar: theme, direction, locale, primary colour, density (R18.3). */
export function Toolbar() {
  const { settings, update } = useSettings()
  const { theme, setTheme } = useTheme()

  return (
    <div className="gap-2 flex flex-wrap items-center" data-print="hide">
      <ToggleGroup
        type="single"
        variant="outline"
        size="sm"
        value={theme}
        onValueChange={(v) => v && setTheme(v as typeof theme)}
        aria-label="Theme"
      >
        <ToggleGroupItem value="light" aria-label="Light">
          <Icon name="sun" />
        </ToggleGroupItem>
        <ToggleGroupItem value="dark" aria-label="Dark">
          <Icon name="moon" />
        </ToggleGroupItem>
        <ToggleGroupItem value="system" aria-label="System">
          <Icon name="monitor" />
        </ToggleGroupItem>
      </ToggleGroup>

      <ToggleGroup
        type="single"
        variant="outline"
        size="sm"
        value={settings.locale}
        onValueChange={(v) => v && update({ locale: v as "en" | "dv" })}
        aria-label="Language"
      >
        <ToggleGroupItem value="en">EN</ToggleGroupItem>
        <ToggleGroupItem value="dv" lang="dv">
          ދިވެހި
        </ToggleGroupItem>
      </ToggleGroup>

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

      <Popover>
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" aria-label="Theme settings">
                <span className="size-3.5 rounded-full bg-primary" aria-hidden />
                <Icon name="settings" />
              </Button>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent>Primary colour, radius and density</TooltipContent>
        </Tooltip>
        <PopoverContent align="end" className="w-72 space-y-4">
          <div className="space-y-2">
            <Label>Primary colour</Label>
            <div className="gap-2 flex flex-wrap">
              {PRESETS.map((p) => (
                <button
                  key={p.name}
                  type="button"
                  title={p.name}
                  aria-label={p.name}
                  aria-pressed={settings.primary === p.value}
                  onClick={() => update({ primary: p.value })}
                  className="size-7 rounded-full ring-offset-2 ring-offset-background aria-pressed:ring-2 aria-pressed:ring-ring"
                  style={{ background: p.value || "oklch(0.53 0.14 150)" }}
                />
              ))}
              <label className="size-7 relative cursor-pointer overflow-hidden rounded-full border" title="Custom">
                <span className="sr-only">Custom colour</span>
                <input
                  type="color"
                  className="inset-0 absolute size-full cursor-pointer opacity-0"
                  onChange={(e) => update({ primary: e.target.value })}
                />
                <Icon name="plus" className="inset-0 size-4 absolute m-auto" />
              </label>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Radius ({settings.radius}rem)</Label>
            <Slider
              min={0}
              max={1.25}
              step={0.125}
              value={[settings.radius]}
              onValueChange={([v]) => update({ radius: v ?? 0.625 })}
            />
          </div>
          <div className="space-y-2">
            <Label>Density</Label>
            <ToggleGroup
              type="single"
              variant="outline"
              size="sm"
              value={settings.density}
              onValueChange={(v) => v && update({ density: v as Density })}
              className="flex-wrap"
            >
              {(["compact", "default", "comfortable", "touch"] as const).map((d) => (
                <ToggleGroupItem key={d} value={d} className="capitalize">
                  {d}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
          <div className="space-y-2">
            <Label>Form labels</Label>
            <ToggleGroup
              type="single"
              variant="outline"
              size="sm"
              value={settings.labelLayout}
              onValueChange={(v) => v && update({ labelLayout: v as "stacked" | "inline" })}
            >
              <ToggleGroupItem value="stacked">Stacked</ToggleGroupItem>
              <ToggleGroupItem value="inline">Inline</ToggleGroupItem>
            </ToggleGroup>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
