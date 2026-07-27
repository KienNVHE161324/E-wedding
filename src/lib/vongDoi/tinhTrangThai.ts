import type { TrangThaiThiep, VongDoi } from './types'

export const SO_NGAY_MAC_DINH = 14
const MOT_NGAY = 24 * 60 * 60 * 1000

/**
 * Suy trạng thái hiển thị từ ngày tháng thay vì lưu cờ trong DB,
 * để không cần tiến trình nền chạy đổi cờ mỗi ngày.
 */
export function tinhTrangThai(vd: VongDoi, bayGio: Date): TrangThaiThiep {
  if (vd.trangThaiLuu === 'nhap') return 'nhap'
  if (!vd.ngayHetHan) return 'da-xuat-ban'
  return Date.parse(vd.ngayHetHan) <= bayGio.getTime() ? 'het-han' : 'da-xuat-ban'
}

export function soNgayConLai(ngayHetHan: string | null, bayGio: Date): number | null {
  if (!ngayHetHan) return null
  return Math.max(0, Math.ceil((Date.parse(ngayHetHan) - bayGio.getTime()) / MOT_NGAY))
}

/** Hạn tính từ thời điểm truyền vào, không cộng dồn vào hạn cũ đã trôi qua. */
export function tinhNgayHetHan(ngayXuatBan: Date, soNgay: number = SO_NGAY_MAC_DINH): string {
  return new Date(ngayXuatBan.getTime() + soNgay * MOT_NGAY).toISOString()
}
