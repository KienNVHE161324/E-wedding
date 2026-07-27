'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { ThiepTomTat, TrangThaiThiep } from '@/lib/vongDoi/types'

const NHAN_TRANG_THAI: Record<TrangThaiThiep, string> = {
  'nhap': 'Nháp',
  'da-xuat-ban': 'Đang mở',
  'het-han': 'Hết hạn',
}

function ngayVn(iso: string) {
  const [nam, thang, ngay] = iso.split('-')
  return `${ngay}/${thang}/${nam}`
}

export function BangDieuKhien({ danhSach }: { danhSach: ThiepTomTat[] }) {
  const [tuKhoa, setTuKhoa] = useState('')
  const [loc, setLoc] = useState<'tat-ca' | TrangThaiThiep>('tat-ca')

  const hienThi = danhSach.filter((t) => {
    const khop = `${t.tenChuRe} ${t.tenCoDau} ${t.slug}`
      .toLowerCase()
      .includes(tuKhoa.trim().toLowerCase())
    return khop && (loc === 'tat-ca' || t.trangThai === loc)
  })

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="flex-1 text-2xl font-semibold">Các đám cưới</h1>
        <Link href="/admin/tao-moi" className="rounded bg-black px-4 py-2 text-white">
          Tạo đám cưới mới
        </Link>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <label className="text-sm">
          Tìm kiếm
          <input
            aria-label="Tìm kiếm"
            value={tuKhoa}
            onChange={(e) => setTuKhoa(e.target.value)}
            placeholder="Tên cô dâu, chú rể hoặc đường dẫn"
            className="ml-2 rounded border px-3 py-1.5"
          />
        </label>

        <label className="text-sm">
          Trạng thái
          <select
            aria-label="Trạng thái"
            value={loc}
            onChange={(e) => setLoc(e.target.value as typeof loc)}
            className="ml-2 rounded border px-3 py-1.5"
          >
            <option value="tat-ca">Tất cả</option>
            <option value="nhap">Nháp</option>
            <option value="da-xuat-ban">Đang mở</option>
            <option value="het-han">Hết hạn</option>
          </select>
        </label>
      </div>

      {hienThi.length === 0 ? (
        <p className="mt-10 text-center text-neutral-500">Không tìm thấy đám cưới nào.</p>
      ) : (
        <ul className="mt-6 space-y-3">
          {hienThi.map((t) => (
            <li key={t.slug} className="rounded border p-4">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="font-medium">
                  {t.tenChuRe} &amp; {t.tenCoDau}
                </span>
                <span className="text-sm text-neutral-500">/{t.slug}</span>
                <span className="rounded-full border px-2 py-0.5 text-xs">
                  {NHAN_TRANG_THAI[t.trangThai]}
                </span>
              </div>

              <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-neutral-600">
                <span>Cưới ngày {ngayVn(t.ngayCuoi)}</span>
                {t.soNgayConLai !== null && (
                  <span>{t.soNgayConLai === 0 ? 'Đã hết hạn' : `Còn ${t.soNgayConLai} ngày`}</span>
                )}
                <span>
                  Xác nhận: <strong>{t.soLuotXacNhan}</strong>
                </span>
              </div>

              <div className="mt-3 flex flex-wrap gap-3 text-sm">
                <Link href={`/admin/${t.slug}`} className="underline">
                  Sửa thiệp
                </Link>
                <a href={`/${t.slug}`} target="_blank" rel="noopener noreferrer" className="underline">
                  Xem thiệp
                </a>
                {t.spreadsheetId && (
                  <a
                    href={`https://docs.google.com/spreadsheets/d/${t.spreadsheetId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    Google Sheet
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
