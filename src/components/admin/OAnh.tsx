'use client'

import { useState } from 'react'
import Image from 'next/image'
import type { Anh } from '@/lib/invitation/types'

/** Một ô ảnh độc lập: tải lên, sửa mô tả, bỏ ảnh. Dùng lại cho mọi vị trí ảnh. */
export function OAnh({
  nhan,
  slug,
  giaTri,
  onDoi,
}: {
  nhan: string
  slug: string
  giaTri?: Anh
  onDoi: (a: Anh | undefined) => void
}) {
  const [dangTai, setDangTai] = useState(false)
  const [loi, setLoi] = useState('')

  async function chonTep(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setLoi('')
    setDangTai(true)
    const fd = new FormData()
    fd.append('file', file)
    fd.append('slug', slug)

    const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
    setDangTai(false)

    const data = await res.json().catch(() => ({}))
    if (res.ok) {
      onDoi({ url: data.url, moTa: giaTri?.moTa ?? nhan })
    } else {
      setLoi(data.loi ?? 'Không tải được tệp lên')
    }
  }

  return (
    <div className="rounded border p-3">
      <p className="text-sm font-medium">{nhan}</p>

      {giaTri && (
        <Image
          src={giaTri.url}
          alt={giaTri.moTa}
          width={160}
          height={160}
          className="mt-2 h-24 w-24 rounded object-cover"
        />
      )}

      <input
        type="file"
        aria-label={`Chọn tệp cho ${nhan}`}
        accept="image/*,audio/mpeg"
        onChange={chonTep}
        className="mt-2 text-sm"
      />
      {dangTai && <p className="text-sm">Đang tải lên...</p>}
      {loi && (
        <p role="alert" className="text-sm text-red-600">
          {loi}
        </p>
      )}

      {giaTri && (
        <>
          <input
            aria-label={`Mô tả ảnh ${nhan}`}
            className="mt-2 w-full rounded border px-2 py-1 text-sm"
            placeholder="Mô tả ảnh (cho người khiếm thị)"
            value={giaTri.moTa}
            onChange={(e) => onDoi({ ...giaTri, moTa: e.target.value })}
          />
          <button type="button" onClick={() => onDoi(undefined)} className="mt-2 text-sm underline">
            Bỏ ảnh này
          </button>
        </>
      )}
    </div>
  )
}
