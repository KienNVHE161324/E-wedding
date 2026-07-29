import type { TrangThaiThiep, VongDoi } from './types'

/**
 * Suy trạng thái hiển thị từ ngày tháng thay vì lưu cờ trong DB,
 * để không cần tiến trình nền chạy đổi cờ mỗi ngày.
 */
export function tinhTrangThai(vd: VongDoi, bayGio: Date): TrangThaiThiep {
  if (vd.trangThaiLuu === 'da-huy') return 'da-huy'
  if (vd.trangThaiLuu === 'nhap') return 'nhap'
  if (!vd.ngayXuatBan || !vd.ngayDong) return 'nhap'
  if (bayGio.getTime() < Date.parse(vd.ngayXuatBan)) return 'da-len-lich'
  if (bayGio.getTime() >= Date.parse(vd.ngayDong)) return 'het-han'
  return 'da-xuat-ban'
}
