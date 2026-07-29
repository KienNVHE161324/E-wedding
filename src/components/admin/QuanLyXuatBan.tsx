'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { VongDoi } from '@/lib/vongDoi/types'
import { sangNgayGioVietNam } from '@/lib/vongDoi/thoiGian'
import { tinhTrangThai } from '@/lib/vongDoi/tinhTrangThai'

const NHAN_TRANG_THAI = {
  nhap: 'Chưa đặt lịch',
  'da-len-lich': 'Đã lên lịch',
  'da-xuat-ban': 'Đang mở',
  'het-han': 'Đã đóng',
  'da-huy': 'Đã hủy',
} as const

export function QuanLyXuatBan({
  invitationId,
  vongDoi,
}: {
  invitationId: string
  vongDoi: VongDoi
}) {
  const router = useRouter()
  const [ngayXuatBan, setNgayXuatBan] = useState(sangNgayGioVietNam(vongDoi.ngayXuatBan))
  const [ngayDong, setNgayDong] = useState(sangNgayGioVietNam(vongDoi.ngayDong))
  const [dangGui, setDangGui] = useState(false)
  const [loi, setLoi] = useState('')
  const trangThai = tinhTrangThai(vongDoi, new Date())

  async function luuLich() {
    setLoi('')
    if (!ngayXuatBan || !ngayDong || ngayDong <= ngayXuatBan) {
      setLoi('Ngày giờ đóng phải sau ngày giờ xuất bản')
      return
    }

    setDangGui(true)
    const res = await fetch('/api/admin/xuat-ban', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invitationId, ngayXuatBan, ngayDong }),
    })
    setDangGui(false)
    if (res.ok) {
      router.refresh()
      return
    }
    const data = await res.json().catch(() => ({}))
    setLoi(data.loi ?? 'Không lưu được lịch xuất bản')
  }

  if (trangThai === 'da-huy') {
    return (
      <section className="rounded border p-3">
        <h3 className="font-semibold">Xuất bản</h3>
        <p className="mt-2 text-sm">Thiệp đã hủy và không còn đường dẫn công khai.</p>
      </section>
    )
  }

  return (
    <section className="rounded border p-3">
      <h3 className="font-semibold">Lịch xuất bản</h3>
      <p className="mt-1 text-sm text-neutral-600">
        Trạng thái: <strong>{NHAN_TRANG_THAI[trangThai]}</strong>
      </p>
      <label className="mt-3 block text-sm">
        Ngày giờ xuất bản
        <input
          type="datetime-local"
          aria-label="Ngày giờ xuất bản"
          value={ngayXuatBan}
          onChange={(e) => setNgayXuatBan(e.target.value)}
          className="mt-1 w-full rounded border px-3 py-2"
        />
      </label>
      <label className="mt-3 block text-sm">
        Ngày giờ đóng
        <input
          type="datetime-local"
          aria-label="Ngày giờ đóng"
          value={ngayDong}
          onChange={(e) => setNgayDong(e.target.value)}
          className="mt-1 w-full rounded border px-3 py-2"
        />
      </label>
      {loi && <p role="alert" className="mt-2 text-sm text-red-600">{loi}</p>}
      <button
        type="button"
        disabled={dangGui}
        onClick={luuLich}
        className="mt-3 w-full rounded bg-black py-2 text-white disabled:opacity-60"
      >
        {dangGui ? 'Đang lưu...' : 'Lưu lịch xuất bản'}
      </button>
      <p className="mt-2 text-xs text-neutral-500">Thời gian được nhập theo giờ Việt Nam.</p>
    </section>
  )
}
