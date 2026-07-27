import { describe, it, expect } from 'vitest'
import { xepNgayCuoi, deXuatSlug, taoThiepMoi } from '../taoMoi'
import { cacNgayCoSuKien } from '../lich'
import { invitationSchema } from '../schema'

const tt = {
  slug: 'nam-linh',
  tenChuRe: 'Nguyễn Hoài Nam',
  tenCoDau: 'Trần Thùy Linh',
  ngayCuoi: '2026-11-15',
  themeId: 'mac-dinh',
}

describe('xepNgayCuoi', () => {
  it('ngày muộn hơn luôn là ngày cưới chính, dù nhập ngược', () => {
    expect(xepNgayCuoi('2026-11-14', '2026-11-15')).toEqual({
      ngayCuoi: '2026-11-15',
      ngayPhu: '2026-11-14',
    })
    expect(xepNgayCuoi('2026-11-15', '2026-11-14')).toEqual({
      ngayCuoi: '2026-11-15',
      ngayPhu: '2026-11-14',
    })
  })

  it('chỉ một ngày thì không sinh ngày đầu', () => {
    expect(xepNgayCuoi('2026-11-15')).toEqual({ ngayCuoi: '2026-11-15' })
  })

  it('hai ngày trùng nhau coi như một ngày', () => {
    expect(xepNgayCuoi('2026-11-15', '2026-11-15')).toEqual({ ngayCuoi: '2026-11-15' })
  })

  it('xử lý được cặp ngày vắt qua hai tháng', () => {
    expect(xepNgayCuoi('2026-11-01', '2026-10-31')).toEqual({
      ngayCuoi: '2026-11-01',
      ngayPhu: '2026-10-31',
    })
  })
})

describe('taoThiepMoi với hai ngày', () => {
  it('sinh thiệp hợp lệ và đặt đúng ngày chính', () => {
    const thiep = taoThiepMoi({ ...tt, ngayPhu: '2026-11-14' })
    expect(() => invitationSchema.parse(thiep)).not.toThrow()
    expect(thiep.ngayCuoi).toBe('2026-11-15')
    expect(thiep.ngayPhu).toBe('2026-11-14')
  })

  it('không có ngayPhu khi chỉ cưới một ngày', () => {
    expect(taoThiepMoi(tt).ngayPhu).toBeUndefined()
  })
})

describe('cacNgayCoSuKien với hai ngày', () => {
  it('khách chọn được cả hai ngày dù chưa nhập mốc lịch trình nào', () => {
    expect(cacNgayCoSuKien([], '2026-11-15', '2026-11-14')).toEqual([
      '14/11/2026',
      '15/11/2026',
    ])
  })

  it('không lặp khi mốc lịch trình rơi đúng vào hai ngày đó', () => {
    const moc = [
      { ngay: '2026-11-14', gio: '09:00', ten: 'Lễ', diaDiem: '', diaChi: '' },
      { ngay: '2026-11-15', gio: '11:00', ten: 'Tiệc', diaDiem: '', diaChi: '' },
    ]
    expect(cacNgayCoSuKien(moc, '2026-11-15', '2026-11-14')).toEqual([
      '14/11/2026',
      '15/11/2026',
    ])
  })
})

describe('deXuatSlug', () => {
  it('giữ nguyên đường dẫn khi chưa ai dùng', () => {
    expect(deXuatSlug('nam-linh', ['tuan-mai'])).toBe('nam-linh')
  })

  it('thêm số khi bị trùng', () => {
    expect(deXuatSlug('nam-linh', ['nam-linh'])).toBe('nam-linh-2')
  })

  it('nhảy tiếp khi các số đầu cũng đã dùng', () => {
    expect(deXuatSlug('nam-linh', ['nam-linh', 'nam-linh-2', 'nam-linh-3'])).toBe('nam-linh-4')
  })

  it('đề xuất ra đường dẫn hợp lệ', () => {
    const goiY = deXuatSlug('nam-linh', ['nam-linh'])
    expect(goiY).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/)
  })
})
