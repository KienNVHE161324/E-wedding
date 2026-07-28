import { describe, it, expect, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MungCuoi } from '../MungCuoi'
import { thiepMau } from '@/lib/invitation/mau'
import { layTheme } from '@/lib/themes'

const theme = layTheme('mac-dinh')

function ve(kieuHopQua: boolean) {
  return render(
    <div data-invitation-root>
      <MungCuoi thiep={{ ...thiepMau, mungCuoiKieuHopQua: kieuHopQua }} theme={theme} />
    </div>,
  )
}

describe('Mừng cưới — kiểu hiện thẳng', () => {
  it('hiện luôn QR và số tài khoản của cả hai bên', () => {
    ve(false)
    expect(screen.getByAltText('QR nhà trai')).toBeInTheDocument()
    expect(screen.getByText('0123456789')).toBeInTheDocument()
    expect(screen.getByText('9876543210')).toBeInTheDocument()
  })

  it('không hiện hộp quà', () => {
    ve(false)
    expect(screen.queryByRole('button', { name: /Mở hộp quà/ })).not.toBeInTheDocument()
  })
})

describe('Mừng cưới — kiểu hộp quà', () => {
  it('ban đầu giấu QR và số tài khoản', () => {
    ve(true)
    expect(screen.queryByAltText('QR nhà trai')).not.toBeInTheDocument()
    expect(screen.queryByText('0123456789')).not.toBeInTheDocument()
  })

  it('có một phong bao cho mỗi bên', () => {
    ve(true)
    expect(screen.getByRole('button', { name: 'Mở phong bao Nhà trai' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Mở phong bao Nhà gái' })).toBeInTheDocument()
  })

  it('chạm vào phong bao thì mở popup đúng bên', async () => {
    const { container } = ve(true)
    await userEvent.click(screen.getByRole('button', { name: 'Mở phong bao Nhà trai' }))
    const dialog = screen.getByRole('dialog', { name: 'Mừng cưới Nhà trai' })
    const gocThiep = container.querySelector('[data-invitation-root]')!
    expect(dialog.parentElement?.parentElement).toBe(gocThiep)
    expect(within(dialog).getByAltText('QR nhà trai')).toBeInTheDocument()
    expect(within(dialog).getByText('0123456789')).toBeInTheDocument()
    expect(within(dialog).queryByText('9876543210')).not.toBeInTheDocument()
  })

  it('cho tải ảnh QR của đúng bên', async () => {
    ve(true)
    await userEvent.click(screen.getByRole('button', { name: 'Mở phong bao Nhà trai' }))
    expect(screen.getByRole('link', { name: 'Tải QR Nhà trai' })).toHaveAttribute(
      'href',
      thiepMau.mungCuoi[0].qrAnh!.url,
    )
    expect(screen.getByRole('link', { name: 'Tải QR Nhà trai' })).toHaveAttribute(
      'download',
      'qr-nha-trai.png',
    )
  })

  it('sao chép số tài khoản bằng nút icon nhỏ', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    })

    ve(true)
    await userEvent.click(screen.getByRole('button', { name: 'Mở phong bao Nhà gái' }))
    expect(screen.queryByText('Chép số tài khoản')).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Sao chép số tài khoản' }))

    expect(writeText).toHaveBeenCalledWith('9876543210')
    expect(screen.getByRole('button', { name: 'Đã sao chép' })).toBeInTheDocument()
  })

  it('đóng popup bằng nút đóng', async () => {
    ve(true)
    await userEvent.click(screen.getByRole('button', { name: 'Mở phong bao Nhà trai' }))
    await userEvent.click(screen.getByRole('button', { name: 'Đóng' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('đóng popup khi bấm vùng nền', async () => {
    ve(true)
    await userEvent.click(screen.getByRole('button', { name: 'Mở phong bao Nhà trai' }))
    await userEvent.click(screen.getByTestId('nen-popup-mung-cuoi'))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('đóng popup bằng phím Escape', async () => {
    ve(true)
    await userEvent.click(screen.getByRole('button', { name: 'Mở phong bao Nhà gái' }))
    await userEvent.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('luôn hiện tên bên để khách biết chọn hộp nào', () => {
    ve(true)
    expect(screen.getByText('Nhà trai')).toBeInTheDocument()
    expect(screen.getByText('Nhà gái')).toBeInTheDocument()
  })
})
