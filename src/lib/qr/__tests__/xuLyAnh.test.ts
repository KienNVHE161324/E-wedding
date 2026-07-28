import { describe, expect, it, vi } from 'vitest'
import { toMauDuLieuAnh, taoPngQr } from '../xuLyAnh'

describe('toMauDuLieuAnh', () => {
  it('đổi pixel tối và sáng nhưng giữ nguyên hình học', () => {
    const duLieu = {
      data: new Uint8ClampedArray([
        0, 0, 0, 255,
        255, 255, 255, 255,
        127, 127, 127, 255,
      ]),
      width: 3,
      height: 1,
      colorSpace: 'srgb',
    } as ImageData

    const ketQua = toMauDuLieuAnh(duLieu, '#112233', '#F0E0D0')
    expect(Array.from(ketQua.data)).toEqual([
      17, 34, 51, 255,
      240, 224, 208, 255,
      17, 34, 51, 255,
    ])
    expect(ketQua.width).toBe(3)
    expect(ketQua.height).toBe(1)
  })
})

describe('taoPngQr', () => {
  it('trả null khi không lấy được context canvas', async () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null)
    await expect(
      taoPngQr('/qr.png', {
        kieuKhung: 'toi-gian',
        mauQr: '#000000',
        mauNen: '#FFFFFF',
        coCanhBao: false,
      }),
    ).resolves.toBeNull()
  })
})
