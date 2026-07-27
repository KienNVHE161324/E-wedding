import { z } from 'zod'
import type { Ben } from '@/lib/invitation/types'

const chuoiKhongBatBuoc = z.string().trim().min(1).optional().transform((v) => v ?? '')

export const rsvpDauVaoSchema = z.object({
  hoTen: chuoiKhongBatBuoc,
  ben: z.enum(['nha-trai', 'nha-gai']).default('nha-trai'),
  quanHe: chuoiKhongBatBuoc,
  phuongTien: chuoiKhongBatBuoc,
  ngayAn: chuoiKhongBatBuoc,
  loiChuc: z.string().trim().optional(),
  tuyChinh: z.record(z.string(), z.string().trim()).default({}),
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
