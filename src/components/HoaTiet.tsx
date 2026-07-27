import type { CSSProperties } from 'react'
import type { SlotHoaTiet, Theme } from '@/lib/themes/types'

/**
 * Vẽ một họa tiết ở vị trí (slot) cho trước.
 *
 * Họa tiết là ảnh PNG một màu có nền trong suốt. Ta KHÔNG hiển thị ảnh trực tiếp
 * mà dùng nó làm mặt nạ (CSS mask): kênh alpha của ảnh quyết định hình, còn màu
 * lấy từ biến CSS của thiệp. Nhờ vậy cùng một tệp ảnh sẽ ra nâu ở thiệp nâu,
 * ra xanh ở thiệp xanh, không cần xuất lại ảnh cho từng theme.
 */
export function HoaTiet({
  theme,
  slot,
  mau = 'var(--mau-phu)',
  className,
}: {
  theme: Theme
  slot: SlotHoaTiet
  /** Màu tô. Mặc định lấy màu phụ của thiệp. */
  mau?: string
  className?: string
}) {
  const tep = theme.hoaTiet[slot]
  if (!tep) return null

  const url = `url(/hoa-tiet/${tep})`
  const style = {
    WebkitMaskImage: url,
    maskImage: url,
    WebkitMaskSize: 'contain',
    maskSize: 'contain',
    WebkitMaskRepeat: 'no-repeat',
    maskRepeat: 'no-repeat',
    WebkitMaskPosition: 'center',
    maskPosition: 'center',
    backgroundColor: mau,
    // Độ đậm do renderer đổ ra từ theme + tùy chỉnh riêng của thiệp.
    opacity: `var(--do-dam-${slot}, 1)`,
  } as CSSProperties

  return <span aria-hidden="true" className={className} style={style} />
}
