import type { Invitation } from './types'
import { layTheme } from '@/lib/themes'

/** Những đường dẫn thuộc về hệ thống, không được dùng làm slug thiệp. */
const SLUG_HE_THONG = ['admin', 'api', 'dang-nhap', 'tao-moi', '_next', 'favicon.ico']

export function slugHopLe(slug: string): boolean {
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) return false
  return !SLUG_HE_THONG.includes(slug)
}

export interface ThongTinTaoMoi {
  slug: string
  tenChuRe: string
  tenCoDau: string
  /** YYYY-MM-DD */
  ngayCuoi: string
  themeId: string
}

/** Dựng một thiệp trống đầy đủ để admin điền dần. */
export function taoThiepMoi(tt: ThongTinTaoMoi): Invitation {
  if (!slugHopLe(tt.slug)) {
    throw new Error('Đường dẫn không hợp lệ: chỉ dùng chữ thường, số và dấu gạch ngang')
  }

  return {
    slug: tt.slug,
    themeId: tt.themeId,
    sections: layTheme(tt.themeId).thuTuSection,
    chuRe: { ten: tt.tenChuRe },
    coDau: { ten: tt.tenCoDau },
    ngayCuoi: tt.ngayCuoi,
    chuyenChungMinh: [],
    album: [],
    suKien: [],
    mungCuoi: [
      { ben: 'nha-trai', chuTaiKhoan: '', soTaiKhoan: '', nganHang: '' },
      { ben: 'nha-gai', chuTaiKhoan: '', soTaiKhoan: '', nganHang: '' },
    ],
  }
}
