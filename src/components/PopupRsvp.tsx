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
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-2xl md:rounded-2xl"
        style={{ backgroundColor: 'var(--mau-nen)', color: 'var(--mau-chu)' }}
      >
        <div className="flex items-center justify-end p-2">
          <button
            type="button"
            onClick={onDong}
            aria-label="Đóng"
            className="h-9 w-9 rounded-full text-xl"
            style={{ color: 'var(--mau-phu)' }}
          >
            ×
          </button>
        </div>

        <div className="px-6 pb-8">
          <FormRsvp thiep={thiep} />
        </div>
      </div>
    </div>
  )
}
