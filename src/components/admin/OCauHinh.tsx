'use client'

import { useRef, useState } from 'react'
import type { Invitation } from '@/lib/invitation/types'
import { taoGoiCauHinh, docGoiCauHinh, tenTepCauHinh } from '@/lib/invitation/cauHinh'

/**
 * Xuất và nhập cấu hình một đám cưới dưới dạng tệp JSON.
 *
 * Dùng để lưu trữ ngoài: ảnh nằm trên Cloudflare R2 theo thư mục trùng mã đám cưới,
 * nên tệp này cộng với thư mục ảnh là đủ để dựng lại thiệp y nguyên.
 */
export function OCauHinh({
  thiep,
  onNhap,
}: {
  thiep: Invitation
  onNhap: (t: Invitation) => void
}) {
  const oTep = useRef<HTMLInputElement>(null)
  const [thongBao, setThongBao] = useState('')
  const [loi, setLoi] = useState('')

  function tai() {
    const luc = new Date()
    const noiDung = JSON.stringify(taoGoiCauHinh(thiep, luc), null, 2)
    const blob = new Blob([noiDung], { type: 'application/json' })
    const url = URL.createObjectURL(blob)

    const a = document.createElement('a')
    a.href = url
    a.download = tenTepCauHinh(thiep.slug, luc)
    a.click()
    URL.revokeObjectURL(url)

    setLoi('')
    setThongBao('Đã tải cấu hình về máy.')
  }

  async function nhap(e: React.ChangeEvent<HTMLInputElement>) {
    const tep = e.target.files?.[0]
    if (!tep) return

    setThongBao('')
    setLoi('')

    try {
      onNhap(docGoiCauHinh(JSON.parse(await tep.text()), thiep.slug))
      setThongBao('Đã nạp cấu hình. Xem lại bên phải rồi bấm Lưu.')
    } catch (e) {
      setLoi(e instanceof Error ? e.message : 'Không đọc được tệp')
    } finally {
      // Cho phép chọn lại đúng tệp đó lần nữa.
      if (oTep.current) oTep.current.value = ''
    }
  }

  return (
    <div>
      <p className="text-sm text-neutral-500">
        Tệp cấu hình cộng với thư mục ảnh <code>{thiep.slug}/</code> trên Cloudflare là đủ để
        dựng lại thiệp này y nguyên.
      </p>

      <div className="mt-3 flex gap-2">
        <button type="button" onClick={tai} className="flex-1 rounded border py-2 text-sm">
          Tải cấu hình
        </button>
        <button
          type="button"
          onClick={() => oTep.current?.click()}
          className="flex-1 rounded border py-2 text-sm"
        >
          Nhập cấu hình
        </button>
      </div>

      <input
        ref={oTep}
        type="file"
        accept="application/json,.json"
        aria-label="Tệp cấu hình"
        onChange={nhap}
        className="hidden"
      />

      {thongBao && <p className="mt-2 text-sm text-green-700">{thongBao}</p>}
      {loi && (
        <p role="alert" className="mt-2 text-sm text-red-600">
          {loi}
        </p>
      )}
    </div>
  )
}
