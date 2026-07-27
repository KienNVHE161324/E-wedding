import type { SlotHoaTiet } from '@/lib/themes/types'

export type SectionId =
  | 'bia'
  | 'dem-nguoc'
  | 'co-dau-chu-re'
  | 'chuyen-chung-minh'
  | 'album'
  | 'su-kien'
  | 'rsvp'
  | 'mung-cuoi'
  | 'so-luu-but'

export interface SectionRef {
  id: SectionId
  /** Mặc định true. Đặt false để tắt phần này cho thiệp hiện tại. */
  enabled?: boolean
}

export interface Anh {
  url: string
  moTa: string
}

export interface NguoiCuoi {
  ten: string
  anh?: Anh
  gioiThieu?: string
  tenBo?: string
  tenMe?: string
  lienKetMangXaHoi?: string
}

export interface ChangChuyen {
  anh: Anh
  tieuDe: string
  noiDung: string
}

export interface SuKien {
  ten: string
  thoiGian: string
  diaDiem: string
  diaChi: string
  banDoAnh?: Anh
  linkChiDuong?: string
}

export type Ben = 'nha-trai' | 'nha-gai'

export interface OMungCuoi {
  ben: Ben
  chuTaiKhoan: string
  soTaiKhoan: string
  nganHang: string
  qrAnh?: Anh
}

/** Vị trí gắn một chi tiết trang trí trong một phần của thiệp. */
export type ViTriChiTiet = 'tren' | 'duoi' | 'trai' | 'phai' | 'nen'

/**
 * Một chi tiết trang trí do nhân viên tự thêm vào thiệp.
 * Khác với họa tiết của theme ở chỗ: chọn được tệp, màu, độ đậm, kích thước
 * cho riêng từng thiệp mà không đụng tới theme.
 */
export interface ChiTietTrangTri {
  /** id trong DANH_SACH_HOA_TIET, xem src/lib/motifs/danhSach.ts */
  id: string
  /** Gắn vào phần nào của thiệp. */
  section: SectionId
  viTri: ViTriChiTiet
  /** Mã màu, ví dụ '#8B2F20'. */
  mau: string
  /** 0–1 */
  doDam: number
  /** Chiều rộng tính theo phần trăm khung thiệp, 5–100. */
  kichThuoc: number
}

/** Ghi đè giao diện cho riêng một thiệp. Thiếu trường nào thì lấy của theme. */
export interface TuyChinhGiaoDien {
  mauChinh?: string
  mauNen?: string
  mauPhu?: string
  /** Độ đậm họa tiết theo từng slot, 0–1. Ghi đè doDam của theme. */
  doDam?: Partial<Record<SlotHoaTiet, number>>
}

export interface Invitation {
  slug: string
  themeId: string
  /** Ghi đè thứ tự phần của theme. Rỗng nghĩa là dùng thứ tự mặc định của theme. */
  sections: SectionRef[]
  chuRe: NguoiCuoi
  coDau: NguoiCuoi
  /** Định dạng YYYY-MM-DD */
  ngayCuoi: string
  nhac?: { url: string; ten: string }
  chuyenChungMinh: ChangChuyen[]
  album: Anh[]
  suKien: SuKien[]
  mungCuoi: OMungCuoi[]
  tuyChinhGiaoDien?: TuyChinhGiaoDien
  /** Chi tiết trang trí nhân viên tự thêm. Rỗng nghĩa là chỉ dùng họa tiết của theme. */
  chiTietTrangTri?: ChiTietTrangTri[]
}
