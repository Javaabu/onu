/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GOOGLE_MAPS_API_KEY?: string
  readonly VITE_GOOGLE_MAPS_MAP_ID?: string
  /** "1" forces the Google Maps adapter without an API key (local verification only). */
  readonly VITE_GOOGLE_MAPS_FORCE?: string
}

declare module "virtual:onu-docs" {
  /** Every docs page served as `docs/<path>.md`, e.g. `text-inputs/password-input`. */
  export const docPaths: string[]
}
