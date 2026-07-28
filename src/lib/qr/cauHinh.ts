import type {
  CauHinhQrDaXuLy,
  CauHinhQrTheme,
  KieuKhungQr,
  TuyChinhQr,
} from './types'

const TUONG_PHAN_TOI_THIEU = 4.5

function rgb(maMau: string): [number, number, number] {
  const giaTri = maMau.slice(1)
  return [
    Number.parseInt(giaTri.slice(0, 2), 16),
    Number.parseInt(giaTri.slice(2, 4), 16),
    Number.parseInt(giaTri.slice(4, 6), 16),
  ]
}

function kenhTuyenTinh(kenh: number): number {
  const s = kenh / 255
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
}

function doSang(maMau: string): number {
  const [r, g, b] = rgb(maMau).map(kenhTuyenTinh)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

export function doTuongPhan(mauTruoc: string, mauSau: string): number {
  const sangA = doSang(mauTruoc)
  const sangB = doSang(mauSau)
  const sangHon = Math.max(sangA, sangB)
  const toiHon = Math.min(sangA, sangB)
  return (sangHon + 0.05) / (toiHon + 0.05)
}

export function resolveCauHinhQr(
  themeQr: CauHinhQrTheme,
  kieuKhungThiep?: KieuKhungQr,
  tuyChinhBen?: TuyChinhQr,
): CauHinhQrTheme {
  return {
    kieuKhung: tuyChinhBen?.kieuKhung ?? kieuKhungThiep ?? themeQr.kieuKhung,
    mauQr: tuyChinhBen?.mauQr ?? themeQr.mauQr,
    mauNen: tuyChinhBen?.mauNen ?? themeQr.mauNen,
  }
}

export function mauQrAnToan(cauHinh: CauHinhQrTheme): CauHinhQrDaXuLy {
  if (doTuongPhan(cauHinh.mauQr, cauHinh.mauNen) >= TUONG_PHAN_TOI_THIEU) {
    return { ...cauHinh, coCanhBao: false }
  }
  return {
    ...cauHinh,
    mauQr: '#000000',
    mauNen: '#FFFFFF',
    coCanhBao: true,
  }
}
