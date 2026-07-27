import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DressCode } from '../DressCode'
import { thiepMau } from '@/lib/invitation/mau'
import { layTheme } from '@/lib/themes'

const theme = layTheme('mac-dinh')

function ve(dressCode: { moTa: string; mauSac: string[] } | undefined) {
  return render(<DressCode thiep={{ ...thiepMau, dressCode }} theme={theme} />)
}

describe('Dress code', () => {
  it('hiện nội dung và đủ số ô màu', () => {
    ve({ moTa: 'Mời quý khách mặc tông đỏ – be', mauSac: ['#8B2F20', '#F5EFE2', '#B0833C'] })
    expect(screen.getByText('Mời quý khách mặc tông đỏ – be')).toBeInTheDocument()
    expect(screen.getAllByLabelText(/Màu gợi ý/)).toHaveLength(3)
  })

  it('tô đúng màu đã chọn cho từng ô', () => {
    ve({ moTa: '', mauSac: ['#8B2F20'] })
    expect(screen.getByLabelText('Màu gợi ý #8B2F20')).toHaveStyle({
      backgroundColor: 'rgb(139, 47, 32)',
    })
  })

  it('hiện được khi chỉ có màu, không có mô tả', () => {
    const { container } = ve({ moTa: '', mauSac: ['#8B2F20'] })
    expect(container.querySelector('[data-section="dress-code"]')).not.toBeNull()
  })

  it('hiện được khi chỉ có mô tả, không có màu', () => {
    ve({ moTa: 'Trang phục lịch sự', mauSac: [] })
    expect(screen.getByText('Trang phục lịch sự')).toBeInTheDocument()
  })

  it('tự ẩn khi chưa nhập gì', () => {
    const { container } = ve({ moTa: '   ', mauSac: [] })
    expect(container.querySelector('[data-section="dress-code"]')).toBeNull()
  })

  it('tự ẩn khi thiệp không có mục dress code', () => {
    const { container } = ve(undefined)
    expect(container.querySelector('[data-section="dress-code"]')).toBeNull()
  })
})
