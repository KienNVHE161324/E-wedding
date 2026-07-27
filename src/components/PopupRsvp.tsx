'use client'

import { useEffect, useRef } from 'react'
import type { Invitation } from '@/lib/invitation/types'
import { FormRsvp } from './FormRsvp'

/** Popup chứa form xác nhận tham dự. Đóng bằng nút, phím Esc, hoặc chạm ra ngoài. */
export function PopupRsvp({ thiep, onDong }: { thiep: Invitation; onDong: () => void }) {
  const hop = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function phim(e: KeyboardEvent) {
      if (e.key === 'Escape') onDong()
    }
    document.addEventListener('keydown', phim)

    // Khóa cuộn nền để khách không cuộn lạc khi đang điền form.
    const cuonCu = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    hop.current?.focus()

    return () => {
      document.removeEventListener('keydown', phim)
      document.body.style.overflow = cuonCu
    }
  }, [onDong])

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 md:items-center md:p-6"
      onClick={onDong}
    >
      <div
        ref={hop}
        role="dialog"
        aria-modal="true"
        aria-label="Xác nhận tham dự"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className="relative max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl border shadow-2xl md:rounded-3xl"
        style={{ backgroundColor: 'var(--mau-nen)', color: 'var(--mau-chu)' }}
      >
        <button
          type="button"
          onClick={onDong}
          aria-label="Đóng"
          className="absolute right-4 top-4 z-10 grid h-10 w-10 place-items-center rounded-full border bg-white/70 text-2xl leading-none backdrop-blur-sm"
          style={{ color: 'var(--mau-phu)', borderColor: 'color-mix(in srgb, var(--mau-phu) 25%, transparent)' }}
        >
          ×
        </button>

        <div className="px-5 pb-8 pt-14 sm:px-10 sm:pb-10">
          <FormRsvp thiep={thiep} />
        </div>
      </div>
    </div>
  )
}
