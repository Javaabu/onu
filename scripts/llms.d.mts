export interface LlmsPage {
  path: string
  title: string
  description: string
  position: number
  content: string
}
export interface LlmsSection {
  id: string
  title: string
  description?: string
  pages: LlmsPage[]
}
export function collectDocs(): LlmsSection[]
export function buildLlms(options?: { siteUrl?: string }): Record<string, string>
export function writeLlms(outDir: string, options?: { siteUrl?: string }): number
