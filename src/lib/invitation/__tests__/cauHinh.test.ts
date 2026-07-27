import { describe, it, expect } from 'vitest'
import {
  taoGoiCauHinh,
  docGoiCauHinh,
  tenTepCauHinh,
  PHIEN_BAN_CAU_HINH,
} from '../cauHinh'
import { thiepMau } from '../mau'

const LUC = new Date('2026-07-27T10:30:00Z')

describe('taoGoiCauHinh', () => {
  it('gói đủ thiệp, mã đám cưới và thời điểm xuất', () => {
    const goi = taoGoiCauHinh(thiepMau, LUC)
    expect(goi.phienBan).toBe(PHIEN_BAN_CAU_HINH)
    expect(goi.slug).toBe('nam-linh')
    expect(goi.xuatLuc).toBe('2026-07-27T10:30:00.000Z')
    expect(goi.thiep.chuRe.ten).toBe('Nguyễn Hoài Nam')
  })

  it('giữ nguyên chi tiết trang trí và tùy chỉnh màu', () => {
    const thiep = {
      ...thiepMau,
      tuyChinhGiaoDien: { mauChinh: '#123456' },
      chiTietTrangTri: [
        {
          id: 'x',
          section: 'bia' as const,
          viTri: 'tren' as const,
          mau: '#8B2F20',
          doDam: 0.5,
          kichThuoc: 20,
        },
      ],
    }
    const goi = taoGoiCauHinh(thiep, LUC)
    expect(goi.thiep.tuyChinhGiaoDien?.mauChinh).toBe('#123456')
    expect(goi.thiep.chiTietTrangTri).toHaveLength(1)
  })
})

describe('tenTepCauHinh', () => {
  it('đặt tên tệp theo mã đám cưới và ngày xuất', () => {
    expect(tenTepCauHinh('nam-linh', LUC)).toBe('nam-linh-cau-hinh-2026-07-27.json')
  })
})

describe('docGoiCauHinh', () => {
  it('đọc lại được gói vừa xuất', () => {
    const goi = JSON.parse(JSON.stringify(taoGoiCauHinh(thiepMau, LUC)))
    expect(docGoiCauHinh(goi, 'nam-linh').chuRe.ten).toBe('Nguyễn Hoài Nam')
  })

  it('ép slug về thiệp đang mở, tránh ghi đè nhầm đám cưới khác', () => {
    const goi = taoGoiCauHinh(thiepMau, LUC)
    expect(docGoiCauHinh(goi, 'tuan-mai').slug).toBe('tuan-mai')
  })

  it('từ chối tệp không phải cấu hình thiệp', () => {
    expect(() => docGoiCauHinh({ linh: 'tinh' }, 'nam-linh')).toThrow('không phải cấu hình')
  })

  it('từ chối chuỗi hay số', () => {
    expect(() => docGoiCauHinh('abc', 'nam-linh')).toThrow('không phải cấu hình')
    expect(() => docGoiCauHinh(null, 'nam-linh')).toThrow('không phải cấu hình')
  })

  it('từ chối gói của phiên bản mới hơn, tránh mất dữ liệu âm thầm', () => {
    const goi = { ...taoGoiCauHinh(thiepMau, LUC), phienBan: PHIEN_BAN_CAU_HINH + 5 }
    expect(() => docGoiCauHinh(goi, 'nam-linh')).toThrow('mới hơn phiên bản')
  })

  it('báo rõ chỗ sai khi nội dung hỏng', () => {
    const goi = taoGoiCauHinh({ ...thiepMau, ngayCuoi: '14/11/2026' }, LUC)
    expect(() => docGoiCauHinh(goi, 'nam-linh')).toThrow(/Nội dung không hợp lệ/)
  })
})
