'use client'

import { useState } from 'react'
import Image from 'next/image'
import type { Anh } from '@/lib/invitation/types'

export const SO_ANH_TOI_DA = 12
export const SO_ANH_NEN_CO = 6

/** Album nhiều ảnh: tải lên hàng loạt, đổi thứ tự, bỏ từng ảnh. */
export function OAlbum({
  giaTri,
  slug,
  onDoi,
}: {
  giaTri: Anh[]
  slug: string
  onDoi: (v: Anh[]) => void
}) {
  const [dangTai, setDangTai] = useState(0)
  const [loi, setLoi] = useState('')

  async function chonTep(e: React.ChangeEvent<HTMLInputElement>) {
    const tep = Array.from(e.target.files ?? [])
    e.target.value = ''
    if (tep.length === 0) return

    const conLai = SO_ANH_TOI_DA - giaTri.length
    if (conLai <= 0) {
      setLoi(`Album đã đủ ${SO_ANH_TOI_DA} ảnh. Bỏ bớt ảnh cũ trước khi thêm.`)
      return
    }

    setLoi('')
    const canTai = tep.slice(0, conLai)
    if (tep.length > conLai) {
      setLoi(`Chỉ thêm được ${conLai} ảnh nữa, các ảnh sau đã bị bỏ qua.`)
    }

    setDangTai(canTai.length)
    const moi: Anh[] = []

    for (const t of canTai) {
      const fd = new FormData()
      fd.append('file', t)
      fd.append('slug', slug)
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
      const data = await res.json().catch(() => ({}))
      if (res.ok) {
        moi.push({ url: data.url, moTa: `Ảnh cưới ${giaTri.length + moi.length + 1}` })
      } else {
        setLoi(data.loi ?? 'Không tải được một số ảnh')
      }
      setDangTai((n) => n - 1)
    }

    if (moi.length) onDoi([...giaTri, ...moi])
  }

  function doiCho(i: number, huong: -1 | 1) {
    const moi = [...giaTri]
    const j = i + huong
    ;[moi[i], moi[j]] = [moi[j], moi[i]]
    onDoi(moi)
  }

  return (
    <div>
      <p className="text-sm text-neutral-500">
        Nên có {SO_ANH_NEN_CO}–{SO_ANH_TOI_DA} ảnh. Hiện có <strong>{giaTri.length}</strong>.
        {giaTri.length > 0 && giaTri.length < SO_ANH_NEN_CO && ' Còn hơi ít.'}
      </p>

      {giaTri.length > 0 && (
        <ul className="mt-3 grid grid-cols-3 gap-2">
          {giaTri.map((a, i) => (
            <li key={`${a.url}-${i}`} className="rounded border p-1">
              <Image
                src={a.url}
                alt={a.moTa}
                width={160}
                height={160}
                className="h-20 w-full rounded object-cover"
              />
              <div className="mt-1 flex items-center justify-between">
                <button
                  type="button"
                  aria-label={`Chuyển ảnh ${i + 1} lên trước`}
                  disabled={i === 0}
                  onClick={() => doiCho(i, -1)}
                  className="px-1 text-sm disabled:opacity-30"
                >
                  ←
                </button>
                <button
                  type="button"
                  aria-label={`Bỏ ảnh ${i + 1}`}
                  onClick={() => onDoi(giaTri.filter((_, j) => j !== i))}
                  className="text-xs underline"
                >
                  Bỏ
                </button>
                <button
                  type="button"
                  aria-label={`Chuyển ảnh ${i + 1} ra sau`}
                  disabled={i === giaTri.length - 1}
                  onClick={() => doiCho(i, 1)}
                  className="px-1 text-sm disabled:opacity-30"
                >
                  →
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <input
        type="file"
        aria-label="Thêm ảnh vào album"
        accept="image/*"
        multiple
        onChange={chonTep}
        className="mt-3 w-full text-sm"
      />

      {dangTai > 0 && <p className="mt-1 text-sm">Đang tải lên, còn {dangTai} ảnh...</p>}
      {loi && (
        <p role="alert" className="mt-1 text-sm text-red-600">
          {loi}
        </p>
      )}
    </div>
  )
}
