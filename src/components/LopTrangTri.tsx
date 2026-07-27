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

const VI_TRI: Record<ViTriChiTiet, CSSProperties> = {
  tren: { top: 0, left: '50%', transform: 'translate(-50%, -30%)' },
  duoi: { bottom: 0, left: '50%', transform: 'translate(-50%, 30%)' },
  trai: { top: '50%', left: 0, transform: 'translate(-25%, -50%)' },
  phai: { top: '50%', right: 0, transform: 'translate(25%, -50%)' },
  nen: { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' },
}

export function LopTrangTri({ chiTiet }: { chiTiet: ChiTietTrangTri[] }) {
  if (chiTiet.length === 0) return null

  return (
    <>
      {chiTiet.map((ct, i) => {
        const muc = layHoaTiet(ct.id)
        // Asset bị xóa khỏi Image_collections thì bỏ qua, không làm vỡ thiệp.
        if (!muc) return null

        return (
          <HoaTiet
            key={`${ct.id}-${i}`}
            tep={muc.tep}
            mau={ct.mau}
            doDam={ct.doDam}
            className="pointer-events-none absolute block"
            style={{
              width: `${ct.kichThuoc}%`,
              aspectRatio: '1 / 1',
              ...VI_TRI[ct.viTri],
            }}
          />
        )
      })}
    </>
  )
}
