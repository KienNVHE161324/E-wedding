'use client'

import { useState } from 'react'
import type { SectionProps } from './types'
import { cacNgayCoSuKien } from '@/lib/invitation/lich'

const PHUONG_TIEN = ['Xe máy', 'Ô tô riêng', 'Xe khách', 'Xe của gia đình', 'Khác']

export function Rsvp({ thiep }: SectionProps) {
  const [dangGui, setDangGui] = useState(false)
  const [xong, setXong] = useState(false)
  const [loi, setLoi] = useState('')

  const ngayCoThe = cacNgayCoSuKien(thiep.suKien, thiep.ngayCuoi)

  async function guiForm(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoi('')
    setDangGui(true)

    const fd = new FormData(e.currentTarget)
    const res = await fetch('/api/rsvp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        slug: thiep.slug,
        hoTen: fd.get('hoTen'),
        ben: fd.get('ben'),
        quanHe: fd.get('quanHe'),
        phuongTien: fd.get('phuongTien'),
        ngayAn: fd.get('ngayAn'),
        loiChuc: fd.get('loiChuc') || undefined,
      }),
    })

    setDangGui(false)
    if (res.ok) {
      setXong(true)
    } else {
      const data = await res.json().catch(() => ({}))
      setLoi(data.loi ?? 'Không gửi được. Vui lòng thử lại.')
    }
  }

  const o = 'mt-1 w-full rounded border px-3 py-2.5'

  return (
    <section data-section="rsvp" id="rsvp" className="px-6 py-16">
      <h2
        className="mb-8 text-center text-2xl"
        style={{ fontFamily: 'var(--font-tieu-de)', color: 'var(--mau-chinh)' }}
      >
        Xác nhận tham dự
      </h2>

      {xong ? (
        <p className="text-center">Cảm ơn bạn đã xác nhận. Hẹn gặp bạn trong ngày vui!</p>
      ) : (
        <form onSubmit={guiForm} className="mx-auto max-w-md space-y-4">
          <div>
            <label htmlFor="hoTen">Họ và tên</label>
            <input id="hoTen" name="hoTen" required className={o} />
          </div>

          <div>
            <label htmlFor="ben">Bạn là khách của</label>
            <select id="ben" name="ben" required defaultValue="" className={o}>
              <option value="" disabled>Chọn một bên</option>
              <option value="nha-trai">Nhà trai</option>
              <option value="nha-gai">Nhà gái</option>
            </select>
          </div>

          <div>
            <label htmlFor="quanHe">Quan hệ với cô dâu/chú rể</label>
            <input id="quanHe" name="quanHe" required className={o} />
          </div>

          <div>
            <label htmlFor="phuongTien">Phương tiện di chuyển</label>
            <select id="phuongTien" name="phuongTien" required defaultValue="" className={o}>
              <option value="" disabled>Chọn phương tiện</option>
              {PHUONG_TIEN.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="ngayAn">Đến tham dự ngày</label>
            <select id="ngayAn" name="ngayAn" required defaultValue="" className={o}>
              <option value="" disabled>Chọn ngày</option>
              {ngayCoThe.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="loiChuc">Lời chúc (không bắt buộc)</label>
            <textarea id="loiChuc" name="loiChuc" rows={3} className={o} />
          </div>

          {loi && (
            <p role="alert" className="text-sm" style={{ color: 'var(--mau-chinh)' }}>
              {loi}
            </p>
          )}

          <button
            type="submit"
            disabled={dangGui}
            className="w-full rounded-full py-3 text-white disabled:opacity-60"
            style={{ backgroundColor: 'var(--mau-chinh)' }}
          >
            {dangGui ? 'Đang gửi...' : 'Gửi xác nhận'}
          </button>
        </form>
      )}
    </section>
  )
}
