import type { SectionRef } from '@/lib/invitation/types'
import type { CauHinhQrTheme } from '@/lib/qr/types'

/**
 * Các vị trí gắn họa tiết trên thiệp.
 * Khớp với trường "slots" trong registry của bộ họa tiết do session thiết kế quản lý.
 */
export type SlotHoaTiet =
  | 'cover-frame'
  | 'section-header'
  | 'section-hero'
  | 'section-footer'
  | 'divider'
  | 'vertical-divider'
  | 'corner'
  | 'watermark'
  | 'seal'

export const DANH_SACH_SLOT: SlotHoaTiet[] = [
  'cover-frame',
  'section-header',
  'section-hero',
  'section-footer',
  'divider',
  'vertical-divider',
  'corner',
  'watermark',
  'seal',
]

/**
 * HỢP ĐỒNG với session thiết kế. Session thiết kế thêm file theme mới theo đúng
 * hình dạng này và có thể mở rộng thêm trường tùy chọn, nhưng không được đổi
 * hay bỏ trường đã có.
 */
export interface Theme {
  id: string
  ten: string
  mau: {
    nen: string
    chu: string
    chinh: string
    phu: string
    nhan: string
  }
  font: {
    tieuDe: string
    noiDung: string
  }
  /** Slot -> tên tệp họa tiết trong /public/hoa-tiet. Slot không khai báo thì không vẽ gì. */
  hoaTiet: Partial<Record<SlotHoaTiet, string>>
  /** Độ đậm mặc định của họa tiết ở từng slot, 0–1. Thiếu thì coi là 1. */
  doDam: Partial<Record<SlotHoaTiet, number>>
  qr: CauHinhQrTheme
  thuTuSection: SectionRef[]
}
