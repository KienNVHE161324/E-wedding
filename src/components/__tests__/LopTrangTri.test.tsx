import { describe, it, expect, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LopTrangTri } from '../LopTrangTri'
import { InvitationRenderer } from '../InvitationRenderer'
import { thiepMau } from '@/lib/invitation/mau'
import { layTheme } from '@/lib/themes'
import { DANH_SACH_HOA_TIET } from '@/lib/motifs/danhSach'
import type { ChiTietTrangTri } from '@/lib/invitation/types'
import { ChonChiTiet } from '@/components/admin/ChonChiTiet'
import { TuyChinhHoaTietTheme } from '@/components/admin/TuyChinhHoaTietTheme'

const theme = layTheme('mac-dinh')

// Chọn asset mà theme mặc định KHÔNG dùng, để phân biệt được
// họa tiết của theme với chi tiết nhân viên tự thêm.
const dungBoiTheme = new Set(Object.values(theme.hoaTiet))
const MUC = DANH_SACH_HOA_TIET.find((m) => !dungBoiTheme.has(m.tep))!

const chiTiet = (ghiDe: Partial<ChiTietTrangTri> = {}): ChiTietTrangTri => ({
  id: MUC.id,
  section: 'bia',
  x: 50,
  y: 10,
  mau: '#8B2F20',
  doDam: 0.8,
  kichThuoc: 25,
  ...ghiDe,
})

describe('LopTrangTri', () => {
  it('cho phép chọn chi tiết nghi lễ cưới từ Image_collections', async () => {
    render(<ChonChiTiet giaTri={[]} section="bia" onDoi={() => {}} />)
    await userEvent.click(screen.getByRole('button', { name: 'Thêm chi tiết' }))
    await userEvent.selectOptions(screen.getByLabelText('Nhóm chi tiết'), 'Nghi lễ cưới')

    expect(
      screen.getByRole('button', { name: 'Thêm banh phu the cap chong 01' }),
    ).toBeInTheDocument()
  })

  it('chi tiết mới mặc định nằm sau chữ', async () => {
    const onDoi = vi.fn()
    render(<ChonChiTiet giaTri={[]} section="bia" onDoi={onDoi} />)

    await userEvent.click(screen.getByRole('button', { name: 'Thêm chi tiết' }))
    const cacNutThem = screen.getAllByRole('button', { name: /^Thêm / })
    await userEvent.click(cacNutThem[0])

    expect(onDoi).toHaveBeenCalledWith([
      expect.objectContaining({ section: 'bia', raSauChu: true }),
    ])
  })

  it('cho xoay chi tiết tự do mà không làm mất cấu hình khác', () => {
    const onDoi = vi.fn()
    const banDau = chiTiet({ gocXoay: 10 })
    render(<ChonChiTiet giaTri={[banDau]} section="bia" onDoi={onDoi} />)

    fireEvent.change(screen.getByLabelText(`Góc xoay của ${MUC.nhan}`), {
      target: { value: '35' },
    })

    expect(onDoi).toHaveBeenCalledWith([{ ...banDau, gocXoay: 35 }])
  })

  it('editor theme cập nhật góc xoay và giữ các override còn lại', () => {
    const onDoi = vi.fn()
    render(
      <TuyChinhHoaTietTheme
        slot="watermark"
        nhan="Họa tiết nền"
        theme={theme}
        giaTri={{ x: 45, mau: '#123456', gocXoay: 10 }}
        onDoi={onDoi}
      />,
    )

    fireEvent.change(screen.getByLabelText('Góc xoay của Họa tiết nền'), {
      target: { value: '35' },
    })

    expect(onDoi).toHaveBeenCalledWith({ x: 45, mau: '#123456', gocXoay: 35 })
  })

  it('vẽ chi tiết với đúng màu, độ đậm và kích thước đã chọn', () => {
    const { container } = render(<LopTrangTri chiTiet={[chiTiet({ gocXoay: 45 })]} />)
    const el = container.firstElementChild as HTMLElement
    expect(el.style.backgroundColor).toBe('rgb(139, 47, 32)')
    expect(el.style.opacity).toBe('0.8')
    expect(el.style.width).toBe('25%')
    expect(el.style.transform).toBe('translate(-50%, -50%) rotate(45deg)')
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
  it('chỉ vẽ chi tiết ở phần được chỉ định', async () => {
    const thiep = {
      ...thiepMau,
      sections: [{ id: 'bia' as const }, { id: 'album' as const }],
      chiTietTrangTri: [chiTiet({ section: 'album' })],
    }
    const { container } = render(<InvitationRenderer thiep={thiep} theme={theme} />)
    await userEvent.click(screen.getByRole('button', { name: 'Mở thiệp' }))

    const khungAlbum = container.querySelector('[data-section="album"]')!.closest('.isolate')!
    const khungBia = container.querySelector('[data-section="bia"]')!.closest('.isolate')!

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
