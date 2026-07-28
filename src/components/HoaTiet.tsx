import type { CSSProperties } from 'react'
import type { SlotHoaTiet, Theme } from '@/lib/themes/types'
import type { TuyChinhHoaTietTheme } from '@/lib/invitation/types'
import { layHoaTiet } from '@/lib/motifs/danhSach'

/**
 * Vẽ một họa tiết và tô màu cho nó.
 *
 * Asset là PNG một màu có nền trong suốt — toàn bộ hình nằm ở kênh alpha.
 * Ta KHÔNG hiển thị ảnh trực tiếp mà dùng nó làm mặt nạ (CSS mask): alpha quyết
 * định hình, còn màu do ta đưa vào. Nhờ vậy cùng một tệp dùng được cho mọi thiệp
 * với màu bất kỳ, không cần xuất lại ảnh.
 */
export function HoaTiet({
  tep,
  mau = 'var(--mau-phu)',
  doDam,
  className,
  style,
}: {
  /** Đường dẫn dưới /hoa-tiet, ví dụ 'primary-decor/florals/F01-lotus-front.png'. */
  tep: string
  /** Màu tô: mã màu hoặc biến CSS. Mặc định lấy màu phụ của thiệp. */
  mau?: string
  /** Độ đậm 0–1. Bỏ trống thì đậm hết mức. */
  doDam?: number
  className?: string
  style?: CSSProperties
}) {
  const url = `url(/hoa-tiet/${tep})`

  return (
    <span
      aria-hidden="true"
      className={className}
      style={{
        WebkitMaskImage: url,
        maskImage: url,
        WebkitMaskSize: 'contain',
        maskSize: 'contain',
        WebkitMaskRepeat: 'no-repeat',
        maskRepeat: 'no-repeat',
        WebkitMaskPosition: 'center',
        maskPosition: 'center',
        backgroundColor: mau,
        opacity: doDam,
        // Họa tiết chỉ để trang trí: không bao giờ được chặn cú chạm của khách,
        // nếu không nó sẽ che mất nút bên dưới.
        pointerEvents: 'none',
        ...style,
      }}
    />
  )
}

/**
 * Vẽ họa tiết mà theme khai báo cho một vị trí cố định.
 * Độ đậm đọc từ biến CSS do renderer đổ ra, nên tùy chỉnh riêng của
 * từng thiệp được áp dụng mà component không cần biết.
 */
export function HoaTietTheme({
  theme,
  slot,
  mau,
  className,
}: {
  theme: Theme
  slot: SlotHoaTiet
  mau?: string
  className?: string
}) {
  const tep = theme.hoaTiet[slot]
  if (!tep) return null

  return (
    <HoaTiet
      tep={tep}
      mau={mau}
      className={className}
      style={{ opacity: `var(--do-dam-${slot}, 1)` as unknown as number }}
    />
  )
}

export interface ViTriHoaTietTheme {
  x: number
  y: number
  kichThuoc: number
  gocXoay: number
  raSauChu: boolean
}

/** Họa tiết mặc định của theme nhưng có thể ghi đè đầy đủ cho từng thiệp. */
export function HoaTietThemeTuyChinh({
  theme,
  slot,
  macDinh,
  tuyChinh,
}: {
  theme: Theme
  slot: 'watermark' | 'corner'
  macDinh: ViTriHoaTietTheme
  tuyChinh?: TuyChinhHoaTietTheme
}) {
  if (tuyChinh?.an) return null

  const tepTuyChinh = tuyChinh?.id ? layHoaTiet(tuyChinh.id)?.tep : undefined
  const tep = tepTuyChinh ?? theme.hoaTiet[slot]
  if (!tep) return null

  const x = tuyChinh?.x ?? macDinh.x
  const y = tuyChinh?.y ?? macDinh.y
  const kichThuoc = tuyChinh?.kichThuoc ?? macDinh.kichThuoc
  const gocXoay = tuyChinh?.gocXoay ?? macDinh.gocXoay
  const raSauChu = tuyChinh?.raSauChu ?? macDinh.raSauChu

  return (
    <HoaTiet
      tep={tep}
      mau={tuyChinh?.mau}
      doDam={tuyChinh?.doDam}
      className="block"
      style={{
        position: 'absolute',
        left: `${x}%`,
        top: `${y}%`,
        width: `${kichThuoc}%`,
        aspectRatio: '1 / 1',
        transform: `translate(-50%, -50%) rotate(${gocXoay}deg)`,
        zIndex: raSauChu ? 0 : 20,
        opacity:
          tuyChinh?.doDam ??
          (`var(--do-dam-${slot}, 1)` as unknown as number),
      }}
    />
  )
}
