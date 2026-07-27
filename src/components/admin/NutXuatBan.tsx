'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { VongDoi } from '@/lib/vongDoi/types'
import { tinhTrangThai, soNgayConLai, SO_NGAY_MAC_DINH } from '@/lib/vongDoi/tinhTrangThai'

export function NutXuatBan({ slug, vongDoi }: { slug: string; vongDoi: VongDoi }) {
  const router = useRouter()
  const [dangGui, setDangGui] = useState(false)
  const [loi, setLoi] = useState('')
  const [soNgay, setSoNgay] = useState(SO_NGAY_MAC_DINH)

  const bayGio = new Date()
  const trangThai = tinhTrangThai(vongDoi, bayGio)
  const conLai = soNgayConLai(vongDoi.ngayHetHan, bayGio)
  const hanhDong = trangThai === 'nhap' ? 'xuat-ban' : 'gia-han'

  async function chay() {
    setLoi('')
    setDangGui(true)
    const res = await fetch('/api/admin/xuat-ban', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug, hanhDong, soNgay }),
    })
    setDangGui(false)
    if (res.ok) {
      router.refresh()
    } else {
      const data = await res.json().catch(() => ({}))
      setLoi(data.loi ?? 'Không thực hiện được')
    }
  }

  return (
    <div className="rounded border p-3">
      <p className="text-sm">
        {trangThai === 'nhap' && 'Chưa xuất bản. Khách vào link sẽ thấy trang "thiệp chưa mở".'}
        {trangThai === 'da-xuat-ban' && `Đang mở, còn ${conLai} ngày.`}
        {trangThai === 'het-han' && 'Đã hết hạn. Bấm gia hạn để mở lại.'}
      </p>

      <label className="mt-3 block text-sm">
        Số ngày
        <input
          type="number"
          min={1}
          max={365}
          value={soNgay}
          onChange={(e) => setSoNgay(Number(e.target.value))}
          className="ml-2 w-20 rounded border px-2 py-1"
        />
      </label>

      {loi && (
        <p role="alert" className="mt-2 text-sm text-red-600">
          {loi}
        </p>
      )}

      <button
        type="button"
        onClick={chay}
        disabled={dangGui}
        className="mt-3 w-full rounded bg-black py-2 text-white disabled:opacity-60"
      >
        {dangGui ? 'Đang xử lý...' : hanhDong === 'xuat-ban' ? 'Xuất bản thiệp' : 'Gia hạn'}
      </button>
    </div>
  )
}
