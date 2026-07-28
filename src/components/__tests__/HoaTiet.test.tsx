import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { HoaTiet, HoaTietTheme, HoaTietThemeTuyChinh } from '../HoaTiet'
import type { Theme } from '@/lib/themes/types'
import { DANH_SACH_HOA_TIET } from '@/lib/motifs/danhSach'

const theme: Theme = {
  id: 'thu',
  ten: 'Thử',
  mau: { nen: '#fff', chu: '#000', chinh: '#800', phu: '#666', nhan: '#b83' },
  font: { tieuDe: 'serif', noiDung: 'sans-serif' },
  hoaTiet: { watermark: 'primary-decor/symbols/chu-hy-trien-01.png' },
  doDam: { watermark: 0.1 },
  qr: { kieuKhung: 'hoa-mem', mauQr: '#800000', mauNen: '#ffffff' },
  thuTuSection: [{ id: 'bia' }],
}

const TEP = 'primary-decor/florals/F01-lotus-front.png'

describe('HoaTiet', () => {
  it('dùng ảnh làm mặt nạ chứ không hiển thị ảnh trực tiếp', () => {
    const { container } = render(<HoaTiet tep={TEP} />)
    const el = container.firstElementChild as HTMLElement
    expect(container.querySelector('img')).toBeNull()
    expect(el.style.maskImage).toContain(`/hoa-tiet/${TEP}`)
  })

  it('tô màu phụ của thiệp theo mặc định', () => {
    const { container } = render(<HoaTiet tep={TEP} />)
    expect((container.firstElementChild as HTMLElement).style.backgroundColor).toBe(
      'var(--mau-phu)',
    )
  })

  it('nhận màu tùy ý để mỗi chi tiết một màu riêng', () => {
    const { container } = render(<HoaTiet tep={TEP} mau="#123456" />)
    expect((container.firstElementChild as HTMLElement).style.backgroundColor).toBe(
      'rgb(18, 52, 86)',
    )
  })

  it('nhận độ đậm riêng', () => {
    const { container } = render(<HoaTiet tep={TEP} doDam={0.4} />)
    expect((container.firstElementChild as HTMLElement).style.opacity).toBe('0.4')
  })

  it('ẩn khỏi trình đọc màn hình vì chỉ là trang trí', () => {
    const { container } = render(<HoaTiet tep={TEP} />)
    expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true')
  })

  it('không chặn cú chạm, để không che mất nút nằm dưới', () => {
    const { container } = render(<HoaTiet tep={TEP} />)
    expect((container.firstElementChild as HTMLElement).style.pointerEvents).toBe('none')
  })
})

describe('HoaTietTheme', () => {
  it('lấy đúng tệp mà theme khai báo cho vị trí đó', () => {
    const { container } = render(<HoaTietTheme theme={theme} slot="watermark" />)
    expect((container.firstElementChild as HTMLElement).style.maskImage).toContain(
      'chu-hy-trien-01.png',
    )
  })

  it('lấy độ đậm từ biến CSS theo đúng vị trí', () => {
    const { container } = render(<HoaTietTheme theme={theme} slot="watermark" />)
    expect((container.firstElementChild as HTMLElement).style.opacity).toBe(
      'var(--do-dam-watermark, 1)',
    )
  })

  it('không vẽ gì khi theme không khai báo họa tiết cho vị trí đó', () => {
    const { container } = render(<HoaTietTheme theme={theme} slot="corner" />)
    expect(container.firstElementChild).toBeNull()
  })
})

describe('HoaTietThemeTuyChinh', () => {
  const macDinh = { x: 50, y: 50, kichThuoc: 66, gocXoay: 0, raSauChu: true }
  const mucKhac = DANH_SACH_HOA_TIET.find(
    (m) => m.tep !== theme.hoaTiet.watermark,
  )!

  it('áp dụng đầy đủ cấu hình riêng của thiệp', () => {
    const { container } = render(
      <HoaTietThemeTuyChinh
        theme={theme}
        slot="watermark"
        macDinh={macDinh}
        tuyChinh={{
          id: mucKhac.id,
          x: 42,
          y: 37,
          kichThuoc: 55,
          gocXoay: -30,
          mau: '#123456',
          doDam: 0.25,
          raSauChu: false,
        }}
      />,
    )
    const el = container.firstElementChild as HTMLElement
    expect(el.style.maskImage).toContain(mucKhac.tep)
    expect(el.style.left).toBe('42%')
    expect(el.style.top).toBe('37%')
    expect(el.style.width).toBe('55%')
    expect(el.style.transform).toBe('translate(-50%, -50%) rotate(-30deg)')
    expect(el.style.backgroundColor).toBe('rgb(18, 52, 86)')
    expect(el.style.opacity).toBe('0.25')
    expect(el.style.zIndex).toBe('20')
  })

  it('ẩn slot khi admin tắt', () => {
    const { container } = render(
      <HoaTietThemeTuyChinh
        theme={theme}
        slot="watermark"
        macDinh={macDinh}
        tuyChinh={{ an: true }}
      />,
    )
    expect(container.firstElementChild).toBeNull()
  })

  it('dùng lại asset theme nếu id tùy chỉnh không còn tồn tại', () => {
    const { container } = render(
      <HoaTietThemeTuyChinh
        theme={theme}
        slot="watermark"
        macDinh={macDinh}
        tuyChinh={{ id: 'khong-ton-tai' }}
      />,
    )
    expect((container.firstElementChild as HTMLElement).style.maskImage).toContain(
      'chu-hy-trien-01.png',
    )
  })
})
