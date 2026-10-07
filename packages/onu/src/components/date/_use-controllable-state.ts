import * as React from "react"

/**
 * State that can be controlled (`value` given) or uncontrolled (`defaultValue`).
 * `undefined` means uncontrolled; `null` is a real, empty value.
 */
export function useControllableState<T>(
  value: T | undefined,
  defaultValue: T,
  onChange?: (value: T) => void,
): [T, (next: T) => void] {
  const [internal, setInternal] = React.useState<T>(defaultValue)
  const controlled = value !== undefined
  const current = controlled ? value : internal
  const onChangeRef = React.useRef(onChange)
  React.useEffect(() => {
    onChangeRef.current = onChange
  })
  const set = React.useCallback(
    (next: T) => {
      if (!controlled) setInternal(next)
      onChangeRef.current?.(next)
    },
    [controlled],
  )
  return [current, set]
}
