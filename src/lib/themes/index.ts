import type { Theme } from './types'
import { macDinh } from './mac-dinh'

export type { Theme, SlotHoaTiet } from './types'
export { DANH_SACH_SLOT } from './types'

/** Đăng ký theme. Session thiết kế thêm theme mới vào đây. */
export const THEMES: Record<string, Theme> = {
  [macDinh.id]: macDinh,
}

export function layTheme(id: string): Theme {
  const theme = THEMES[id]
  if (!theme) throw new Error(`Không tìm thấy theme: ${id}`)
  return theme
}
