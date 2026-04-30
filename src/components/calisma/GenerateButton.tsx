'use client'

interface Props {
  label: string
  loadingLabel: string
  regenerateLabel: string
  disabled?: boolean
  loading: boolean
  hasContent: boolean
  onClick?: () => void
}

export function ProgressBar() {
  return (
    <div className="h-0.5 w-full bg-[#2E75B6]/15 rounded-full overflow-hidden">
      <div className="h-full w-full bg-[#2E75B6]/60 animate-pulse rounded-full" />
    </div>
  )
}

export default function GenerateButton({
  label,
  loadingLabel,
  regenerateLabel,
  disabled = false,
  loading,
  hasContent,
  onClick,
}: Props) {
  const isDisabled = disabled || loading
  const buttonText = loading ? loadingLabel : hasContent ? regenerateLabel : label

  let cls: string
  if (loading) {
    cls = 'bg-[#1F3864] text-white cursor-wait'
  } else if (disabled) {
    cls = 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-[0.55]'
  } else if (hasContent) {
    cls = 'bg-white border border-[#2E75B6]/50 text-[#1F3864] hover:bg-[#EEF4FB]'
  } else {
    cls = 'bg-[#1F3864] text-white hover:bg-[#2E75B6]'
  }

  return (
    <button
      type="button"
      disabled={isDisabled}
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-md h-[34px] px-3.5 text-xs font-medium transition ${cls}`}
    >
      {loading && (
        <span
          className="w-3 h-3 rounded-full border-2 border-white/30 border-t-white animate-spin shrink-0"
          aria-hidden="true"
        />
      )}
      {buttonText}
    </button>
  )
}
