export const KIEU_KHUNG_QR = ['toi-gian', 'hoa-mem', 'phong-bao'] as const

export type KieuKhungQr = (typeof KIEU_KHUNG_QR)[number]

export interface TuyChinhQr {
  kieuKhung?: KieuKhungQr
  mauQr?: string
  mauNen?: string
}

export interface CauHinhQrTheme {
  kieuKhung: KieuKhungQr
  mauQr: string
  mauNen: string
}

export interface CauHinhQrDaXuLy extends CauHinhQrTheme {
  coCanhBao: boolean
}
