import { describe, expect, it } from 'vitest'
import { doTuongPhan, mauQrAnToan, resolveCauHinhQr } from '../cauHinh'

describe('resolveCauHinhQr', () => {
  const theme = {
    kieuKhung: 'hoa-mem',
    mauQr: '#8B2F20',
    mauNen: '#FFF8EF',
  } as const

  it('dung cau hinh mac dinh cua theme', () => {
    expect(resolveCauHinhQr(theme)).toEqual(theme)
  })

  it('uu tien thiep roi den ghi de cua tung ben', () => {
    expect(
      resolveCauHinhQr(theme, 'toi-gian', {
        kieuKhung: 'phong-bao',
        mauQr: '#111111',
      }),
    ).toEqual({
      kieuKhung: 'phong-bao',
      mauQr: '#111111',
      mauNen: '#FFF8EF',
    })
  })
})

describe('an toan mau QR', () => {
  it('giu cap mau co do tuong phan tot', () => {
    expect(
      mauQrAnToan({
        kieuKhung: 'toi-gian',
        mauQr: '#000000',
        mauNen: '#FFFFFF',
      }),
    ).toMatchObject({ mauQr: '#000000', mauNen: '#FFFFFF', coCanhBao: false })
  })

  it('doi ve den trang khi do tuong phan thap', () => {
    expect(
      mauQrAnToan({
        kieuKhung: 'toi-gian',
        mauQr: '#F7F7F7',
        mauNen: '#FFFFFF',
      }),
    ).toMatchObject({ mauQr: '#000000', mauNen: '#FFFFFF', coCanhBao: true })
  })

  it('tinh dung ty le tuong phan den trang', () => {
    expect(doTuongPhan('#000000', '#FFFFFF')).toBeCloseTo(21, 4)
  })
})
