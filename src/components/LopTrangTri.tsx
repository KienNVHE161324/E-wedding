import type { CSSProperties } from 'react'
import type { ChiTietTrangTri, ViTriChiTiet } from '@/lib/invitation/types'
import { layHoaTiet } from '@/lib/motifs/danhSach'
import { HoaTiet } from './HoaTiet'

/**
 * Đặt chi tiết trang trí quanh một phần của thiệp.
 *
 * Lớp này nằm ngoài component của phần, nên phần không cần biết gì về trang trí —
 * giữ đúng nguyên tắc mỗi phần độc lập, đảo hay tắt thoải mái.
 */

/** Vị trí gốc, tính bằng phần trăm so với khung của phần. */
const VI_TRI: Record<ViTriChiTiet, { x: number; y: number }> = {
  tren: { x: 50, y: 0 },
  duoi: { x: 50, y: 100 },
  trai: { x: 0, y: 50 },
  phai: { x: 100, y: 50 },
  nen: { x: 50, y: 50 },
}

export function LopTrangTri({ chiTiet }: { chiTiet: ChiTietTrangTri[] }) {
  if (chiTiet.length === 0) return null

  return (
    <>
      {chiTiet.map((ct, i) => {
        const muc = layHoaTiet(ct.id)
        // Asset bị xóa khỏi Image_collections thì bỏ qua, không làm vỡ thiệp.
        if (!muc) return null

        const goc = VI_TRI[ct.viTri]
        const style: CSSProperties = {
          position: 'absolute',
          left: `${goc.x + (ct.dichNgang ?? 0)}%`,
          top: `${goc.y + (ct.dichDoc ?? 0)}%`,
          transform: 'translate(-50%, -50%)',
          width: `${ct.kichThuoc}%`,
          aspectRatio: '1 / 1',
          // Nội dung của phần nằm ở lớp 10 (xem InvitationRenderer):
          // dưới 10 là ra sau chữ, trên 10 là đè lên trên.
          zIndex: ct.raSauChu ? 0 : 20,
        }

        return (
          <HoaTiet
            key={`${ct.id}-${i}`}
            tep={muc.tep}
            mau={ct.mau}
            doDam={ct.doDam}
            className="block"
            style={style}
          />
        )
      })}
    </>
  )
}
