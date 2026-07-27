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
})
