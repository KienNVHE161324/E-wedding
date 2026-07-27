'use client'

import { useEffect, useState, type CSSProperties } from 'react'
import type { Invitation } from '@/lib/invitation/types'
import type { Theme } from '@/lib/themes'
import type { LoiChuc } from '@/lib/rsvp/types'
import { resolveSections } from '@/lib/invitation/sections'
import { SECTION_REGISTRY } from './sections/registry'
import { NutRsvpNoi } from './NutRsvpNoi'

/**
 * Dựng thiệp từ dữ liệu. Hàm thuần theo (thiep, theme): không đọc DB,
 * không gọi Google, không biết gì về trang quản trị.
 */
export function InvitationRenderer({
  thiep,
  theme,
  loiChuc = [],
}: {
  thiep: Invitation
  theme: Theme
  loiChuc?: LoiChuc[]
}) {
  const danhSach = resolveSections(theme.thuTuSection, thiep.sections)
  const [daMo, setDaMo] = useState(false)

  // Khóa cuộn cho tới khi khách bấm "Mở thiệp". Cú chạm đó cũng là thứ
  // hợp thức hóa việc phát nhạc, vì trình duyệt mobile chặn tự động phát.
  useEffect(() => {
    document.body.classList.toggle('khoa-cuon', !daMo)
    return () => document.body.classList.remove('khoa-cuon')
  }, [daMo])

  // Tùy chỉnh của từng thiệp ghi đè giá trị của theme; thiếu thì lấy theme.
  const tc = thiep.tuyChinhGiaoDien ?? {}
  const doDam = { ...theme.doDam, ...(tc.doDam ?? {}) }

  const style = {
    '--mau-nen': tc.mauNen ?? theme.mau.nen,
    '--mau-chu': theme.mau.chu,
    '--mau-chinh': tc.mauChinh ?? theme.mau.chinh,
    '--mau-phu': tc.mauPhu ?? theme.mau.phu,
    '--mau-nhan': theme.mau.nhan,
    '--font-tieu-de': theme.font.tieuDe,
    '--font-noi-dung': theme.font.noiDung,
    // HoaTiet đọc các biến này để đặt độ đậm cho từng vị trí.
    ...Object.fromEntries(
      Object.entries(doDam).map(([slot, v]) => [`--do-dam-${slot}`, String(v)]),
    ),
    backgroundColor: 'var(--mau-nen)',
    color: 'var(--mau-chu)',
    fontFamily: 'var(--font-noi-dung)',
  } as CSSProperties

  return (
    <div style={style}>
      <main className="mx-auto w-full max-w-[520px] md:max-w-[720px]">
        {danhSach.map((id) => {
          const Section = SECTION_REGISTRY[id]
          const rieng =
            id === 'bia' ? { onMoThiep: () => setDaMo(true) }
            : id === 'so-luu-but' ? { loiChuc }
            : {}
          return <Section key={id} thiep={thiep} theme={theme} {...rieng} />
        })}
      </main>

      {daMo && danhSach.includes('rsvp') && <NutRsvpNoi />}
    </div>
  )
}
