import type { ChiTietTrangTri } from '@/lib/invitation/types'
import { layHoaTiet } from '@/lib/motifs/danhSach'
import { HoaTiet } from './HoaTiet'

/**
 * Đặt chi tiết trang trí lên một phần của thiệp theo tọa độ tự do.
 *
 * Lớp này nằm ngoài component của phần, nên phần không cần biết gì về trang trí —
 * giữ đúng nguyên tắc mỗi phần độc lập, đảo hay tắt thoải mái.
 */
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
            className="block"
            style={{
              position: 'absolute',
              left: `${ct.x}%`,
              top: `${ct.y}%`,
              transform: `translate(-50%, -50%) rotate(${ct.gocXoay ?? 0}deg)`,
              width: `${ct.kichThuoc}%`,
              aspectRatio: '1 / 1',
              // Nội dung của phần nằm ở lớp 10 (xem InvitationRenderer):
              // dưới 10 là ra sau chữ, trên 10 là đè lên trên.
              zIndex: ct.raSauChu ? 0 : 20,
            }}
          />
        )
      })}
    </>
  )
}
