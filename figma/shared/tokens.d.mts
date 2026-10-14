export interface Oklab {
  L: number
  a: number
  b: number
  alpha: number
}
export interface Rgba {
  r: number
  g: number
  b: number
  a: number
}
export type VariableValueType = "COLOR" | "FLOAT"
export interface VariableSpec {
  name: string
  type: VariableValueType
  /** Value per mode name. */
  values: Record<string, Rgba | number>
  codeSyntax: { WEB: string }
  description?: string
}
export interface CollectionSpec {
  name: string
  modes: string[]
  variables: VariableSpec[]
}
export interface DesignTokens {
  brand: { primary: { $value: string; $description?: string } }
  color: { light: Record<string, { $value: string; $description?: string }>; dark: Record<string, { $value: string }> }
  radius: { base: { $value: string; $description?: string } }
  density: Record<string, { $value: string; $description?: string }>
  size: Record<string, { $value: string; $description?: string }>
  font: Record<string, { $value: string[] }>
  typography: Record<string, { $value: string }>
}

export function parseColor(value: string): Oklab
export function srgbToOklab(rgb: { r: number; g: number; b: number; a?: number }): Oklab
export function oklabToRgba(color: Oklab): Rgba
export function oklchToRgba(value: string): Rgba
export function mixOklab(x: Oklab, y: Oklab, p: number): Oklab
export function rgbaToHex(color: { r: number; g: number; b: number }): string
export function primaryScale(primary: string, background: string, mode: "Light" | "Dark"): Record<string, Oklab>
export const SPACING_STEPS: number[]
export function spacingName(step: number): string
export const RADIUS_SCALE: Record<string, number>
export const DENSITY_MODES: string[]
export function buildCollections(tokens: DesignTokens, options?: { primary?: string }): CollectionSpec[]
