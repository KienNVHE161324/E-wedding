import type { SuKien } from './types'

function mocIcs(ngay: string, gio: string, congPhut = 0): string {
  const [nam, thang, ngayTrongThang] = ngay.split('-').map(Number)
  const [gioTrongNgay, phut] = gio.split(':').map(Number)
  const d = new Date(Date.UTC(nam, thang - 1, ngayTrongThang, gioTrongNgay, phut + congPhut))
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getUTCFullYear()}${p(d.getUTCMonth() + 1)}${p(d.getUTCDate())}T${p(d.getUTCHours())}${p(d.getUTCMinutes())}00`
}

function escapeIcs(giaTri: string): string {
  return giaTri
    .replace(/\\/g, '\\\\')
    .replace(/\r?\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;')
}

function tenKhongDau(giaTri: string): string {
  return giaTri
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

/** Nội dung iCalendar cho một mốc, dùng giờ Việt Nam và thời lượng mặc định 2 giờ. */
export function noiDungIcs(suKien: SuKien): string {
  const batDau = mocIcs(suKien.ngay, suKien.gio)
  const ketThuc = mocIcs(suKien.ngay, suKien.gio, 120)
  const uid = `${tenKhongDau(suKien.ten)}-${batDau}@e-wedding`
  const dong = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//E-Wedding//Lich cuoi//VI',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${batDau}Z`,
    `DTSTART;TZID=Asia/Ho_Chi_Minh:${batDau}`,
    `DTEND;TZID=Asia/Ho_Chi_Minh:${ketThuc}`,
    `SUMMARY:${escapeIcs(suKien.ten)}`,
  ]
  if (suKien.diaDiem) dong.push(`LOCATION:${escapeIcs(suKien.diaDiem)}`)
  dong.push('END:VEVENT', 'END:VCALENDAR')
  return `${dong.join('\r\n')}\r\n`
}

export function lienKetThemVaoLich(suKien: SuKien): string {
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(noiDungIcs(suKien))}`
}

export function tenTepLich(suKien: SuKien): string {
  return `${tenKhongDau(suKien.ten) || 'su-kien'}-${suKien.ngay}.ics`
}

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
export function cacNgayCoSuKien(
  suKien: SuKien[],
  ngayCuoi: string,
  ngayPhu?: string,
): string[] {
  const iso = [
    ...new Set([ngayCuoi, ...(ngayPhu ? [ngayPhu] : []), ...suKien.map((sk) => sk.ngay)]),
  ].sort()
  return iso.map((n) => {
    const [nam, thang, ngay] = n.split('-')
    return `${ngay}/${thang}/${nam}`
  })
}
