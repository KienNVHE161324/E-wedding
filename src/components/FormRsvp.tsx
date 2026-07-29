'use client'

import { useState } from 'react'
import type { Invitation } from '@/lib/invitation/types'
import { cacNgayCoSuKien } from '@/lib/invitation/lich'
import { VungChu } from './text/VungChu'

const PHUONG_TIEN = ['Xe máy', 'Ô tô riêng', 'Xe khách', 'Xe của gia đình', 'Khác']
const TRUONG_MAC_DINH = ['hoTen', 'ben', 'quanHe', 'ngayAn'] as const

/** Form xác nhận tham dự. Dùng trong popup, tách riêng để phần thiệp không phình ra. */
export function FormRsvp({ thiep }: { thiep: Invitation }) {
  const [dangGui, setDangGui] = useState(false)
  const [xong, setXong] = useState(false)
  const [loi, setLoi] = useState('')

  const ngayCoThe = cacNgayCoSuKien(thiep.suKien, thiep.ngayCuoi, thiep.ngayPhu)

  async function guiForm(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoi('')
    setDangGui(true)

    const fd = new FormData(e.currentTarget)
    const tuyChinh = Object.fromEntries(
      (thiep.cauHinhRsvp?.truongTuyChinh ?? []).map((t) => [t.id, String(fd.get(`custom-${t.id}`) ?? '')]),
    )
    const res = await fetch('/api/rsvp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        slug: thiep.slug,
        hoTen: fd.get('hoTen') || undefined,
        ben: fd.get('ben') || undefined,
        quanHe: fd.get('quanHe') || undefined,
        phuongTien: fd.get('phuongTien') || undefined,
        ngayAn: fd.get('ngayAn') || undefined,
        loiChuc: fd.get('loiChuc') || undefined,
        tuyChinh,
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
  const truong = new Set(thiep.cauHinhRsvp?.truongChuan ?? TRUONG_MAC_DINH)

  if (xong) {
    return (
      <div className="py-6 text-center">
        <h2 className="text-xl" style={{ fontFamily: 'var(--font-tieu-de)', color: 'var(--mau-chinh)' }}>
          <VungChu
            id="popup-rsvp.tieu-de"
            thiep={thiep}
            noiDung="Xác nhận tham dự"
          />
        </h2>
        <p className="mt-3">Cảm ơn bạn đã xác nhận. Hẹn gặp bạn trong ngày vui!</p>
      </div>
    )
  }

  return (
    <>
      <h2
        className="mb-2 text-center text-2xl"
        style={{ fontFamily: 'var(--font-tieu-de)', color: 'var(--mau-chinh)' }}
      >
        <VungChu
          id="popup-rsvp.tieu-de"
          thiep={thiep}
          noiDung="Xác nhận tham dự"
        />
      </h2>
      <p className="mx-auto mb-7 max-w-sm text-center text-sm opacity-70">
        Vui lòng để lại thông tin để gia đình chuẩn bị đón tiếp bạn chu đáo hơn.
      </p>

      <form
        onSubmit={guiForm}
        className="mx-auto max-w-md space-y-5 rounded-2xl border bg-white/35 p-5 shadow-sm sm:p-6"
        style={{ borderColor: 'color-mix(in srgb, var(--mau-chinh) 20%, transparent)' }}
      >
        {truong.has('hoTen') && <div>
          <label htmlFor="hoTen">Họ và tên</label>
          <input id="hoTen" name="hoTen" required className={o} />
        </div>}

        {truong.has('ben') && <div>
          <label htmlFor="ben">Bạn là khách của</label>
          <select id="ben" name="ben" required defaultValue="" className={o}>
            <option value="" disabled>Chọn một bên</option>
            <option value="nha-trai">Nhà trai</option>
            <option value="nha-gai">Nhà gái</option>
          </select>
        </div>}

        {truong.has('quanHe') && <div>
          <label htmlFor="quanHe">Quan hệ với cô dâu/chú rể</label>
          <input id="quanHe" name="quanHe" required className={o} />
        </div>}

        {truong.has('phuongTien') && <div>
          <label htmlFor="phuongTien">Phương tiện di chuyển</label>
          <select id="phuongTien" name="phuongTien" required defaultValue="" className={o}>
            <option value="" disabled>Chọn phương tiện</option>
            {PHUONG_TIEN.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>}

        {truong.has('ngayAn') && <div>
          <label htmlFor="ngayAn">Đến tham dự ngày</label>
          <select id="ngayAn" name="ngayAn" required defaultValue="" className={o}>
            <option value="" disabled>Chọn ngày</option>
            {ngayCoThe.map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>}

        {truong.has('loiChuc') && <div>
          <label htmlFor="loiChuc">Lời chúc (không bắt buộc)</label>
          <textarea id="loiChuc" name="loiChuc" rows={3} className={o} />
        </div>}

        {(thiep.cauHinhRsvp?.truongTuyChinh ?? []).map((t) => {
          const id = `custom-${t.id}`
          return (
            <div key={t.id}>
              <label htmlFor={id}>{t.nhan}</label>
              {t.kieu === 'textarea' ? (
                <textarea id={id} name={id} required={t.batBuoc} rows={3} className={o} />
              ) : t.kieu === 'select' ? (
                <select id={id} name={id} required={t.batBuoc} defaultValue="" className={o}>
                  <option value="" disabled={t.batBuoc}>Chọn một phương án</option>
                  {t.luaChon?.map((luaChon) => (
                    <option key={luaChon} value={luaChon}>{luaChon}</option>
                  ))}
                </select>
              ) : (
                <input id={id} name={id} required={t.batBuoc} className={o} />
              )}
            </div>
          )
        })}

        {loi && (
          <p role="alert" className="text-sm" style={{ color: 'var(--mau-chinh)' }}>
            {loi}
          </p>
        )}

        <button
          type="submit"
          disabled={dangGui}
          className="w-full rounded-full py-3.5 font-medium text-white shadow-md hover:-translate-y-0.5 disabled:opacity-60"
          style={{ backgroundColor: 'var(--mau-chinh)' }}
        >
          {dangGui ? 'Đang gửi...' : 'Gửi xác nhận'}
        </button>
      </form>
    </>
  )
}
