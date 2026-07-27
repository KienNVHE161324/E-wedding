import type { KhoLuuTru } from './types'
import { taoKhoR2 } from './r2'
import { taoKhoODia } from './oDia'
import { taoKhoSupabase } from './supabaseStorage'

export type { KhoLuuTru } from './types'

/**
 * Chọn nơi lưu ảnh theo biến môi trường NOI_LUU_ANH.
 *
 * - `r2`       : Cloudflare R2 — mặc định, 10GB miễn phí, chạy được trên Vercel
 * - `supabase` : Supabase Storage — 1GB miễn phí
 * - `o-dia`    : ổ đĩa máy chủ — CHỈ dùng khi tự host VPS, trên Vercel sẽ mất ảnh
 */
export function layKhoLuuTru(): KhoLuuTru {
  const noiLuu = process.env.NOI_LUU_ANH ?? 'r2'

  switch (noiLuu) {
    case 'r2':
      return taoKhoR2()
    case 'supabase':
      return taoKhoSupabase()
    case 'o-dia':
      return taoKhoODia()
    default:
      throw new Error(
        `NOI_LUU_ANH không hợp lệ: ${noiLuu}. Chỉ nhận 'r2', 'supabase' hoặc 'o-dia'.`,
      )
  }
}
