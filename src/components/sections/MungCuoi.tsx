'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import type { SectionProps } from './types'
import type { Ben, OMungCuoi } from '@/lib/invitation/types'
import styles from './MungCuoi.module.css'

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

function PhongBao({ o, onMo }: { o: OMungCuoi; onMo: (o: OMungCuoi) => void }) {
  return (
    <button
      type="button"
      onClick={() => onMo(o)}
      aria-label={`Mở phong bao ${TEN_BEN[o.ben]}`}
      className={`${styles.nutPhongBao} ${o.ben === 'nha-gai' ? styles.lechNhip : ''}`}
    >
      <span className={styles.phongBao} aria-hidden="true">
        <span className={styles.thanPhongBao} />
        <span className={styles.napPhongBao} />
        <span className={styles.conDau}>囍</span>
      </span>
      <span className={styles.goiY}>Chạm để mở</span>
    </button>
  )
}

function PopupMungCuoi({ o, onDong }: { o: OMungCuoi; onDong: () => void }) {
  const nutDongRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const overflowCu = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    nutDongRef.current?.focus()

    function xuLyBanPhim(event: KeyboardEvent) {
      if (event.key === 'Escape') onDong()
    }

    document.addEventListener('keydown', xuLyBanPhim)
    return () => {
      document.body.style.overflow = overflowCu
      document.removeEventListener('keydown', xuLyBanPhim)
    }
  }, [onDong])

  return createPortal(
    <div
      className={styles.nenPopup}
      data-testid="nen-popup-mung-cuoi"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onDong()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Mừng cưới ${TEN_BEN[o.ben]}`}
        className={styles.popup}
      >
        <button
          ref={nutDongRef}
          type="button"
          onClick={onDong}
          aria-label="Đóng"
          className={styles.nutDong}
        >
          ×
        </button>
        <p className={styles.tieuDePopup}>{TEN_BEN[o.ben]}</p>
        <ThongTin o={o} />
      </div>
    </div>,
    document.body,
  )
}

export function MungCuoi({ thiep }: SectionProps) {
  const [dangMo, setDangMo] = useState<OMungCuoi | null>(null)

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
            {thiep.mungCuoiKieuHopQua ? (
              <PhongBao o={o} onMo={setDangMo} />
            ) : (
              <ThongTin o={o} />
            )}
          </div>
        ))}
      </div>
      {dangMo && <PopupMungCuoi o={dangMo} onDong={() => setDangMo(null)} />}
    </section>
  )
}
