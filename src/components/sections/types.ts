import type { Invitation } from '@/lib/invitation/types'
import type { Theme } from '@/lib/themes'
import type { LoiChucDayDu } from '@/lib/db/loiChuc'

/**
 * HỢP ĐỒNG với session thiết kế. Mọi phần của thiệp nhận đúng bộ prop này.
 *
 * Ràng buộc: một phần KHÔNG được giả định phần nào đứng trước hay sau nó,
 * vì admin đảo được thứ tự và tắt được bất kỳ phần nào.
 */
export interface SectionProps {
  thiep: Invitation
  theme: Theme
  /** Chỉ phần 'bia' dùng. */
  onMoThiep?: () => void
  /** Chỉ phần 'rsvp' dùng: mở popup xác nhận tham dự. */
  onMoRsvp?: () => void
  /** Chỉ phần 'so-luu-but' dùng. */
  loiChuc?: LoiChucDayDu[]
}
