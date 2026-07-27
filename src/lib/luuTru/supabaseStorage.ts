import { taoSupabase } from '@/lib/db/client'
import type { KhoLuuTru } from './types'

/** Lưu vào Supabase Storage. Chạy được trên mọi nền tảng, kể cả Vercel. */
export function taoKhoSupabase(bucket = 'thiep'): KhoLuuTru {
  return {
    ten: 'Supabase Storage',

    async luu(duongDan, tep) {
      const supabase = taoSupabase()
      const { error } = await supabase.storage
        .from(bucket)
        .upload(duongDan, tep, { contentType: tep.type, upsert: false })
      if (error) throw error

      return supabase.storage.from(bucket).getPublicUrl(duongDan).data.publicUrl
    },

    async xoa(duongDan) {
      const { error } = await taoSupabase().storage.from(bucket).remove([duongDan])
      if (error) throw error
    },
  }
}
