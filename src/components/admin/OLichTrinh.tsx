'use client'

import { useState } from 'react'
import type { Anh, SuKien } from '@/lib/invitation/types'
import { sapXepLichTrinh } from '@/lib/invitation/lich'
import { OAnh } from './OAnh'

/** Gộp ngày và giờ thành một ô duy nhất cho nhân viên đỡ phải điền hai lần. */
function ghepThoiDiem(sk: SuKien): string {
  return `${sk.ngay}T${sk.gio}`
}

function tachThoiDiem(giaTri: string): { ngay: string; gio: string } | null {
  const [ngay, gio] = giaTri.split('T')
  if (!ngay || !gio) return null
  return { ngay, gio: gio.slice(0, 5) }
}

/**
 * Mỗi mốc là một dòng gọn, ba trường: thời điểm, tên mốc, địa điểm.
 * Ảnh bản đồ nằm sau nút mở rộng để danh sách không bị dài, thêm bao nhiêu mốc cũng được.
 */
export function OLichTrinh({
  giaTri,
  ngayCuoi,
  slug,
  onDoi,
}: {
  giaTri: SuKien[]
  /** Mốc mới mặc định rơi vào ngày cưới cho đỡ phải gõ. */
  ngayCuoi: string
  slug: string
  onDoi: (v: SuKien[]) => void
}) {
  const [dangMoAnh, setDangMoAnh] = useState<number | null>(null)

  function sua(i: number, thayDoi: Partial<SuKien>) {
    onDoi(giaTri.map((sk, j) => (j === i ? { ...sk, ...thayDoi } : sk)))
  }

  function them() {
    onDoi([...giaTri, { ngay: ngayCuoi, gio: '09:00', ten: '' }])
  }

  const o = 'w-full rounded border px-2 py-1.5 text-sm'
  const thuTuHienThi = sapXepLichTrinh(giaTri).map((sk) => `${sk.gio} ${sk.ten}`.trim())

  return (
    <div>
      {giaTri.length === 0 ? (
        <p className="text-sm text-neutral-500">
          Chưa có mốc nào. Phần Lịch trình sẽ tự ẩn khỏi thiệp.
        </p>
      ) : (
        <p className="text-sm text-neutral-500">Thứ tự trên thiệp: {thuTuHienThi.join(' → ')}</p>
      )}

      <ul className="mt-2 space-y-2">
        {giaTri.map((sk, i) => (
          <li key={i} className="rounded border p-2">
            <div className="flex gap-2">
              <input
                type="datetime-local"
                aria-label={`Thời điểm mốc ${i + 1}`}
                value={ghepThoiDiem(sk)}
                onChange={(e) => {
                  const t = tachThoiDiem(e.target.value)
                  if (t) sua(i, t)
                }}
                className={`${o} w-44 shrink-0`}
              />
              <input
                aria-label={`Tên mốc ${i + 1}`}
                value={sk.ten}
                onChange={(e) => sua(i, { ten: e.target.value })}
                placeholder="Đón dâu"
                className={o}
              />
            </div>

            <div className="mt-2 flex items-center gap-2">
              <input
                aria-label={`Địa điểm mốc ${i + 1}`}
                value={sk.diaDiem ?? ''}
                onChange={(e) => sua(i, { diaDiem: e.target.value || undefined })}
                placeholder="Địa điểm (không bắt buộc)"
                className={o}
              />
              <button
                type="button"
                aria-label={`Ảnh bản đồ mốc ${i + 1}`}
                onClick={() => setDangMoAnh(dangMoAnh === i ? null : i)}
                className="shrink-0 rounded border px-2 py-1.5 text-sm"
              >
                {sk.banDoAnh ? 'Ảnh ✓' : 'Ảnh'}
              </button>
              <button
                type="button"
                aria-label={`Bỏ mốc ${i + 1}`}
                onClick={() => onDoi(giaTri.filter((_, j) => j !== i))}
                className="shrink-0 px-1 text-sm underline"
              >
                Bỏ
              </button>
            </div>

            {dangMoAnh === i && (
              <div className="mt-2">
                <OAnh
                  nhan={`Ảnh bản đồ mốc ${i + 1}`}
                  slug={slug}
                  giaTri={sk.banDoAnh}
                  onDoi={(a: Anh | undefined) => sua(i, { banDoAnh: a })}
                />
              </div>
            )}
          </li>
        ))}
      </ul>

      <button type="button" onClick={them} className="mt-2 w-full rounded border py-2 text-sm">
        Thêm mốc lịch trình
      </button>
    </div>
  )
}
