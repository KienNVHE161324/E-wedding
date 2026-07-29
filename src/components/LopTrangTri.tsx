import type { ChiTietTrangTri } from '@/lib/invitation/types'
import { layHoaTiet } from '@/lib/motifs/danhSach'
import { HoaTiet } from './HoaTiet'
import Image from 'next/image'
import {
  FONT_CHU_CHI_TIET_CSS,
  layCauHinhChiTietCoChu,
} from '@/lib/invitation/chiTietCoChu'

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
        const cauHinhChu = layCauHinhChiTietCoChu(ct.id)
        const viTri = {
          position: 'absolute' as const,
          left: `${ct.x}%`,
          top: `${ct.y}%`,
          transform: `translate(-50%, -50%) rotate(${ct.gocXoay ?? 0}deg)`,
          width: `${ct.kichThuoc}%`,
          zIndex: ct.raSauChu ? 0 : 20,
        }

        if (cauHinhChu) {
          return (
            <div
              key={`${ct.id}-${i}`}
              data-chi-tiet-co-chu
              aria-hidden="true"
              style={{
                ...viTri,
                aspectRatio: cauHinhChu.tiLe,
                containerType: 'inline-size',
                opacity: ct.doDam,
                pointerEvents: 'none',
              }}
            >
              <Image
                src={`/hoa-tiet/${muc.tep}`}
                alt=""
                fill
                sizes="(max-width: 520px) 100vw, 520px"
                className="absolute inset-0 h-full w-full object-contain"
              />
              {ct.chu?.noiDung.trim() && (
                <div
                  data-testid="chu-chi-tiet"
                  className="absolute flex items-center justify-center whitespace-pre-line px-1 leading-snug"
                  style={{
                    left: `${cauHinhChu.vungChu.x}%`,
                    top: `${cauHinhChu.vungChu.y}%`,
                    width: `${cauHinhChu.vungChu.rong}%`,
                    height: `${cauHinhChu.vungChu.cao}%`,
                    transform: cauHinhChu.vungChu.xoay
                      ? `rotate(${cauHinhChu.vungChu.xoay}deg)`
                      : undefined,
                    color: ct.chu.mauChu,
                    fontFamily: FONT_CHU_CHI_TIET_CSS[ct.chu.font],
                    fontSize: `${(ct.chu.coChu / 7).toFixed(3)}cqw`,
                    textAlign: ct.chu.canLe,
                  }}
                >
                  <span className="w-full">{ct.chu.noiDung}</span>
                </div>
              )}
            </div>
          )
        }

        return (
          <HoaTiet
            key={`${ct.id}-${i}`}
            tep={muc.tep}
            mau={ct.mau}
            doDam={ct.doDam}
            className="block"
            style={{
              ...viTri,
              aspectRatio: '1 / 1',
              // Nội dung của phần nằm ở lớp 10 (xem InvitationRenderer):
              // dưới 10 là ra sau chữ, trên 10 là đè lên trên.
            }}
          />
        )
      })}
    </>
  )
}
