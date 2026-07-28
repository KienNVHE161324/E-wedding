import type { ThoiLuongDoanNhac } from '@/lib/invitation/types'

export function gioiHanBatDau(
  batDau: number,
  thoiLuong: ThoiLuongDoanNhac,
  tongThoiLuong: number,
): number {
  const gioiHan = Math.max(0, tongThoiLuong - thoiLuong)
  return Math.min(Math.max(0, batDau), gioiHan)
}

export function layKetThucDoan(
  batDau: number,
  thoiLuong: ThoiLuongDoanNhac,
  tongThoiLuong: number,
): number {
  return Math.min(
    gioiHanBatDau(batDau, thoiLuong, tongThoiLuong) + thoiLuong,
    tongThoiLuong,
  )
}

export function dinhDangThoiGian(soGiay: number): string {
  const anToan = Math.max(0, Math.floor(soGiay))
  const phut = Math.floor(anToan / 60)
  const giay = anToan % 60
  return `${String(phut).padStart(2, '0')}:${String(giay).padStart(2, '0')}`
}
