import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { LopTrangTri } from '../LopTrangTri'
import { InvitationRenderer } from '../InvitationRenderer'
import { thiepMau } from '@/lib/invitation/mau'
import { layTheme } from '@/lib/themes'
import { DANH_SACH_HOA_TIET } from '@/lib/motifs/danhSach'
import type { ChiTietTrangTri } from '@/lib/invitation/types'

const theme = layTheme('mac-dinh')

// Chọn asset mà theme mặc định KHÔNG dùng, để phân biệt được
// họa tiết của theme với chi tiết nhân viên tự thêm.
const dungBoiTheme = new Set(Object.values(theme.hoaTiet))
const MUC = DANH_SACH_HOA_TIET.find((m) => !dungBoiTheme.has(m.tep))!

const chiTiet = (ghiDe: Partial<ChiTietTrangTri> = {}): ChiTietTrangTri => ({
  id: MUC.id,
  section: 'bia',
  viTri: 'tren',
  mau: '#8B2F20',
  doDam: 0.8,
  kichThuoc: 25,
  ...ghiDe,
})

describe('LopTrangTri', () => {
  it('vẽ chi tiết với đúng màu, độ đậm và kích thước đã chọn', () => {
    const { container } = render(<LopTrangTri chiTiet={[chiTiet()]} />)
    const el = container.firstElementChild as HTMLElement
    expect(el.style.backgroundColor).toBe('rgb(139, 47, 32)')
    expect(el.style.opacity).toBe('0.8')
    expect(el.style.width).toBe('25%')
    expect(el.style.maskImage).toContain(MUC.tep)
  })

  it('mỗi chi tiết giữ màu riêng của nó', () => {
    const { container } = render(
      <LopTrangTri chiTiet={[chiTiet({ mau: '#112233' }), chiTiet({ mau: '#445566' })]} />,
    )
    const els = container.querySelectorAll('span')
    expect((els[0] as HTMLElement).style.backgroundColor).toBe('rgb(17, 34, 51)')
    expect((els[1] as HTMLElement).style.backgroundColor).toBe('rgb(68, 85, 102)')
  })

  it('bỏ qua chi tiết trỏ tới asset đã bị xóa, không làm vỡ thiệp', () => {
    const { container } = render(<LopTrangTri chiTiet={[chiTiet({ id: 'khong-ton-tai' })]} />)
    expect(container.firstElementChild).toBeNull()
  })

  it('không vẽ gì khi danh sách rỗng', () => {
    const { container } = render(<LopTrangTri chiTiet={[]} />)
    expect(container.firstElementChild).toBeNull()
  })
})

describe('renderer gắn chi tiết vào đúng phần', () => {
  it('chỉ vẽ chi tiết ở phần được chỉ định', () => {
    const thiep = {
      ...thiepMau,
      sections: [{ id: 'bia' as const }, { id: 'album' as const }],
      chiTietTrangTri: [chiTiet({ section: 'album' })],
    }
    const { container } = render(<InvitationRenderer thiep={thiep} theme={theme} />)

    const khungAlbum = container.querySelector('[data-section="album"]')!.parentElement!
    const khungBia = container.querySelector('[data-section="bia"]')!.parentElement!

    expect(khungAlbum.querySelectorAll('[aria-hidden="true"]').length).toBeGreaterThan(0)
    // Bìa chỉ có họa tiết của theme, không có chi tiết thêm nào.
    expect(
      Array.from(khungBia.querySelectorAll('[aria-hidden="true"]')).some((el) =>
        (el as HTMLElement).style.maskImage.includes(MUC.tep),
      ),
    ).toBe(false)
  })

  it('không vẽ chi tiết của phần đã bị tắt', () => {
    const thiep = {
      ...thiepMau,
      sections: [{ id: 'bia' as const }, { id: 'album' as const, enabled: false }],
      chiTietTrangTri: [chiTiet({ section: 'album' })],
    }
    const { container } = render(<InvitationRenderer thiep={thiep} theme={theme} />)
    expect(
      Array.from(container.querySelectorAll('[aria-hidden="true"]')).some((el) =>
        (el as HTMLElement).style.maskImage.includes(MUC.tep),
      ),
    ).toBe(false)
  })
})
