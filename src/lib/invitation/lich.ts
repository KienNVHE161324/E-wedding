import type { SuKien } from './types'

export const TEN_THU = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']

/** Một ô trong lưới lịch tháng. null nghĩa là ô trống ở đầu hoặc cuối tháng. */
export type ONgay = number | null

/**
 * Dựng lưới lịch của tháng chứa ngày cưới, tuần bắt đầu từ Thứ Hai
 * theo thói quen Việt Nam.
 */
export function luoiLichThang(ngayIso: string): ONgay[][] {
  const [nam, thang] = ngayIso.split('-').map(Number)

  const ngayDauThang = new Date(Date.UTC(nam, thang - 1, 1))
  const soNgayTrongThang = new Date(Date.UTC(nam, thang, 0)).getUTCDate()

  // getUTCDay(): 0 = Chủ Nhật. Đổi sang 0 = Thứ Hai.
  const lechDau = (ngayDauThang.getUTCDay() + 6) % 7

  const o: ONgay[] = [
    ...Array<ONgay>(lechDau).fill(null),
    ...Array.from({ length: soNgayTrongThang }, (_, i) => i + 1),
  ]
  while (o.length % 7 !== 0) o.push(null)

  const tuan: ONgay[][] = []
  for (let i = 0; i < o.length; i += 7) tuan.push(o.slice(i, i + 7))
  return tuan
}

export function ngayTrongThang(ngayIso: string): number {
  return Number(ngayIso.split('-')[2])
}

export function tenThang(ngayIso: string): string {
  const [nam, thang] = ngayIso.split('-')
  return `Tháng ${Number(thang)} năm ${nam}`
}

/** Sắp xếp mốc lịch trình theo ngày rồi tới giờ, để dòng thời gian luôn đúng thứ tự. */
export function sapXepLichTrinh(suKien: SuKien[]): SuKien[] {
  return [...suKien].sort((a, b) => `${a.ngay}T${a.gio}`.localeCompare(`${b.ngay}T${b.gio}`))
}

/** Các ngày có sự kiện, dạng dd/mm/yyyy, dùng cho ô chọn trong form xác nhận. */
export function cacNgayCoSuKien(suKien: SuKien[], ngayCuoi: string): string[] {
  const iso = [...new Set([ngayCuoi, ...suKien.map((sk) => sk.ngay)])].sort()
  return iso.map((n) => {
    const [nam, thang, ngay] = n.split('-')
    return `${ngay}/${thang}/${nam}`
  })
}
