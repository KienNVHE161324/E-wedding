import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { InvitationRenderer } from '../InvitationRenderer'
import { thiepMau } from '@/lib/invitation/mau'
import { layTheme } from '@/lib/themes'

const theme = layTheme('mac-dinh')

/** Bìa hiện trước; các phần sau chỉ tồn tại sau khi khách bấm Mở thiệp. */
async function moThiep() {
  await userEvent.click(screen.getByRole('button', { name: 'Mở thiệp' }))
}

function thuTuHienThi(container: HTMLElement): string[] {
  return Array.from(container.querySelectorAll('[data-section]')).map(
    (el) => el.getAttribute('data-section')!,
  )
}

describe('InvitationRenderer', () => {
  it('cấp hệ quy chiếu responsive 520px cho cả vùng chữ nổi ngoài main', async () => {
    const thiep = {
      ...thiepMau,
      tuyChinhChu: {
        'nut-rsvp-noi': { coChu: 40, x: 10 },
      },
    }
    const { container } = render(<InvitationRenderer thiep={thiep} theme={theme} />)
    const root = container.querySelector('[data-invitation-root]') as HTMLElement

    expect(root.style.getPropertyValue('--khung-thiep-rong')).toBe('min(100vw, 520px)')

    await moThiep()
    const nutNoi = container.querySelector(
      '[data-text-region="nut-rsvp-noi"]',
    ) as HTMLElement
    expect(nutNoi.closest('main')).toBeNull()
    expect(nutNoi.style.getPropertyValue('--co-chu-responsive')).toContain('vw')
    expect(nutNoi.style.getPropertyValue('--co-chu-responsive')).toContain('40px')
    expect(nutNoi.style.getPropertyValue('--dich-x-responsive')).toContain('10vw')
    expect(nutNoi.style.getPropertyValue('--dich-x-responsive')).toContain('52px')
    expect(nutNoi.style.cssText).not.toContain('cqw')
  })

  it('giữ chiều rộng khung điện thoại trên mọi kích thước màn hình', () => {
    const { container } = render(<InvitationRenderer thiep={thiepMau} theme={theme} />)
    const main = container.querySelector('main')

    expect(main).toHaveClass('w-full', 'max-w-[520px]')
    expect(main).not.toHaveClass('md:max-w-[720px]')
  })

  it('trước khi mở chỉ có bìa, không lộ phần nào khác', () => {
    const { container } = render(<InvitationRenderer thiep={thiepMau} theme={theme} />)
    expect(thuTuHienThi(container)).toEqual(['bia'])
  })

  it('render theo thứ tự mặc định của theme', async () => {
    const { container } = render(<InvitationRenderer thiep={thiepMau} theme={theme} />)
    await moThiep()
    expect(thuTuHienThi(container)).toEqual(theme.thuTuSection.map((s) => s.id))
  })

  it('render đúng thứ tự khi thiệp đảo phần', async () => {
    const thiep = {
      ...thiepMau,
      sections: [
        { id: 'bia' as const },
        { id: 'mung-cuoi' as const },
        { id: 'co-dau-chu-re' as const },
      ],
    }
    const { container } = render(<InvitationRenderer thiep={thiep} theme={theme} />)
    await moThiep()
    expect(thuTuHienThi(container)).toEqual(['bia', 'mung-cuoi', 'co-dau-chu-re'])
  })

  it('không render phần bị tắt', async () => {
    const thiep = {
      ...thiepMau,
      sections: [
        { id: 'bia' as const },
        { id: 'chuyen-chung-minh' as const, enabled: false },
        { id: 'album' as const },
      ],
    }
    const { container } = render(<InvitationRenderer thiep={thiep} theme={theme} />)
    await moThiep()
    expect(thuTuHienThi(container)).toEqual(['bia', 'album'])
  })

  it('mọi SectionId trong registry đều render được với thiệp mẫu', async () => {
    const { container } = render(<InvitationRenderer thiep={thiepMau} theme={theme} />)
    await moThiep()
    expect(thuTuHienThi(container).length).toBe(theme.thuTuSection.length)
  })

  it('dùng màu của theme khi thiệp không tùy chỉnh', () => {
    const { container } = render(<InvitationRenderer thiep={thiepMau} theme={theme} />)
    const el = container.firstElementChild as HTMLElement
    expect(el.style.getPropertyValue('--mau-chinh')).toBe(theme.mau.chinh)
  })

  it('tùy chỉnh của thiệp ghi đè màu và độ đậm của theme', () => {
    const thiep = {
      ...thiepMau,
      tuyChinhGiaoDien: { mauChinh: '#123456', doDam: { watermark: 0.12 } },
    }
    const { container } = render(<InvitationRenderer thiep={thiep} theme={theme} />)
    const el = container.firstElementChild as HTMLElement
    expect(el.style.getPropertyValue('--mau-chinh')).toBe('#123456')
    expect(el.style.getPropertyValue('--do-dam-watermark')).toBe('0.12')
  })

  it('đổ độ đậm mặc định của theme ra biến CSS', () => {
    const { container } = render(<InvitationRenderer thiep={thiepMau} theme={theme} />)
    const el = container.firstElementChild as HTMLElement
    expect(el.style.getPropertyValue('--do-dam-divider')).toBe(String(theme.doDam.divider))
  })
})
