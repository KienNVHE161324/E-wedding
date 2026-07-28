import { describe, it, expect } from 'vitest'
import { invitationSchema } from '../schema'
import { thiepMau } from '../mau'

describe('invitationSchema', () => {
  it('chấp nhận thiệp mẫu', () => {
    expect(() => invitationSchema.parse(thiepMau)).not.toThrow()
  })

  it('từ chối ngày cưới sai định dạng', () => {
    expect(() => invitationSchema.parse({ ...thiepMau, ngayCuoi: '26/04/2026' })).toThrow()
  })

  it('từ chối section id không có thật', () => {
    expect(() =>
      invitationSchema.parse({ ...thiepMau, sections: [{ id: 'khong-ton-tai' }] }),
    ).toThrow()
  })

  it('từ chối slug rỗng', () => {
    expect(() => invitationSchema.parse({ ...thiepMau, slug: '' })).toThrow()
  })

  it('chấp nhận tùy chỉnh màu và độ đậm hợp lệ', () => {
    const thiep = {
      ...thiepMau,
      tuyChinhGiaoDien: { mauChinh: '#123456', doDam: { watermark: 0.15 } },
    }
    expect(() => invitationSchema.parse(thiep)).not.toThrow()
  })

  it('từ chối độ đậm ngoài khoảng 0 đến 1', () => {
    const thiep = { ...thiepMau, tuyChinhGiaoDien: { doDam: { watermark: 1.5 } } }
    expect(() => invitationSchema.parse(thiep)).toThrow()
  })

  it('từ chối slot họa tiết không có thật', () => {
    const thiep = { ...thiepMau, tuyChinhGiaoDien: { doDam: { 'khong-co': 0.5 } } }
    expect(() => invitationSchema.parse(thiep)).toThrow()
  })

  it('giữ cấu hình họa tiết theme và góc xoay chi tiết tự do', () => {
    const ketQua = invitationSchema.parse({
      ...thiepMau,
      tuyChinhGiaoDien: {
        hoaTiet: {
          watermark: {
            id: 'primary-decor/symbols/chu-hy-trien-01',
            x: 48,
            y: 42,
            kichThuoc: 55,
            gocXoay: -30,
            mau: '#123456',
            doDam: 0.25,
            raSauChu: true,
            an: false,
          },
        },
      },
      chiTietTrangTri: [
        {
          id: 'primary-decor/symbols/chu-hy-trien-01',
          section: 'bia',
          x: 50,
          y: 50,
          mau: '#123456',
          doDam: 0.5,
          kichThuoc: 25,
          gocXoay: 45,
        },
      ],
    })

    expect(ketQua.tuyChinhGiaoDien?.hoaTiet?.watermark?.gocXoay).toBe(-30)
    expect(ketQua.chiTietTrangTri?.[0].gocXoay).toBe(45)
  })

  it('từ chối góc xoay ngoài khoảng -180 đến 180', () => {
    expect(() =>
      invitationSchema.parse({
        ...thiepMau,
        tuyChinhGiaoDien: { hoaTiet: { corner: { gocXoay: 181 } } },
      }),
    ).toThrow()
    expect(() =>
      invitationSchema.parse({
        ...thiepMau,
        chiTietTrangTri: [
          {
            id: 'primary-decor/symbols/chu-hy-trien-01',
            section: 'bia',
            x: 50,
            y: 50,
            mau: '#123456',
            doDam: 0.5,
            kichThuoc: 25,
            gocXoay: -181,
          },
        ],
      }),
    ).toThrow()
  })
})
