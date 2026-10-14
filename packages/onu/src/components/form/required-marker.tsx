import { cn } from "../../lib/utils"
import { useTranslation } from "../../providers/onu-provider"
import { registerEnglish } from "../../i18n/english"
import { common as en_common } from "../../locales/en/common"

registerEnglish({ common: en_common })

export interface RequiredMarkerProps extends React.ComponentProps<"span"> {
  /** Marker character. Default `*`. */
  symbol?: string
}

/** Visual "required" marker. Hidden from screen readers: controls carry `aria-required` instead. */
export function RequiredMarker({ symbol = "*", className, ...props }: RequiredMarkerProps) {
  const { t } = useTranslation()
  return (
    <span
      data-slot="required-marker"
      aria-hidden="true"
      title={t("common.required")}
      className={cn("text-destructive", className)}
      {...props}
    >
      {symbol}
    </span>
  )
}
