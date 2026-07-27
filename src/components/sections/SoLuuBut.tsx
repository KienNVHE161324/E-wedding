'use client'

import { useState } from 'react'
import type { SectionProps } from './types'
import type { LoiChucDayDu } from '@/lib/db/loiChuc'
import { HoaTietTheme } from '@/components/HoaTiet'

export function SoLuuBut({ thiep, theme, loiChuc = [] }: SectionProps) {
  const [danhSach, setDanhSach] = useState<LoiChucDayDu[]>(loiChuc)
  const [dangGui, setDangGui] = useState(false)
  const [loi, setLoi] = useState('')
  const [daGui, setDaGui] = useState(false)

  async function gui(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoi('')
    setDangGui(true)

    const form = e.currentTarget
    const fd = new FormData(form)
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
      // Hiện ngay lời vừa viết, không chờ tải lại trang.
      setDanhSach((cu) => [data.loiChuc, ...cu])
      setDaGui(true)
      form.reset()
    } else {
      setLoi(data.loi ?? 'Không gửi được. Vui lòng thử lại.')
    }
  }

  const o = 'mt-1 w-full rounded border px-3 py-2.5'

  return (
    <section data-section="so-luu-but" className="px-6 py-16">
      <h2
        className="text-center text-2xl"
        style={{ fontFamily: 'var(--font-tieu-de)', color: 'var(--mau-chinh)' }}
      >
        Sổ lưu bút
      </h2>

      <form onSubmit={gui} className="mx-auto mt-6 max-w-md space-y-3">
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
            rows={3}
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
          className="w-full rounded-full py-2.5 text-white disabled:opacity-60"
          style={{ backgroundColor: 'var(--mau-chinh)' }}
        >
          {dangGui ? 'Đang gửi...' : 'Gửi lời chúc'}
        </button>

        {daGui && !loi && (
          <p className="text-center text-sm" style={{ color: 'var(--mau-phu)' }}>
            Cảm ơn lời chúc của bạn!
          </p>
        )}
      </form>

      {danhSach.length === 0 ? (
        <p className="mt-8 text-center text-sm" style={{ color: 'var(--mau-phu)' }}>
          Chưa có lời chúc nào. Hãy là người đầu tiên gửi lời chúc tới cô dâu chú rể.
        </p>
      ) : (
        <ul className="mx-auto mt-8 max-w-md space-y-4">
          {danhSach.map((lc) => (
            <li key={lc.id} className="rounded-lg border p-4" style={{ borderColor: 'var(--mau-phu)' }}>
              <p className="text-sm">{lc.noiDung}</p>
              <p className="mt-2 text-sm" style={{ color: 'var(--mau-chinh)' }}>
                — {lc.hoTen}
              </p>
            </li>
          ))}
        </ul>
      )}

      <HoaTietTheme theme={theme} slot="divider" className="mx-auto mt-10 block h-8 w-40" />
    </section>
  )
}
