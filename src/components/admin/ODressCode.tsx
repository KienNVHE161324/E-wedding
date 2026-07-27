'use client'

import type { DressCode } from '@/lib/invitation/types'

const MAU_MOI = '#8B2F20'

export function ODressCode({
  giaTri,
  onDoi,
}: {
  giaTri: DressCode | undefined
  onDoi: (v: DressCode | undefined) => void
}) {
  const dc: DressCode = giaTri ?? { moTa: '', mauSac: [] }

  function sua(thayDoi: Partial<DressCode>) {
    onDoi({ ...dc, ...thayDoi })
  }

  return (
    <div>
      <label className="block text-sm">
        Nội dung
        <input
          aria-label="Nội dung dress code"
          value={dc.moTa}
          onChange={(e) => sua({ moTa: e.target.value })}
          placeholder="Mời quý khách mặc tông đỏ – be"
          className="mt-1 w-full rounded border px-3 py-2"
        />
      </label>

      <p className="mt-3 text-sm">Màu gợi ý</p>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        {dc.mauSac.map((mau, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <input
              type="color"
              aria-label={`Màu gợi ý thứ ${i + 1}`}
              value={mau}
              onChange={(e) =>
                sua({ mauSac: dc.mauSac.map((m, j) => (j === i ? e.target.value : m)) })
              }
              className="h-10 w-10 rounded-full border"
            />
            <button
              type="button"
              aria-label={`Bỏ màu gợi ý thứ ${i + 1}`}
              onClick={() => sua({ mauSac: dc.mauSac.filter((_, j) => j !== i) })}
              className="text-xs underline"
            >
              Bỏ
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={() => sua({ mauSac: [...dc.mauSac, MAU_MOI] })}
          className="h-10 rounded border px-3 text-sm"
        >
          Thêm màu
        </button>
      </div>

      <p className="mt-2 text-sm text-neutral-500">
        Bỏ trống cả hai ô thì phần Dress code tự ẩn khỏi thiệp.
      </p>
    </div>
  )
}
