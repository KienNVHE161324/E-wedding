import { describe, it, expect } from 'vitest'
import { taoThiepMoi, slugHopLe } from '../taoMoi'
import { invitationSchema } from '../schema'
import { layTheme } from '@/lib/themes'

const tt = {
  slug: 'nam-linh',
  tenChuRe: 'Nguyễn Hoài Nam',
  tenCoDau: 'Trần Thùy Linh',
  ngayCuoi: '2026-11-14',
  themeId: 'mac-dinh',
}

describe('slugHopLe', () => {
  it('chấp nhận chữ thường, số và gạch ngang', () => {
    expect(slugHopLe('nam-linh-2026')).toBe(true)
  })

  it('từ chối chữ hoa, dấu tiếng Việt và khoảng trắng', () => {
    expect(slugHopLe('Nam-Linh')).toBe(false)
    expect(slugHopLe('nam linh')).toBe(false)
    expect(slugHopLe('nam-lình')).toBe(false)
  })

  it('từ chối slug rỗng hoặc chỉ có gạch ngang', () => {
    expect(slugHopLe('')).toBe(false)
    expect(slugHopLe('---')).toBe(false)
  })

  it('từ chối slug trùng với đường dẫn hệ thống', () => {
    expect(slugHopLe('admin')).toBe(false)
    expect(slugHopLe('api')).toBe(false)
    expect(slugHopLe('dang-nhap')).toBe(false)
    expect(slugHopLe('tao-moi')).toBe(false)
  })
})

describe('taoThiepMoi', () => {
  it('sinh ra thiệp hợp lệ theo schema', () => {
    expect(() => invitationSchema.parse(taoThiepMoi(tt))).not.toThrow()
  })

  it('giữ kiểu QR được chọn khi tạo', () => {
    expect(taoThiepMoi({ ...tt, kieuKhungQr: 'phong-bao' }).kieuKhungQr).toBe(
      'phong-bao',
    )
    expect(taoThiepMoi(tt).kieuKhungQr).toBeUndefined()
  })

  it('điền đúng thông tin tối thiểu', () => {
    const thiep = taoThiepMoi(tt)
    expect(thiep.slug).toBe('nam-linh')
    expect(thiep.chuRe.ten).toBe('Nguyễn Hoài Nam')
    expect(thiep.coDau.ten).toBe('Trần Thùy Linh')
    expect(thiep.ngayCuoi).toBe('2026-11-14')
    expect(thiep.themeId).toBe('mac-dinh')
  })

  it('lấy thứ tự phần mặc định của theme', () => {
    expect(taoThiepMoi(tt).sections).toEqual(layTheme('mac-dinh').thuTuSection)
  })

  it('để trống các phần nội dung để admin điền dần', () => {
    const thiep = taoThiepMoi(tt)
    expect(thiep.album).toEqual([])
    expect(thiep.chuyenChungMinh).toEqual([])
    expect(thiep.suKien).toEqual([])
    expect(thiep.chuyenChungMinh.every((moc) => Boolean(moc.id))).toBe(true)
    expect(thiep.suKien.every((moc) => Boolean(moc.id))).toBe(true)
  })

  it('dựng sẵn hai ô mừng cưới nhà trai và nhà gái để admin chỉ việc điền', () => {
    expect(taoThiepMoi(tt).mungCuoi.map((o) => o.ben)).toEqual(['nha-trai', 'nha-gai'])
  })

  it('báo lỗi khi slug không hợp lệ', () => {
    expect(() => taoThiepMoi({ ...tt, slug: 'Nam Linh' })).toThrow('Đường dẫn không hợp lệ')
  })
})
