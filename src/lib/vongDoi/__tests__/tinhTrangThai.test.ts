import { describe, it, expect } from 'vitest'
import {
  tinhTrangThai,
  soNgayConLai,
  tinhNgayHetHan,
  SO_NGAY_MAC_DINH,
} from '../tinhTrangThai'

const bayGio = new Date('2026-11-01T00:00:00Z')

describe('tinhTrangThai', () => {
  it('thiệp chưa xuất bản luôn là nháp', () => {
    expect(
      tinhTrangThai({ trangThaiLuu: 'nhap', ngayXuatBan: null, ngayHetHan: null }, bayGio),
    ).toBe('nhap')
  })

  it('thiệp đã xuất bản và còn hạn là đang mở', () => {
    expect(
      tinhTrangThai(
        {
          trangThaiLuu: 'da-xuat-ban',
          ngayXuatBan: '2026-10-25T00:00:00Z',
          ngayHetHan: '2026-11-08T00:00:00Z',
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
          ngayHetHan: '2026-10-15T00:00:00Z',
        },
        bayGio,
      ),
    ).toBe('het-han')
  })

  it('thiệp đã xuất bản không có ngày hết hạn thì không bao giờ hết hạn', () => {
    expect(
      tinhTrangThai(
        { trangThaiLuu: 'da-xuat-ban', ngayXuatBan: '2026-01-01T00:00:00Z', ngayHetHan: null },
        bayGio,
      ),
    ).toBe('da-xuat-ban')
  })

  it('đúng thời khắc hết hạn thì coi là hết hạn', () => {
    expect(
      tinhTrangThai(
        {
          trangThaiLuu: 'da-xuat-ban',
          ngayXuatBan: '2026-10-18T00:00:00Z',
          ngayHetHan: '2026-11-01T00:00:00Z',
        },
        bayGio,
      ),
    ).toBe('het-han')
  })

  it('thiệp nháp dù có ngày hết hạn cũ vẫn là nháp', () => {
    expect(
      tinhTrangThai(
        { trangThaiLuu: 'nhap', ngayXuatBan: null, ngayHetHan: '2026-01-01T00:00:00Z' },
        bayGio,
      ),
    ).toBe('nhap')
  })
})

describe('soNgayConLai', () => {
  it('đếm đúng số ngày còn lại', () => {
    expect(soNgayConLai('2026-11-08T00:00:00Z', bayGio)).toBe(7)
  })

  it('trả về 0 khi đã hết hạn', () => {
    expect(soNgayConLai('2026-10-01T00:00:00Z', bayGio)).toBe(0)
  })

  it('trả về null khi không có ngày hết hạn', () => {
    expect(soNgayConLai(null, bayGio)).toBeNull()
  })
})

describe('tinhNgayHetHan', () => {
  it('mặc định là 14 ngày', () => {
    expect(SO_NGAY_MAC_DINH).toBe(14)
    expect(tinhNgayHetHan(new Date('2026-11-01T00:00:00Z'))).toBe('2026-11-15T00:00:00.000Z')
  })

  it('nhận số ngày tùy chỉnh', () => {
    expect(tinhNgayHetHan(new Date('2026-11-01T00:00:00Z'), 30)).toBe('2026-12-01T00:00:00.000Z')
  })
})
