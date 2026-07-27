'use client'

import type {
  CauHinhRsvp,
  TruongRsvpChuan,
  TruongRsvpTuyChinh,
} from '@/lib/invitation/types'

const TRUONG_CHUAN: { id: TruongRsvpChuan; nhan: string }[] = [
  { id: 'hoTen', nhan: 'Họ và tên' },
  { id: 'ben', nhan: 'Khách nhà trai / nhà gái' },
  { id: 'quanHe', nhan: 'Quan hệ với cô dâu/chú rể' },
  { id: 'ngayAn', nhan: 'Ngày tham dự' },
  { id: 'phuongTien', nhan: 'Phương tiện di chuyển' },
  { id: 'loiChuc', nhan: 'Lời chúc' },
]

const MAC_DINH: CauHinhRsvp = {
  truongChuan: ['hoTen', 'ben', 'quanHe', 'ngayAn'],
  truongTuyChinh: [],
}

function taoId(nhan: string, dangCo: Set<string>): string {
  const goc = nhan
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'truong-moi'
  let id = goc
  let i = 2
  while (dangCo.has(id)) id = `${goc}-${i++}`
  return id
}

export function ORsvp({
  giaTri,
  onDoi,
}: {
  giaTri?: CauHinhRsvp
  onDoi: (v: CauHinhRsvp) => void
}) {
  const cauHinh = giaTri ?? MAC_DINH
  const tuyChinh = cauHinh.truongTuyChinh ?? []
  const o = 'mt-1 w-full rounded border px-2 py-1.5'

  function suaTuyChinh(index: number, patch: Partial<TruongRsvpTuyChinh>) {
    onDoi({
      ...cauHinh,
      truongTuyChinh: tuyChinh.map((t, i) => i === index ? { ...t, ...patch } : t),
    })
  }

  function them() {
    const dangCo = new Set(tuyChinh.map((t) => t.id))
    onDoi({
      ...cauHinh,
      truongTuyChinh: [
        ...tuyChinh,
        { id: taoId('Trường mới', dangCo), nhan: 'Trường mới', kieu: 'text' },
      ],
    })
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-neutral-500">
        Chọn trường chuẩn cần hỏi. Bạn có thể thêm câu hỏi riêng bên dưới.
      </p>
      <div className="grid grid-cols-1 gap-2">
        {TRUONG_CHUAN.map((t) => (
          <label key={t.id} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={cauHinh.truongChuan.includes(t.id)}
              onChange={(e) => onDoi({
                ...cauHinh,
                truongChuan: e.target.checked
                  ? [...cauHinh.truongChuan, t.id]
                  : cauHinh.truongChuan.filter((id) => id !== t.id),
              })}
            />
            {t.nhan}
          </label>
        ))}
      </div>

      {tuyChinh.map((t, index) => (
        <div key={t.id} className="rounded border p-3">
          <label className="block text-sm">
            Tên câu hỏi
            <input
              aria-label={`Tên trường tùy chỉnh ${index + 1}`}
              className={o}
              value={t.nhan}
              onChange={(e) => suaTuyChinh(index, {
                nhan: e.target.value,
                id: taoId(e.target.value, new Set(tuyChinh.filter((_, i) => i !== index).map((x) => x.id))),
              })}
            />
          </label>
          <label className="mt-2 block text-sm">
            Kiểu trả lời
            <select
              aria-label={`Kiểu trường tùy chỉnh ${index + 1}`}
              className={o}
              value={t.kieu}
              onChange={(e) => suaTuyChinh(index, {
                kieu: e.target.value as TruongRsvpTuyChinh['kieu'],
                luaChon: e.target.value === 'select' ? (t.luaChon ?? ['Có', 'Không']) : undefined,
              })}
            >
              <option value="text">Một dòng</option>
              <option value="textarea">Đoạn văn</option>
              <option value="select">Danh sách lựa chọn</option>
            </select>
          </label>
          {t.kieu === 'select' && (
            <label className="mt-2 block text-sm">
              Các lựa chọn (mỗi dòng một mục)
              <textarea
                aria-label={`Lựa chọn trường tùy chỉnh ${index + 1}`}
                className={o}
                rows={3}
                value={(t.luaChon ?? []).join('\n')}
                onChange={(e) => suaTuyChinh(index, {
                  luaChon: e.target.value.split('\n').map((x) => x.trim()).filter(Boolean),
                })}
              />
            </label>
          )}
          <div className="mt-2 flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={t.batBuoc ?? false}
                onChange={(e) => suaTuyChinh(index, { batBuoc: e.target.checked })}
              />
              Bắt buộc
            </label>
            <button
              type="button"
              className="text-sm text-red-700 underline"
              onClick={() => onDoi({
                ...cauHinh,
                truongTuyChinh: tuyChinh.filter((_, i) => i !== index),
              })}
            >
              Xóa
            </button>
          </div>
        </div>
      ))}

      <button type="button" onClick={them} className="w-full rounded border py-2 text-sm">
        + Thêm trường tùy chỉnh
      </button>
    </div>
  )
}
