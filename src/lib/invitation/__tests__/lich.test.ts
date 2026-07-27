import { describe, it, expect } from 'vitest'
import {
  luoiLichThang,
  ngayTrongThang,
  tenThang,
  sapXepLichTrinh,
  cacNgayCoSuKien,
  TEN_THU,
} from '../lich'
import type { SuKien } from '../types'

describe('luoiLichThang', () => {
  it('tuần bắt đầu từ Thứ Hai', () => {
    expect(TEN_THU[0]).toBe('T2')
    expect(TEN_THU[6]).toBe('CN')
  })

  it('mỗi tuần đủ 7 ô', () => {
    for (const tuan of luoiLichThang('2026-11-14')) {
      expect(tuan).toHaveLength(7)
    }
  })

  it('đặt ngày 1 đúng cột thứ trong tuần', () => {
    // 01/11/2026 là Chủ Nhật, tức cột cuối cùng.
    const tuanDau = luoiLichThang('2026-11-14')[0]
    expect(tuanDau[6]).toBe(1)
    expect(tuanDau.slice(0, 6)).toEqual([null, null, null, null, null, null])
  })

  it('chứa đủ số ngày của tháng', () => {
    const ngay = luoiLichThang('2026-11-14').flat().filter((o) => o !== null)
    expect(ngay).toHaveLength(30)
    expect(ngay[29]).toBe(30)
  })

  it('xử lý đúng tháng 2 năm nhuận', () => {
    const ngay = luoiLichThang('2028-02-10').flat().filter((o) => o !== null)
    expect(ngay).toHaveLength(29)
  })

  it('xử lý đúng tháng 2 năm không nhuận', () => {
    const ngay = luoiLichThang('2026-02-10').flat().filter((o) => o !== null)
    expect(ngay).toHaveLength(28)
  })

  it('tháng bắt đầu đúng Thứ Hai thì không có ô trống đầu', () => {
    // 01/06/2026 là Thứ Hai.
    expect(luoiLichThang('2026-06-15')[0][0]).toBe(1)
  })
})

describe('ngayTrongThang và tenThang', () => {
  it('lấy đúng ngày để khoanh tròn', () => {
    expect(ngayTrongThang('2026-11-14')).toBe(14)
  })

  it('ghi tên tháng bằng tiếng Việt, bỏ số 0 thừa', () => {
    expect(tenThang('2026-06-15')).toBe('Tháng 6 năm 2026')
  })
})

const moc = (ngay: string, gio: string, ten: string): SuKien => ({
  ngay,
  gio,
  ten,
  diaDiem: '',
})

describe('sapXepLichTrinh', () => {
  it('xếp theo giờ trong cùng một ngày', () => {
    const ds = [moc('2026-11-14', '11:00', 'Tiệc'), moc('2026-11-14', '06:30', 'Đón dâu')]
    expect(sapXepLichTrinh(ds).map((s) => s.ten)).toEqual(['Đón dâu', 'Tiệc'])
  })

  it('xếp theo ngày trước rồi mới tới giờ', () => {
    const ds = [moc('2026-11-15', '06:00', 'Hôm sau'), moc('2026-11-14', '23:00', 'Hôm trước')]
    expect(sapXepLichTrinh(ds).map((s) => s.ten)).toEqual(['Hôm trước', 'Hôm sau'])
  })

  it('không sửa mảng gốc', () => {
    const ds = [moc('2026-11-14', '11:00', 'Tiệc'), moc('2026-11-14', '06:30', 'Đón dâu')]
    sapXepLichTrinh(ds)
    expect(ds[0].ten).toBe('Tiệc')
  })
})

describe('cacNgayCoSuKien', () => {
  it('gộp ngày cưới với ngày của các mốc, không trùng lặp', () => {
    const ds = [moc('2026-11-14', '06:30', 'Đón dâu'), moc('2026-11-15', '11:00', 'Tiệc')]
    expect(cacNgayCoSuKien(ds, '2026-11-14')).toEqual(['14/11/2026', '15/11/2026'])
  })

  it('vẫn có ngày cưới khi chưa nhập mốc nào', () => {
    expect(cacNgayCoSuKien([], '2026-11-14')).toEqual(['14/11/2026'])
  })
})
