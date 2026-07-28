import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { QrTuyChinh } from '../QrTuyChinh'
import { taoPngQr } from '@/lib/qr/xuLyAnh'

vi.mock('@/lib/qr/xuLyAnh', () => ({ taoPngQr: vi.fn() }))

const anh = { url: '/qr.png', moTa: 'QR nhà trai' }
const themeQr = {
  kieuKhung: 'hoa-mem',
  mauQr: '#8B2F20',
  mauNen: '#FFF8EF',
} as const

describe('QrTuyChinh', () => {
  beforeEach(() => {
    vi.mocked(taoPngQr).mockResolvedValue(null)
  })

  it('giữ ảnh đơn giản cho thiệp cũ chưa có cấu hình', () => {
    render(<QrTuyChinh anh={anh} themeQr={themeQr} ben="nha-trai" />)
    expect(screen.getByAltText('QR nhà trai')).toHaveAttribute('src')
    expect(screen.queryByTestId('khung-qr-tuy-chinh')).not.toBeInTheDocument()
  })

  it.each(['toi-gian', 'hoa-mem', 'phong-bao'] as const)(
    'render preset %s',
    (kieu) => {
      render(
        <QrTuyChinh
          anh={anh}
          themeQr={themeQr}
          kieuKhungThiep={kieu}
          ben="nha-trai"
        />,
      )
      expect(screen.getByTestId('khung-qr-tuy-chinh')).toHaveAttribute(
        'data-kieu-qr',
        kieu,
      )
    },
  )

  it('đánh dấu fallback màu khi độ tương phản thấp', () => {
    render(
      <QrTuyChinh
        anh={anh}
        themeQr={themeQr}
        kieuKhungThiep="toi-gian"
        tuyChinh={{ mauQr: '#FAFAFA', mauNen: '#FFFFFF' }}
        ben="nha-trai"
      />,
    )
    expect(screen.getByTestId('khung-qr-tuy-chinh')).toHaveAttribute(
      'data-mau-fallback',
      'true',
    )
  })

  it('giữ link ảnh gốc nếu xuất PNG thất bại', async () => {
    render(
      <QrTuyChinh
        anh={anh}
        themeQr={themeQr}
        kieuKhungThiep="hoa-mem"
        ben="nha-trai"
        choTai
      />,
    )
    await userEvent.click(screen.getByRole('link', { name: 'Tải QR Nhà trai' }))
    await waitFor(() => expect(taoPngQr).toHaveBeenCalled())
    expect(screen.getByRole('link', { name: 'Tải QR Nhà trai' })).toHaveAttribute(
      'href',
      '/qr.png',
    )
  })
})
