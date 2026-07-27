'use client'

/** Thanh trượt chỉnh độ đậm nhạt của họa tiết ở một vị trí. */
export function ThanhDoDam({
  nhan,
  giaTri,
  onDoi,
}: {
  nhan: string
  giaTri: number | undefined
  onDoi: (v: number) => void
}) {
  const v = giaTri ?? 1

  return (
    <div className="flex items-center gap-3">
      <span className="flex-1 text-sm">{nhan}</span>
      <input
        type="range"
        aria-label={nhan}
        min={0}
        max={100}
        step={5}
        value={Math.round(v * 100)}
        onChange={(e) => onDoi(Number(e.target.value) / 100)}
      />
      <span className="w-12 text-right text-sm tabular-nums">{Math.round(v * 100)}%</span>
    </div>
  )
}
