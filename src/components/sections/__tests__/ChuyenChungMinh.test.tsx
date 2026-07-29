import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ChuyenChungMinh } from '../ChuyenChungMinh'
import { thiepMau } from '@/lib/invitation/mau'
import { layTheme } from '@/lib/themes'

const theme = layTheme('mac-dinh')

describe('Chuyện chúng mình', () => {
  it('dùng ID đã lưu cho tiêu đề câu chuyện đầu tiên đang được render', () => {
    const { container } = render(
      <ChuyenChungMinh
        thiep={{
          ...thiepMau,
          chuyenChungMinh: [
            {
              ...thiepMau.chuyenChungMinh[0],
              id: 'story-a',
              tieuDe: 'Mốc đầu tiên',
              noiDung: 'Nội dung chưa được renderer hiển thị',
            },
            {
              ...thiepMau.chuyenChungMinh[1],
              id: 'story-b',
              tieuDe: 'Mốc chưa render',
            },
          ],
          tuyChinhChu: {
            'chuyen-chung-minh.tieu-de': { mauChu: '#123456' },
            'chuyen-chung-minh.story-a.tieu-de': {
              mauChu: '#654321',
              x: 4,
            },
          },
        }}
        theme={theme}
      />,
    )

    expect(
      container.querySelector('[data-text-region="chuyen-chung-minh.tieu-de"]'),
    ).toHaveTextContent('Chuyện chúng mình')
    const tieuDe = container.querySelector(
      '[data-text-region="chuyen-chung-minh.story-a.tieu-de"]',
    ) as HTMLElement
    expect(tieuDe).toHaveTextContent('Mốc đầu tiên')
    expect(tieuDe.style.color).toBe('rgb(101, 67, 33)')
    expect(tieuDe.style.transform).toBe('translate(4cqw, 0cqw)')

    expect(screen.queryByText('Nội dung chưa được renderer hiển thị')).not.toBeInTheDocument()
    expect(screen.queryByText('Mốc chưa render')).not.toBeInTheDocument()
    expect(
      container.querySelector('[data-text-region$=".noi-dung"]'),
    ).not.toBeInTheDocument()
    expect(
      container.querySelector('[data-text-region^="chuyen-chung-minh.story-b."]'),
    ).not.toBeInTheDocument()
  })

  it('giữ tiêu đề câu chuyện dữ liệu cũ thiếu ID là chữ thường', () => {
    render(<ChuyenChungMinh thiep={thiepMau} theme={theme} />)

    expect(screen.getByText(thiepMau.chuyenChungMinh[0].tieuDe)).not.toHaveAttribute(
      'data-text-region',
    )
  })
})
