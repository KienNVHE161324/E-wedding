export const FONT_CHU = ['serif-co-dien', 'sans-sach', 'viet-tay'] as const
export type FontChu = (typeof FONT_CHU)[number]
export type TextRegionId = string

export interface TuyChinhVungChu {
  noiDung?: string
  font?: FontChu
  coChu?: number
  mauChu?: string
  x?: number
  y?: number
}

export type TuyChinhChu = Record<TextRegionId, TuyChinhVungChu>
