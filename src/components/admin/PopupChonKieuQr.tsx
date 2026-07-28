'use client'

import { useEffect, useState } from 'react'
import { MauQr } from '@/components/qr/MauQr'
import type { KieuKhungQr } from '@/lib/qr/types'

const CAC_KIEU: { id: KieuKhungQr; ten: string }[] = [
  { id: 'toi-gian', ten: 'Tối giản' },
  { id: 'hoa-mem', ten: 'Hoa mềm' },
  { id: 'phong-bao', ten: 'Phong bao' },
]

export function PopupChonKieuQr({
  giaTri,
  onChon,
  onDong,
}: {
  giaTri: KieuKhungQr
  onChon: (kieu: KieuKhungQr) => void
  onDong: () => void
}) {
  const [dangChon, setDangChon] = useState(giaTri)

  useEffect(() => {
    function bamPhim(event: KeyboardEvent) {
      if (event.key === 'Escape') onDong()
    }
    document.addEventListener('keydown', bamPhim)
    return () => document.removeEventListener('keydown', bamPhim)
  }, [onDong])

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/55 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onDong()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Chọn kiểu QR"
        className="w-full max-w-2xl rounded-2xl bg-white p-5 shadow-2xl"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Chọn kiểu QR</h2>
          <button type="button" onClick={onDong} aria-label="Đóng" className="p-2">
            ×
          </button>
        </div>
        <div className="mt-5 grid grid-cols-3 gap-3">
          {CAC_KIEU.map((kieu) => (
            <label
              key={kieu.id}
              className={`cursor-pointer rounded-xl border p-3 text-center ${
                dangChon === kieu.id ? 'border-black ring-2 ring-black/10' : ''
              }`}
            >
              <input
                type="radio"
                name="kieu-qr"
                value={kieu.id}
                checked={dangChon === kieu.id}
                onChange={() => {
                  setDangChon(kieu.id)
                  onChon(kieu.id)
                }}
                className="sr-only"
                aria-label={kieu.ten}
              />
              <MauQr kieu={kieu.id} />
              <span className="mt-2 block text-sm font-medium">{kieu.ten}</span>
            </label>
          ))}
        </div>
        <button
          type="button"
          onClick={onDong}
          className="mt-5 w-full rounded bg-black py-2.5 text-white"
        >
          Dùng kiểu này
        </button>
      </div>
    </div>
  )
}
