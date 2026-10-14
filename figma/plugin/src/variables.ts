import { buildCollections, type DesignTokens } from "../../shared/tokens.mjs"

export interface VariableRegistry {
  /** Variables by name ("brand/primary", "semantic/border", "spacing/3_75", …). */
  byName: Map<string, Variable>
  /** Collections by name ("Onu / Color", …). */
  collections: Map<string, VariableCollection>
  /** Mode ids by collection name and mode name. */
  modes: Map<string, Map<string, string>>
  created: number
  updated: number
}

/**
 * Creates or updates the "Onu / Color", "Onu / Density" and "Onu / Shape"
 * collections. Collections, modes and variables are matched by name, so a re-run
 * updates values in place and keeps every binding that points at them.
 */
export async function ensureVariables(tokens: DesignTokens, options: { primary?: string } = {}) {
  const registry: VariableRegistry = {
    byName: new Map(),
    collections: new Map(),
    modes: new Map(),
    created: 0,
    updated: 0,
  }
  const specs = buildCollections(tokens, options)
  const existingCollections = await figma.variables.getLocalVariableCollectionsAsync()
  const existingVariables = await figma.variables.getLocalVariablesAsync()

  for (const spec of specs) {
    let collection = existingCollections.find((c) => c.name === spec.name)
    if (!collection) collection = figma.variables.createVariableCollection(spec.name)
    registry.collections.set(spec.name, collection)

    // Modes: the first spec mode reuses the collection's default mode (renamed if needed).
    const modeIds = new Map<string, string>()
    spec.modes.forEach((modeName, index) => {
      const found = collection.modes.find((m) => m.name === modeName)
      if (found) {
        modeIds.set(modeName, found.modeId)
      } else if (index === 0) {
        collection.renameMode(collection.defaultModeId, modeName)
        modeIds.set(modeName, collection.defaultModeId)
      } else {
        modeIds.set(modeName, collection.addMode(modeName))
      }
    })
    registry.modes.set(spec.name, modeIds)

    for (const v of spec.variables) {
      let variable = existingVariables.find((x) => x.name === v.name && x.variableCollectionId === collection.id)
      if (variable && variable.resolvedType !== v.type) {
        variable.remove()
        variable = undefined
      }
      if (variable) registry.updated++
      else {
        variable = figma.variables.createVariable(v.name, collection, v.type)
        registry.created++
      }
      for (const [modeName, value] of Object.entries(v.values)) {
        const modeId = modeIds.get(modeName)
        if (modeId) variable.setValueForMode(modeId, value)
      }
      variable.setVariableCodeSyntax("WEB", v.codeSyntax.WEB)
      if (v.description) variable.description = v.description
      variable.scopes = scopesFor(v.name, v.type)
      registry.byName.set(v.name, variable)
    }
  }
  return registry
}

function scopesFor(name: string, type: string): VariableScope[] {
  if (type === "COLOR") {
    if (/(border|input)$/.test(name)) return ["STROKE_COLOR", "FRAME_FILL", "SHAPE_FILL"]
    if (/foreground$/.test(name)) return ["TEXT_FILL", "FRAME_FILL", "SHAPE_FILL", "STROKE_COLOR"]
    return ["ALL_FILLS", "STROKE_COLOR", "EFFECT_COLOR"]
  }
  if (name.startsWith("spacing/")) return ["GAP", "WIDTH_HEIGHT"]
  if (name.startsWith("radius/")) return ["CORNER_RADIUS"]
  return ["WIDTH_HEIGHT"]
}
