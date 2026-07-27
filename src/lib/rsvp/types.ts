import { z } from 'zod'
import type { Ben } from '@/lib/invitation/types'

export const rsvpDauVaoSchema = z.object({
  hoTen: z.string().trim().min(1, 'Vui lòng nhập họ tên'),
  ben: z.enum(['nha-trai', 'nha-gai']),
  quanHe: z.string().trim().min(1, 'Vui lòng cho biết quan hệ với cô dâu chú rể'),
  phuongTien: z.string().trim().min(1, 'Vui lòng chọn phương tiện di chuyển'),
  ngayAn: z.string().trim().min(1, 'Vui lòng chọn ngày đến dự'),
  loiChuc: z.string().trim().optional(),
})

export type RsvpDauVao = z.infer<typeof rsvpDauVaoSchema>

export interface Rsvp extends RsvpDauVao {
  id: string
  slug: string
  ben: Ben
  ngayDangKy: string
  daDongBoSheet: boolean
}

export interface LoiChuc {
  hoTen: string
  noiDung: string
}
