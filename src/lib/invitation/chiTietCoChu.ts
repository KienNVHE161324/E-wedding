import type {
  CanLeChuChiTiet,
  ChuChiTietTrangTri,
  FontChuChiTiet,
} from './types'

export interface CauHinhChiTietCoChu {
  tiLe: string
  vungChu: {
    x: number
    y: number
    rong: number
    cao: number
    xoay?: number
  }
  macDinh: Omit<ChuChiTietTrangTri, 'noiDung'>
}

export const FONT_CHU_CHI_TIET_CSS: Record<FontChuChiTiet, string> = {
  'serif-co-dien': '"Noto Serif", "Times New Roman", serif',
  'sans-sach': '"Be Vietnam Pro", Arial, sans-serif',
}

export const CAN_LE_CHU_CHI_TIET: readonly CanLeChuChiTiet[] = [
  'left',
  'center',
  'right',
]

export const CAU_HINH_CHI_TIET_CO_CHU: Record<string, CauHinhChiTietCoChu> = {
  'primary-decor/wedding-ritual/thiep-phong-bi-do-son-mai-dinh-01': {
    tiLe: '1 / 1',
    vungChu: { x: 35, y: 11, rong: 38, cao: 42, xoay: 7 },
    macDinh: {
      font: 'serif-co-dien',
      coChu: 25,
      mauChu: '#6B2F24',
      canLe: 'center',
    },
  },
  'primary-decor/wedding-ritual/thiep-phong-bi-giay-do-trien-doi-chim-01': {
    tiLe: '3 / 2',
    vungChu: { x: 29, y: 42, rong: 48, cao: 28 },
    macDinh: {
      font: 'serif-co-dien',
      coChu: 27,
      mauChu: '#6B2F24',
      canLe: 'center',
    },
  },
  'primary-decor/wedding-ritual/thiep-phong-bi-xanh-ngang-doi-chim-01': {
    tiLe: '3 / 2',
    vungChu: { x: 17, y: 32, rong: 66, cao: 40 },
    macDinh: {
      font: 'sans-sach',
      coChu: 25,
      mauChu: '#173F43',
      canLe: 'center',
    },
  },
}

export function layCauHinhChiTietCoChu(
  id: string,
): CauHinhChiTietCoChu | undefined {
  return CAU_HINH_CHI_TIET_CO_CHU[id]
}
