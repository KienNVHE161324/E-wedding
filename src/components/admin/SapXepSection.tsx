'use client'

import type { SectionId, SectionRef } from '@/lib/invitation/types'

export const TEN_SECTION: Record<SectionId, string> = {
  'bia': 'Bìa',
  'dem-nguoc': 'Save the date',
  'co-dau-chu-re': 'Cô dâu & Chú rể',
  'chuyen-chung-minh': 'Chuyện chúng mình',
  'album': 'Album ảnh',
  'su-kien': 'Lịch trình đám cưới',
  'dress-code': 'Dress code',
  'rsvp': 'Xác nhận tham dự',
  'mung-cuoi': 'Mừng cưới',
  'so-luu-but': 'Sổ lưu bút',
}

const TAT_CA = Object.keys(TEN_SECTION) as SectionId[]

/**
 * Bổ sung các phần còn thiếu vào cuối danh sách ở trạng thái tắt,
 * để admin luôn nhìn thấy đủ chín phần và bật lại được bất cứ lúc nào.
 */
function dayDu(giaTri: SectionRef[]): SectionRef[] {
  const coRoi = new Set(giaTri.map((s) => s.id))
  return [
    ...giaTri,
    ...TAT_CA.filter((id) => !coRoi.has(id)).map((id) => ({ id, enabled: false })),
  ]
}

export function SapXepSection({
  giaTri,
  onDoi,
}: {
  giaTri: SectionRef[]
  onDoi: (v: SectionRef[]) => void
}) {
  const danhSach = dayDu(giaTri)

  function doiCho(i: number, huong: -1 | 1) {
    const moi = [...danhSach]
    const j = i + huong
    ;[moi[i], moi[j]] = [moi[j], moi[i]]
    onDoi(moi)
  }

  function batTat(i: number, bat: boolean) {
    onDoi(
      danhSach.map((s, idx) =>
        idx === i ? (bat ? { id: s.id } : { id: s.id, enabled: false }) : s,
      ),
    )
  }

  return (
    <ul className="space-y-2">
      {danhSach.map((s, i) => (
        <li key={s.id} className="flex items-center gap-3 rounded border p-2">
          <input
            type="checkbox"
            aria-label={`Hiện phần ${TEN_SECTION[s.id]}`}
            checked={s.enabled !== false}
            onChange={(e) => batTat(i, e.target.checked)}
          />
          <span className="flex-1">{TEN_SECTION[s.id]}</span>
          <button
            type="button"
            aria-label="Chuyển lên"
            disabled={i === 0}
            onClick={() => doiCho(i, -1)}
            className="h-8 w-8 rounded border disabled:opacity-30"
          >
            ↑
          </button>
          <button
            type="button"
            aria-label="Chuyển xuống"
            disabled={i === danhSach.length - 1}
            onClick={() => doiCho(i, 1)}
            className="h-8 w-8 rounded border disabled:opacity-30"
          >
            ↓
          </button>
        </li>
      ))}
    </ul>
  )
}
