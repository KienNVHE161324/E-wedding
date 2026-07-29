import { describe, it, expect, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MungCuoi } from '../MungCuoi'
import { thiepMau } from '@/lib/invitation/mau'
import { layTheme } from '@/lib/themes'
import styles from '../MungCuoi.module.css'
import type { Invitation } from '@/lib/invitation/types'

const theme = layTheme('mac-dinh')

function ve(kieuHopQua: boolean, thiep: Invitation = thiepMau) {
  return render(
    <div data-invitation-root>
      <MungCuoi thiep={{ ...thiep, mungCuoiKieuHopQua: kieuHopQua }} theme={theme} />
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

  it('gắn các trường ngân hàng theo tên bên dù dữ liệu đổi thứ tự', () => {
    const { container } = ve(false, {
      ...thiepMau,
      mungCuoi: [...thiepMau.mungCuoi].reverse(),
      tuyChinhChu: {
        'mung-cuoi.nha-trai.chu-tai-khoan': { mauChu: '#123456' },
        'mung-cuoi.nha-gai.chu-tai-khoan': { mauChu: '#654321' },
      },
    })

    expect(
      container.querySelector('[data-text-region="mung-cuoi.tieu-de"]'),
    ).toBeInTheDocument()
    for (const ben of ['nha-trai', 'nha-gai']) {
      for (const truong of [
        'ten-ben',
        'chu-tai-khoan',
        'so-tai-khoan',
        'ngan-hang',
        'nut-sao-chep',
      ]) {
        expect(
          container.querySelectorAll(`[data-text-region="mung-cuoi.${ben}.${truong}"]`),
        ).toHaveLength(1)
      }
    }

    const nhaTrai = container.querySelector(
      '[data-text-region="mung-cuoi.nha-trai.chu-tai-khoan"]',
    ) as HTMLElement
    const nhaGai = container.querySelector(
      '[data-text-region="mung-cuoi.nha-gai.chu-tai-khoan"]',
    ) as HTMLElement
    expect(nhaTrai).toHaveTextContent(thiepMau.mungCuoi[0].chuTaiKhoan)
    expect(nhaTrai.style.color).toBe('rgb(18, 52, 86)')
    expect(nhaGai).toHaveTextContent(thiepMau.mungCuoi[1].chuTaiKhoan)
    expect(nhaGai.style.color).toBe('rgb(101, 67, 33)')
    expect(
      container.querySelector('[data-text-region^="mung-cuoi.0."]'),
    ).not.toBeInTheDocument()
  })

  it('giữ dữ liệu có bên trùng là chữ thường thay vì tạo ID semantic trùng', () => {
    const nhaTrai = thiepMau.mungCuoi[0]
    const { container } = ve(false, {
      ...thiepMau,
      mungCuoi: [
        nhaTrai,
        {
          ...nhaTrai,
          chuTaiKhoan: 'Chủ tài khoản trùng',
          soTaiKhoan: '111122223333',
        },
      ],
    })

    expect(
      container.querySelectorAll('[data-text-region^="mung-cuoi.nha-trai."]'),
    ).toHaveLength(0)
    expect(screen.getByText(nhaTrai.chuTaiKhoan)).not.toHaveAttribute(
      'data-text-region',
    )
    expect(screen.getByText('Chủ tài khoản trùng')).not.toHaveAttribute(
      'data-text-region',
    )
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
    expect(
      dialog.querySelector('[data-text-region="popup-mung-cuoi.tieu-de"]'),
    ).toBeInTheDocument()
    expect(
      dialog.querySelector('[data-text-region="mung-cuoi.nha-trai.chu-tai-khoan"]'),
    ).toHaveTextContent(thiepMau.mungCuoi[0].chuTaiKhoan)
    expect(
      screen.getByText('Chạm để mở', { selector: '[data-text-region="mung-cuoi.nha-gai.goi-y-mo"]' }),
    ).toBeInTheDocument()

    const nutDong = within(dialog).getByRole('button', { name: 'Đóng' })
    expect(nutDong).not.toHaveAttribute('data-text-region')
    expect(nutDong.querySelector('[data-text-region]')).not.toBeInTheDocument()
  })

  it('không tạo trường semantic trong popup khi dữ liệu có bên trùng', async () => {
    const nhaTrai = thiepMau.mungCuoi[0]
    ve(true, {
      ...thiepMau,
      mungCuoi: [
        nhaTrai,
        {
          ...nhaTrai,
          chuTaiKhoan: 'Chủ tài khoản trùng',
          soTaiKhoan: '111122223333',
        },
      ],
    })

    await userEvent.click(
      screen.getAllByRole('button', { name: 'Mở phong bao Nhà trai' })[0],
    )
    const dialog = screen.getByRole('dialog', { name: 'Mừng cưới Nhà trai' })
    expect(
      dialog.querySelectorAll('[data-text-region^="mung-cuoi.nha-trai."]'),
    ).toHaveLength(0)
    expect(
      dialog.querySelector('[data-text-region="popup-mung-cuoi.tieu-de"]'),
    ).toBeInTheDocument()
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
    const nutSaoChep = screen.getByRole('button', { name: 'Đã sao chép' })
    expect(nutSaoChep).toBeInTheDocument()
    expect(nutSaoChep.querySelector('[data-text-region]')).not.toBeInTheDocument()
  })

  it('căn riêng ngân hàng và số tài khoản vào giữa, không thêm nhãn', async () => {
    ve(true)
    await userEvent.click(screen.getByRole('button', { name: 'Mở phong bao Nhà trai' }))

    expect(screen.getByText('Vietcombank')).toHaveClass(styles.dongNganHang)
    expect(screen.getByText('0123456789')).toHaveClass(styles.giaTriSoTaiKhoan)
    expect(screen.queryByText(/^Ngân hàng:/)).not.toBeInTheDocument()
    expect(screen.queryByText(/^STK:/)).not.toBeInTheDocument()
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
