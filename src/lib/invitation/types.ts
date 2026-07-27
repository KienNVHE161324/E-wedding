import type { SlotHoaTiet } from '@/lib/themes/types'

export type SectionId =
  | 'bia'
  | 'dem-nguoc'
  | 'co-dau-chu-re'
  | 'chuyen-chung-minh'
  | 'album'
  | 'su-kien'
  | 'dress-code'
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

/** Một mốc trong dòng thời gian của đám cưới. */
export interface SuKien {
  /** YYYY-MM-DD — cho phép lịch trình trải qua nhiều ngày. */
  ngay: string
  /** HH:mm — dùng để xếp thứ tự trên dòng thời gian. */
  gio: string
  ten: string
  diaDiem: string
  diaChi: string
  banDoAnh?: Anh
}

export interface DressCode {
  /** Ví dụ: 'Mời quý khách mặc tông đỏ – be'. */
  moTa: string
  /** Các ô màu tròn gợi ý, dạng #RRGGBB. */
  mauSac: string[]
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
  /** Dịch ngang so với vị trí gốc, tính theo phần trăm khung. -50 đến 50. */
  dichNgang?: number
  /** Dịch dọc so với vị trí gốc, tính theo phần trăm khung. -50 đến 50. */
  dichDoc?: number
  /** Đưa chi tiết ra sau chữ, dùng khi nó che mất nội dung. */
  raSauChu?: boolean
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
  /** YYYY-MM-DD — ngày cưới chính. Nếu đám cưới trải hai ngày, đây là ngày muộn hơn. */
  ngayCuoi: string
  /** YYYY-MM-DD — ngày đầu của đám cưới hai ngày. */
  ngayPhu?: string
  nhac?: { url: string; ten: string }
  chuyenChungMinh: ChangChuyen[]
  album: Anh[]
  suKien: SuKien[]
  dressCode?: DressCode
  mungCuoi: OMungCuoi[]
  /** Bật thì phần Mừng cưới hiện hộp quà đóng, khách chạm vào mới hiện QR. */
  mungCuoiKieuHopQua?: boolean
  tuyChinhGiaoDien?: TuyChinhGiaoDien
  /** Chi tiết trang trí nhân viên tự thêm. Rỗng nghĩa là chỉ dùng họa tiết của theme. */
  chiTietTrangTri?: ChiTietTrangTri[]
}
