export type TrangThaiThiep = 'nhap' | 'da-len-lich' | 'da-xuat-ban' | 'het-han' | 'da-huy'

/** Phần vòng đời lưu trong DB. Trạng thái theo lịch được suy ra tại thời điểm đọc. */
export interface VongDoi {
  trangThaiLuu: 'nhap' | 'da-xuat-ban' | 'da-huy'
  ngayXuatBan: string | null
  ngayDong: string | null
}

/** Một dòng trong bảng điều khiển quản trị. */
export interface ThiepTomTat {
  id: string
  publicSlug: string | null
  tenChuRe: string
  tenCoDau: string
  ngayCuoi: string
  themeId: string
  trangThai: TrangThaiThiep
  ngayXuatBan: string | null
  ngayDong: string | null
  soLuotXacNhan: number
  spreadsheetId: string | null
}
