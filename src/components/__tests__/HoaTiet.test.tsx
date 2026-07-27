import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { HoaTiet } from '../HoaTiet'
import type { Theme } from '@/lib/themes/types'

const theme: Theme = {
  id: 'thu',
  ten: 'Thử',
  mau: { nen: '#fff', chu: '#000', chinh: '#800', phu: '#666', nhan: '#b83' },
  font: { tieuDe: 'serif', noiDung: 'sans-serif' },
  hoaTiet: { watermark: 'hoa-sen.png' },
  doDam: { watermark: 0.1 },
  thuTuSection: [{ id: 'bia' }],
}

describe('HoaTiet', () => {
  it('dùng ảnh làm mặt nạ chứ không hiển thị ảnh trực tiếp', () => {
    const { container } = render(<HoaTiet theme={theme} slot="watermark" />)
    const el = container.firstElementChild as HTMLElement
    expect(container.querySelector('img')).toBeNull()
    expect(el.style.maskImage).toContain('/hoa-tiet/hoa-sen.png')
  })

  it('tô màu phụ của thiệp theo mặc định', () => {
    const { container } = render(<HoaTiet theme={theme} slot="watermark" />)
    const el = container.firstElementChild as HTMLElement
    expect(el.style.backgroundColor).toBe('var(--mau-phu)')
  })

  it('nhận màu tô tùy ý để đổi màu họa tiết', () => {
    const { container } = render(<HoaTiet theme={theme} slot="watermark" mau="var(--mau-chinh)" />)
    const el = container.firstElementChild as HTMLElement
    expect(el.style.backgroundColor).toBe('var(--mau-chinh)')
  })

  it('lấy độ đậm từ biến CSS theo đúng slot', () => {
    const { container } = render(<HoaTiet theme={theme} slot="watermark" />)
    const el = container.firstElementChild as HTMLElement
    expect(el.style.opacity).toBe('var(--do-dam-watermark, 1)')
  })

  it('không vẽ gì khi theme không khai báo họa tiết cho slot đó', () => {
    const { container } = render(<HoaTiet theme={theme} slot="corner" />)
    expect(container.firstElementChild).toBeNull()
  })

  it('ẩn khỏi trình đọc màn hình vì chỉ là trang trí', () => {
    const { container } = render(<HoaTiet theme={theme} slot="watermark" />)
    expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true')
  })
})
