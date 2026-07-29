import type { FontChu } from './textTypes'

export const FONT_CHU_OPTIONS: readonly {
  id: FontChu
  nhan: string
  css: string
}[] = [
  {
    id: 'serif-co-dien',
    nhan: 'Có chân cổ điển',
    css: 'var(--font-serif-co-dien), "Times New Roman", serif',
  },
  {
    id: 'sans-sach',
    nhan: 'Không chân dễ đọc',
    css: 'var(--font-he-thong), Arial, sans-serif',
  },
  { id: 'viet-tay', nhan: 'Viết tay', css: 'var(--font-viet-tay), cursive' },
]
