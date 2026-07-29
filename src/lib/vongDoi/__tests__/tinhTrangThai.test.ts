import { describe, it, expect } from 'vitest'
import { tinhTrangThai } from '../tinhTrangThai'

const bayGio = new Date('2026-11-01T00:00:00Z')

describe('tinhTrangThai', () => {
  it('suy ra đúng trạng thái tại các ranh giới mở và đóng', () => {
    const vd = {
      trangThaiLuu: 'da-xuat-ban' as const,
      ngayXuatBan: '2026-08-01T01:00:00.000Z',
      ngayDong: '2026-08-20T16:00:00.000Z',
    }

    expect(tinhTrangThai(vd, new Date('2026-08-01T00:59:59.999Z'))).toBe('da-len-lich')
    expect(tinhTrangThai(vd, new Date('2026-08-01T01:00:00.000Z'))).toBe('da-xuat-ban')
    expect(tinhTrangThai(vd, new Date('2026-08-20T15:59:59.999Z'))).toBe('da-xuat-ban')
    expect(tinhTrangThai(vd, new Date('2026-08-20T16:00:00.000Z'))).toBe('het-han')
  })

  it('thiệp đã hủy luôn có trạng thái đã hủy', () => {
    expect(
      tinhTrangThai(
        {
          trangThaiLuu: 'da-huy',
          ngayXuatBan: '2026-08-01T01:00:00.000Z',
          ngayDong: '2026-08-20T16:00:00.000Z',
        },
        bayGio,
      ),
    ).toBe('da-huy')
  })

  it('thiệp chưa xuất bản luôn là nháp', () => {
    expect(
      tinhTrangThai({ trangThaiLuu: 'nhap', ngayXuatBan: null, ngayDong: null }, bayGio),
    ).toBe('nhap')
  })

  it('thiệp đã xuất bản và còn hạn là đang mở', () => {
    expect(
      tinhTrangThai(
        {
          trangThaiLuu: 'da-xuat-ban',
          ngayXuatBan: '2026-10-25T00:00:00Z',
          ngayDong: '2026-11-08T00:00:00Z',
        },
        bayGio,
      ),
    ).toBe('da-xuat-ban')
  })

  it('thiệp đã qua ngày hết hạn là hết hạn', () => {
    expect(
      tinhTrangThai(
        {
          trangThaiLuu: 'da-xuat-ban',
          ngayXuatBan: '2026-10-01T00:00:00Z',
          ngayDong: '2026-10-15T00:00:00Z',
        },
        bayGio,
      ),
    ).toBe('het-han')
  })

  it('thiệp thiếu ngày đóng trở về trạng thái nháp', () => {
    expect(
      tinhTrangThai(
        { trangThaiLuu: 'da-xuat-ban', ngayXuatBan: '2026-01-01T00:00:00Z', ngayDong: null },
        bayGio,
      ),
    ).toBe('nhap')
  })

  it('đúng thời khắc hết hạn thì coi là hết hạn', () => {
    expect(
      tinhTrangThai(
        {
          trangThaiLuu: 'da-xuat-ban',
          ngayXuatBan: '2026-10-18T00:00:00Z',
          ngayDong: '2026-11-01T00:00:00Z',
        },
        bayGio,
      ),
    ).toBe('het-han')
  })

  it('thiệp nháp dù có ngày hết hạn cũ vẫn là nháp', () => {
    expect(
      tinhTrangThai(
        { trangThaiLuu: 'nhap', ngayXuatBan: null, ngayDong: '2026-01-01T00:00:00Z' },
        bayGio,
      ),
    ).toBe('nhap')
  })
})
