/**
 * "Onu kit" Figma plugin entry. Bundled to figma/plugin/code.js by build.mjs;
 * tokens.json and the package version are embedded at build time.
 */
import onuPackage from "../../../packages/onu/package.json"
import tokens from "../../../tokens.json"
import type { DesignTokens } from "../../shared/tokens.mjs"
import { generateKit } from "./generate"

type UiMessage = { type: "generate"; primary?: string; samples?: boolean } | { type: "close" }

figma.showUI(__html__, { width: 480, height: 640, themeColors: true })
figma.ui.postMessage({ type: "init", primary: tokens.brand.primary.$value, version: onuPackage.version })

figma.ui.onmessage = async (message: UiMessage) => {
  if (message.type === "close") {
    figma.closePlugin()
    return
  }
  if (message.type !== "generate") return
  const log = (text: string) => figma.ui.postMessage({ type: "log", text })
  try {
    const result = await generateKit(
      tokens as unknown as DesignTokens,
      { primary: message.primary || undefined, samples: message.samples, version: onuPackage.version },
      log,
    )
    figma.ui.postMessage({ type: "done", result })
    figma.notify(`Onu kit: ${result.stats.componentSets} component sets, ${result.stats.variants} variants.`)
  } catch (error) {
    const text = error instanceof Error ? `${error.message}\n${error.stack ?? ""}` : String(error)
    figma.ui.postMessage({ type: "error", text })
    figma.notify("Onu kit failed; see the plugin window.", { error: true })
  }
}
