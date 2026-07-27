'use client'

import { useState } from 'react'
import type { Invitation } from '@/lib/invitation/types'

/** Vài bản gợi ý để chọn nhanh khi khách không có yêu cầu riêng. */
const GOI_Y = [
  { ten: 'Người ở đừng về (quan họ)', url: '/nhac/nguoi-o-dung-ve.mp3' },
  { ten: 'Bèo dạt mây trôi (hòa tấu)', url: '/nhac/beo-dat-may-troi.mp3' },
  { ten: 'Se chỉ luồn kim (quan họ)', url: '/nhac/se-chi-luon-kim.mp3' },
]

export function ONhac({
  giaTri,
  slug,
  onDoi,
}: {
  giaTri: Invitation['nhac']
  slug: string
  onDoi: (v: Invitation['nhac']) => void
}) {
  const [dangTai, setDangTai] = useState(false)
  const [loi, setLoi] = useState('')

  async function taiLen(e: React.ChangeEvent<HTMLInputElement>) {
    const tep = e.target.files?.[0]
    e.target.value = ''
    if (!tep) return

    setLoi('')
    setDangTai(true)

    const fd = new FormData()
    fd.append('file', tep)
    fd.append('slug', slug)
    const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
    setDangTai(false)

    const data = await res.json().catch(() => ({}))
    if (res.ok) {
      onDoi({ url: data.url, ten: tep.name.replace(/\.mp3$/i, '') })
    } else {
      setLoi(data.loi ?? 'Không tải được tệp nhạc')
    }
  }

  return (
    <div>
      <p className="text-sm text-neutral-500">
        Nhạc chỉ phát sau khi khách bấm Mở thiệp, và tắt được bất cứ lúc nào.
      </p>

      {giaTri ? (
        <div className="mt-2 rounded border p-3">
          <p className="text-sm font-medium">{giaTri.ten}</p>
          <audio controls src={giaTri.url} className="mt-2 w-full" />
          <button
            type="button"
            onClick={() => onDoi(undefined)}
            className="mt-2 text-sm underline"
          >
            Bỏ nhạc này
          </button>
        </div>
      ) : (
        <p className="mt-2 text-sm text-neutral-500">Chưa chọn nhạc. Thiệp sẽ im lặng.</p>
      )}

      <label className="mt-3 block text-sm">
        Tải lên tệp MP3 riêng
        <input
          type="file"
          aria-label="Tệp nhạc"
          accept="audio/mpeg"
          onChange={taiLen}
          className="mt-1 w-full text-sm"
        />
      </label>

      <label className="mt-3 block text-sm">
        Hoặc chọn bản gợi ý
        <select
          aria-label="Bản nhạc gợi ý"
          value=""
          onChange={(e) => {
            const chon = GOI_Y.find((g) => g.url === e.target.value)
            if (chon) onDoi({ ...chon })
          }}
          className="mt-1 w-full rounded border px-3 py-2"
        >
          <option value="">Chọn một bản</option>
          {GOI_Y.map((g) => (
            <option key={g.url} value={g.url}>
              {g.ten}
            </option>
          ))}
        </select>
      </label>

      {dangTai && <p className="mt-1 text-sm">Đang tải lên...</p>}
      {loi && (
        <p role="alert" className="mt-1 text-sm text-red-600">
          {loi}
        </p>
      )}
    </div>
  )
}
