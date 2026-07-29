import { describe, expect, it } from 'vitest'
import { layCauHinhChiTietCoChu } from '../chiTietCoChu'

describe('chi tiết có chữ', () => {
  it.each([
    'primary-decor/wedding-ritual/thiep-phong-bi-do-son-mai-dinh-01',
    'primary-decor/wedding-ritual/thiep-phong-bi-giay-do-trien-doi-chim-01',
    'primary-decor/wedding-ritual/thiep-phong-bi-xanh-ngang-doi-chim-01',
  ])('có metadata vùng chữ cho %s', (id) => {
    const cauHinh = layCauHinhChiTietCoChu(id)
    expect(cauHinh).toBeDefined()
    expect(cauHinh?.vungChu.rong).toBeGreaterThan(0)
  })

  it('không nhận họa tiết thường là chi tiết có chữ', () => {
    expect(
      layCauHinhChiTietCoChu('primary-decor/florals/F01-lotus-front'),
    ).toBeUndefined()
  })
})
