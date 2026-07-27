'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { VongDoi } from '@/lib/vongDoi/types'
import { tinhTrangThai, soNgayConLai, SO_NGAY_MAC_DINH } from '@/lib/vongDoi/tinhTrangThai'

function ngayVn(iso: string | null) {
  if (!iso) return ''
  const d = new Date(iso)
  const p = (n: number) => String(n).padStart(2, '0')
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()}`
}

export function NutXuatBan({ slug, vongDoi }: { slug: string; vongDoi: VongDoi }) {
  const router = useRouter()
  const [dangGui, setDangGui] = useState(false)
  const [loi, setLoi] = useState('')
  const [soNgay, setSoNgay] = useState(SO_NGAY_MAC_DINH)

  const bayGio = new Date()
  const trangThai = tinhTrangThai(vongDoi, bayGio)
  const conLai = soNgayConLai(vongDoi.ngayHetHan, bayGio)
  const laNhap = trangThai === 'nhap'

  async function chay() {
    setLoi('')
    setDangGui(true)
    const res = await fetch('/api/admin/xuat-ban', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug, hanhDong: laNhap ? 'xuat-ban' : 'gia-han', soNgay }),
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
      <h3 className="font-semibold">Thời gian thiệp mở cho khách xem</h3>

      <p className="mt-2 text-sm">
        {trangThai === 'nhap' && (
          <>
            <strong>Chưa mở.</strong> Khách vào đường dẫn sẽ thấy trang &ldquo;Thiệp chưa được
            mở&rdquo;.
          </>
        )}
        {trangThai === 'da-xuat-ban' && (
          <>
            <strong>Đang mở.</strong> Khách xem được tới hết ngày{' '}
            {ngayVn(vongDoi.ngayHetHan)}, còn {conLai} ngày.
          </>
        )}
        {trangThai === 'het-han' && (
          <>
            <strong>Đã đóng</strong> từ ngày {ngayVn(vongDoi.ngayHetHan)}. Khách vào đường dẫn
            chỉ thấy thông báo hết hạn. Dữ liệu và danh sách khách vẫn còn nguyên.
          </>
        )}
      </p>

      <label className="mt-3 block text-sm">
        Mở cho khách xem trong
        <span className="mt-1 flex items-center gap-2">
          <input
            type="number"
            aria-label="Số ngày mở cho khách xem"
            min={1}
            max={365}
            value={soNgay}
            onChange={(e) => setSoNgay(Number(e.target.value))}
            className="w-20 rounded border px-2 py-1"
          />
          <span>ngày, tính từ hôm nay</span>
        </span>
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
        {dangGui
          ? 'Đang xử lý...'
          : laNhap
            ? 'Mở thiệp cho khách xem'
            : 'Đặt lại số ngày mở'}
      </button>

      <p className="mt-2 text-sm text-neutral-500">
        {laNhap
          ? 'Bấm khi đã chốt xong nội dung với khách.'
          : 'Bấm để kéo dài hoặc rút ngắn thời gian. Hạn mới tính lại từ hôm nay, không cộng dồn.'}
      </p>
    </div>
  )
}
