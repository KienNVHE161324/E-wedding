'use client'

import { useEffect, useRef, useState } from 'react'
import type { Invitation } from '@/lib/invitation/types'
import type { LoiChucDayDu } from '@/lib/db/loiChuc'

export function PopupLoiChuc({
  thiep,
  onDong,
  onDaGui,
}: {
  thiep: Invitation
  onDong: () => void
  onDaGui: (loiChuc: LoiChucDayDu) => void
}) {
  const hop = useRef<HTMLDivElement>(null)
  const [dangGui, setDangGui] = useState(false)
  const [loi, setLoi] = useState('')

  useEffect(() => {
    function phim(e: KeyboardEvent) {
      if (e.key === 'Escape') onDong()
    }
    document.addEventListener('keydown', phim)

    const cuonCu = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    hop.current?.focus()

    return () => {
      document.removeEventListener('keydown', phim)
      document.body.style.overflow = cuonCu
    }
  }, [onDong])

  async function gui(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoi('')
    setDangGui(true)

    const fd = new FormData(e.currentTarget)
    const res = await fetch('/api/loi-chuc', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        slug: thiep.slug,
        hoTen: fd.get('hoTen'),
        noiDung: fd.get('noiDung'),
      }),
    })

    setDangGui(false)
    const data = await res.json().catch(() => ({}))
    if (res.ok) {
      onDaGui(data.loiChuc)
      onDong()
    } else {
      setLoi(data.loi ?? 'Không gửi được. Vui lòng thử lại.')
    }
  }

  const o = 'mt-1 w-full rounded border px-3 py-2.5'

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 md:items-center md:p-6"
      onClick={onDong}
    >
      <div
        ref={hop}
        role="dialog"
        aria-modal="true"
        aria-label="Gửi lời chúc"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className="relative max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl border shadow-2xl md:rounded-3xl"
        style={{ backgroundColor: 'var(--mau-nen)', color: 'var(--mau-chu)' }}
      >
        <button
          type="button"
          onClick={onDong}
          aria-label="Đóng"
          className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full border bg-white/70 text-2xl leading-none backdrop-blur-sm"
          style={{ color: 'var(--mau-phu)' }}
        >
          ×
        </button>

        <div className="px-5 pb-8 pt-14 sm:px-10 sm:pb-10">
          <h2
            className="mb-6 text-center text-2xl"
            style={{ fontFamily: 'var(--font-tieu-de)', color: 'var(--mau-chinh)' }}
          >
            Gửi lời chúc
          </h2>

          <form onSubmit={gui} className="space-y-4">
            <div>
              <label htmlFor="loiChucHoTen">Tên của bạn</label>
              <input id="loiChucHoTen" name="hoTen" required maxLength={100} className={o} />
            </div>

            <div>
              <label htmlFor="loiChucNoiDung">Lời chúc</label>
              <textarea
                id="loiChucNoiDung"
                name="noiDung"
                required
                maxLength={1000}
                rows={4}
                placeholder="Chúc hai bạn trăm năm hạnh phúc."
                className={o}
              />
            </div>

            {loi && (
              <p role="alert" className="text-sm" style={{ color: 'var(--mau-chinh)' }}>
                {loi}
              </p>
            )}

            <button
              type="submit"
              disabled={dangGui}
              className="w-full rounded-full py-3 font-medium text-white shadow-md disabled:opacity-60"
              style={{ backgroundColor: 'var(--mau-chinh)' }}
            >
              {dangGui ? 'Đang gửi...' : 'Gửi lời chúc ngay'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
