/** A logo shape: element name, attributes, children. */
export type EfaasLogoNode = ["g" | "path" | "rect", Record<string, string>, EfaasLogoNode[]]

/** One official eFaas logo: its viewBox and shapes. */
export interface EfaasLogoData {
  viewBox: string
  nodes: EfaasLogoNode[]
}
