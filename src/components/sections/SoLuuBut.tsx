'use client'

import { useState } from 'react'
import type { SectionProps } from './types'
import type { LoiChucDayDu } from '@/lib/db/loiChuc'
import { HoaTietTheme } from '@/components/HoaTiet'
import { PopupLoiChuc } from '@/components/PopupLoiChuc'

export function SoLuuBut({ thiep, theme, loiChuc = [] }: SectionProps) {
  const [danhSach, setDanhSach] = useState<LoiChucDayDu[]>(loiChuc)
  const [moPopup, setMoPopup] = useState(false)
  const [daGui, setDaGui] = useState(false)

  function themLoiChuc(loiChucMoi: LoiChucDayDu) {
    setDanhSach((cu) => [loiChucMoi, ...cu])
    setDaGui(true)
  }

  return (
    <section data-section="so-luu-but" className="px-6 py-16">
      <h2
        className="text-center text-2xl"
        style={{ fontFamily: 'var(--font-tieu-de)', color: 'var(--mau-chinh)' }}
      >
        Sổ lưu bút
      </h2>

      {danhSach.length === 0 ? (
        <p className="mt-8 text-center text-sm" style={{ color: 'var(--mau-phu)' }}>
          Chưa có lời chúc nào. Hãy là người đầu tiên gửi lời chúc tới cô dâu chú rể.
        </p>
      ) : (
        <div
          data-testid="lich-su-loi-chuc"
          className="scroll-loi-chuc mx-auto mt-8 max-h-80 max-w-md overflow-y-auto pr-2"
        >
          <ul className="space-y-4">
            {danhSach.map((lc) => (
              <li
                key={lc.id}
                className="rounded-xl border bg-white/25 p-4"
                style={{ borderColor: 'color-mix(in srgb, var(--mau-phu) 45%, transparent)' }}
              >
                <p className="text-sm">{lc.noiDung}</p>
                <p className="mt-2 text-sm" style={{ color: 'var(--mau-chinh)' }}>
                  — {lc.hoTen}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}

      <button
        type="button"
        onClick={() => {
          setDaGui(false)
          setMoPopup(true)
        }}
        className="mx-auto mt-6 block rounded-full px-7 py-3 font-medium text-white shadow-md hover:-translate-y-0.5"
        style={{ backgroundColor: 'var(--mau-chinh)' }}
      >
        Gửi lời chúc
      </button>

      {daGui && (
        <p className="mt-3 text-center text-sm" style={{ color: 'var(--mau-phu)' }}>
          Cảm ơn lời chúc của bạn!
        </p>
      )}

      {moPopup && (
        <PopupLoiChuc
          thiep={thiep}
          onDong={() => setMoPopup(false)}
          onDaGui={themLoiChuc}
        />
      )}

      <HoaTietTheme theme={theme} slot="divider" className="mx-auto mt-10 block h-8 w-40" />
    </section>
  )
}
