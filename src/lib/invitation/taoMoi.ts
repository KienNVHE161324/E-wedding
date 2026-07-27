import type { Invitation } from './types'
import { layTheme } from '@/lib/themes'

/** Những đường dẫn thuộc về hệ thống, không được dùng làm slug thiệp. */
const SLUG_HE_THONG = ['admin', 'api', 'dang-nhap', 'tao-moi', '_next', 'favicon.ico']

export function slugHopLe(slug: string): boolean {
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) return false
  return !SLUG_HE_THONG.includes(slug)
}

/**
 * Đề xuất đường dẫn thay thế khi bị trùng: nam-linh -> nam-linh-2 -> nam-linh-3...
 * Hai đám cưới trùng tên cô dâu chú rể là chuyện thường.
 */
export function deXuatSlug(goc: string, daCo: string[]): string {
  const dangDung = new Set(daCo)
  if (!dangDung.has(goc) && slugHopLe(goc)) return goc

  for (let i = 2; i < 1000; i++) {
    const thu = `${goc}-${i}`
    if (!dangDung.has(thu) && slugHopLe(thu)) return thu
  }
  throw new Error('Không tìm được đường dẫn thay thế')
}

export interface ThongTinTaoMoi {
  slug: string
  tenChuRe: string
  tenCoDau: string
  /** YYYY-MM-DD — ngày cưới chính. Nếu có hai ngày, đây luôn là ngày muộn hơn. */
  ngayCuoi: string
  /** YYYY-MM-DD — ngày đầu, dành cho đám cưới trải hai ngày. */
  ngayPhu?: string
  themeId: string
}

/**
 * Chuẩn hóa cặp ngày: ngày muộn hơn luôn là ngày cưới chính.
 * Hai ngày trùng nhau hoặc thiếu một ngày thì coi như đám cưới một ngày.
 */
export function xepNgayCuoi(a: string, b?: string): { ngayCuoi: string; ngayPhu?: string } {
  if (!b || b === a) return { ngayCuoi: a }
  return a < b ? { ngayCuoi: b, ngayPhu: a } : { ngayCuoi: a, ngayPhu: b }
}

/** Dựng một thiệp trống đầy đủ để admin điền dần. */
export function taoThiepMoi(tt: ThongTinTaoMoi): Invitation {
  if (!slugHopLe(tt.slug)) {
    throw new Error('Đường dẫn không hợp lệ: chỉ dùng chữ thường, số và dấu gạch ngang')
  }

  const ngay = xepNgayCuoi(tt.ngayCuoi, tt.ngayPhu)

  return {
    slug: tt.slug,
    themeId: tt.themeId,
    sections: layTheme(tt.themeId).thuTuSection,
    cauHinhRsvp: {
      truongChuan: ['hoTen', 'ben', 'quanHe', 'ngayAn'],
      truongTuyChinh: [],
    },
    chuRe: { ten: tt.tenChuRe },
    coDau: { ten: tt.tenCoDau },
    ...ngay,
    chuyenChungMinh: [],
    album: [],
    suKien: [],
    mungCuoi: [
      { ben: 'nha-trai', chuTaiKhoan: '', soTaiKhoan: '', nganHang: '' },
      { ben: 'nha-gai', chuTaiKhoan: '', soTaiKhoan: '', nganHang: '' },
    ],
  }
}
