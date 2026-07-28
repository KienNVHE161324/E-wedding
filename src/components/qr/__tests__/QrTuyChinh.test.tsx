import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { QrTuyChinh } from '../QrTuyChinh'
import { taoAnhQrDaToMau, taoPngQr } from '@/lib/qr/xuLyAnh'

vi.mock('@/lib/qr/xuLyAnh', () => ({
  taoPngQr: vi.fn(),
  taoAnhQrDaToMau: vi.fn(),
}))

const anh = { url: '/qr.png', moTa: 'QR nhà trai' }
const themeQr = {
  kieuKhung: 'hoa-mem',
  mauQr: '#8B2F20',
  mauNen: '#FFF8EF',
} as const

describe('QrTuyChinh', () => {
  beforeEach(() => {
    vi.mocked(taoPngQr).mockResolvedValue(null)
    vi.mocked(taoAnhQrDaToMau).mockResolvedValue(null)
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
  it('khong dung lai preview da thu hoi khi doi A sang B roi quay lai A', async () => {
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:preview-a')
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined)
    vi.mocked(taoAnhQrDaToMau)
      .mockResolvedValueOnce(new Blob())
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null)

    const { rerender } = render(
      <QrTuyChinh
        anh={anh}
        themeQr={themeQr}
        kieuKhungThiep="hoa-mem"
        tuyChinh={{ mauQr: '#111111' }}
        ben="nha-trai"
      />,
    )
    await waitFor(() =>
      expect(screen.getByRole('img')).toHaveAttribute('src', 'blob:preview-a'),
    )

    rerender(
      <QrTuyChinh
        anh={anh}
        themeQr={themeQr}
        kieuKhungThiep="hoa-mem"
        tuyChinh={{ mauQr: '#222222' }}
        ben="nha-trai"
      />,
    )
    rerender(
      <QrTuyChinh
        anh={anh}
        themeQr={themeQr}
        kieuKhungThiep="hoa-mem"
        tuyChinh={{ mauQr: '#111111' }}
        ben="nha-trai"
      />,
    )

    expect(screen.getByRole('img')).not.toHaveAttribute('src', 'blob:preview-a')
  })
})
