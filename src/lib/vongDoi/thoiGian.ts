const DINH_DANG_LOCAL = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/
const OFFSET_VIET_NAM = '+07:00'

export function tuNgayGioVietNam(value: string): string {
  if (!DINH_DANG_LOCAL.test(value)) throw new Error('Ngày giờ không hợp lệ')

  const date = new Date(`${value}:00${OFFSET_VIET_NAM}`)
  if (Number.isNaN(date.getTime()) || sangNgayGioVietNam(date.toISOString()) !== value) {
    throw new Error('Ngày giờ không hợp lệ')
  }
  return date.toISOString()
}

export function sangNgayGioVietNam(iso: string | null): string {
  if (!iso) return ''
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) throw new Error('Ngày giờ không hợp lệ')

  const local = new Date(date.getTime() + 7 * 60 * 60 * 1000)
  return local.toISOString().slice(0, 16)
}
