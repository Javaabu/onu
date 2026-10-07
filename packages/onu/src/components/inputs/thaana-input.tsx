"use client"

import type { ThaanaProp } from "../../thaana/use-thaana-field"
import { TextInput, type TextInputProps } from "./text-input"
import { Textarea, type TextareaProps } from "./textarea"

export interface ThaanaInputProps extends Omit<TextInputProps, "thaana"> {
  /** Keyboard options. Thaana is always on for this component. */
  thaana?: Exclude<ThaanaProp, false>
}

/** Text input that types Thaana by default, with a Thaana/Latin toggle (R13.2). */
export function ThaanaInput({ thaana = true, thaanaToggle = true, ...props }: ThaanaInputProps) {
  return <TextInput thaana={thaana} thaanaToggle={thaanaToggle} {...props} />
}

export interface ThaanaTextareaProps extends Omit<TextareaProps, "thaana"> {
  thaana?: Exclude<ThaanaProp, false>
}

/** Textarea that types Thaana by default, with a Thaana/Latin toggle (R13.2). */
export function ThaanaTextarea({ thaana = true, thaanaToggle = true, ...props }: ThaanaTextareaProps) {
  return <Textarea thaana={thaana} thaanaToggle={thaanaToggle} {...props} />
}
