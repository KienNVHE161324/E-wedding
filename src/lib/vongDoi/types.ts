export type TrangThaiThiep = 'nhap' | 'da-xuat-ban' | 'het-han'

/** Phần vòng đời lưu trong DB. Trạng thái 'het-han' được suy ra, không lưu. */
export interface VongDoi {
  trangThaiLuu: 'nhap' | 'da-xuat-ban'
  ngayXuatBan: string | null
  ngayHetHan: string | null
}

/** Một dòng trong bảng điều khiển quản trị. */
export interface ThiepTomTat {
  slug: string
  tenChuRe: string
  tenCoDau: string
  ngayCuoi: string
  themeId: string
  trangThai: TrangThaiThiep
  ngayHetHan: string | null
  soNgayConLai: number | null
  soLuotXacNhan: number
  spreadsheetId: string | null
}
