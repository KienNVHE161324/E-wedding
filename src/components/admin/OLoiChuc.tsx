'use client'

import { useState } from 'react'
import type { LoiChucDayDu } from '@/lib/db/loiChuc'

function ngayVn(iso: string) {
  const d = new Date(iso)
  const p = (n: number) => String(n).padStart(2, '0')
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()}`
}

/** Khách viết là đăng luôn; ở đây chỉ để gỡ những lời phản cảm. */
export function OLoiChuc({ banDau }: { banDau: LoiChucDayDu[] }) {
  const [danhSach, setDanhSach] = useState(banDau)
  const [loi, setLoi] = useState('')

  async function xoa(id: string) {
    setLoi('')
    const res = await fetch('/api/admin/loi-chuc', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })

    if (res.ok) {
      setDanhSach((cu) => cu.filter((lc) => lc.id !== id))
    } else {
      const data = await res.json().catch(() => ({}))
      setLoi(data.loi ?? 'Không xóa được')
    }
  }

  if (danhSach.length === 0) {
    return <p className="text-sm text-neutral-500">Chưa có lời chúc nào.</p>
  }

  return (
    <div>
      <p className="text-sm text-neutral-500">
        {danhSach.length} lời chúc. Khách viết là hiện luôn — xóa ở đây nếu thấy phản cảm.
      </p>

      {loi && (
        <p role="alert" className="mt-2 text-sm text-red-600">
          {loi}
        </p>
      )}

      <ul className="mt-3 space-y-2">
        {danhSach.map((lc) => (
          <li key={lc.id} className="rounded border p-3">
            <p className="text-sm">{lc.noiDung}</p>
            <div className="mt-2 flex items-center gap-3 text-sm">
              <span className="flex-1 text-neutral-500">
                {lc.hoTen} · {ngayVn(lc.ngayGui)}
              </span>
              <button
                type="button"
                aria-label={`Xóa lời chúc của ${lc.hoTen}`}
                onClick={() => xoa(lc.id)}
                className="underline"
              >
                Xóa
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
