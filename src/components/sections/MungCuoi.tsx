'use client'

import { useState } from 'react'
import Image from 'next/image'
import type { SectionProps } from './types'
import type { Ben, OMungCuoi } from '@/lib/invitation/types'

const TEN_BEN: Record<Ben, string> = {
  'nha-trai': 'Nhà trai',
  'nha-gai': 'Nhà gái',
}

function ThongTin({ o }: { o: OMungCuoi }) {
  return (
    <>
      {o.qrAnh && (
        <Image
          src={o.qrAnh.url}
          alt={o.qrAnh.moTa}
          width={220}
          height={220}
          className="mx-auto h-28 w-28 object-contain md:h-36 md:w-36"
        />
      )}
      <p className="mt-3 text-sm font-medium">{o.chuTaiKhoan}</p>
      <p className="text-sm" style={{ color: 'var(--mau-phu)' }}>
        {o.nganHang}
      </p>
      <p className="mt-1 text-sm tracking-wider">{o.soTaiKhoan}</p>
      <button
        type="button"
        onClick={() => navigator.clipboard?.writeText(o.soTaiKhoan)}
        className="mt-3 rounded-full border px-4 py-1.5 text-sm"
        style={{ borderColor: 'var(--mau-phu)', color: 'var(--mau-phu)' }}
      >
        Chép số tài khoản
      </button>
    </>
  )
}

/** Hộp quà đóng, chạm vào mới mở ra thông tin chuyển khoản. */
function HopQua({ o }: { o: OMungCuoi }) {
  const [daMo, setDaMo] = useState(false)

  if (daMo) return <ThongTin o={o} />

  return (
    <button
      type="button"
      onClick={() => setDaMo(true)}
      aria-label={`Mở hộp quà ${TEN_BEN[o.ben]}`}
      className="mx-auto flex aspect-square w-full max-w-36 flex-col items-center justify-center rounded-lg border-2 transition-transform hover:scale-105"
      style={{ borderColor: 'var(--mau-chinh)', color: 'var(--mau-chinh)' }}
    >
      <span className="text-4xl" aria-hidden="true">
        🎁
      </span>
      <span className="mt-2 text-sm">Chạm để mở</span>
    </button>
  )
}

export function MungCuoi({ thiep }: SectionProps) {
  if (thiep.mungCuoi.length === 0) return null

  return (
    <section data-section="mung-cuoi" className="px-6 py-16 text-center">
      <h2
        className="text-2xl"
        style={{ fontFamily: 'var(--font-tieu-de)', color: 'var(--mau-chinh)' }}
      >
        Mừng cưới
      </h2>

      {/* Hai bên luôn nằm cạnh nhau trên một dòng, kể cả trên điện thoại. */}
      <div className="mt-6 flex items-start gap-3 md:gap-8">
        {thiep.mungCuoi.map((o) => (
          <div key={o.ben} className="flex-1">
            <p className="mb-3 text-sm tracking-widest" style={{ color: 'var(--mau-phu)' }}>
              {TEN_BEN[o.ben]}
            </p>
            {thiep.mungCuoiKieuHopQua ? <HopQua o={o} /> : <ThongTin o={o} />}
          </div>
        ))}
      </div>
    </section>
  )
}
