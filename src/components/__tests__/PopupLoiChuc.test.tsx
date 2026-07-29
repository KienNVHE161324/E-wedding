import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { PopupLoiChuc } from '../PopupLoiChuc'
import { thiepMau } from '@/lib/invitation/mau'

describe('Popup lời chúc', () => {
  it('chỉ đăng ký tiêu đề nhìn thấy, không đăng ký nhãn form, placeholder hay nút đóng', () => {
    render(
      <PopupLoiChuc
        thiep={{
          ...thiepMau,
          tuyChinhChu: {
            'popup-loi-chuc.tieu-de': {
              noiDung: 'Viết lời chúc',
              mauChu: '#123456',
            },
          },
        }}
        onDong={vi.fn()}
        onDaGui={vi.fn()}
      />,
    )

    const tieuDe = screen.getByText('Viết lời chúc')
    expect(tieuDe).toHaveAttribute(
      'data-text-region',
      'popup-loi-chuc.tieu-de',
    )
    expect(tieuDe.style.color).toBe('rgb(18, 52, 86)')

    for (const nhan of ['Tên của bạn', 'Lời chúc']) {
      expect(screen.getByText(nhan).closest('[data-text-region]')).toBeNull()
    }
    expect(
      screen.getByPlaceholderText('Chúc hai bạn trăm năm hạnh phúc.'),
    ).not.toHaveAttribute('data-text-region')

    const nutDong = screen.getByRole('button', { name: 'Đóng' })
    expect(nutDong).not.toHaveAttribute('data-text-region')
    expect(nutDong.querySelector('[data-text-region]')).not.toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Gửi lời chúc ngay' }).querySelector(
        '[data-text-region]',
      ),
    ).not.toBeInTheDocument()
  })
})
