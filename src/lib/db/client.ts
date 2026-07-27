import { createClient } from '@supabase/supabase-js'

/**
 * Client quyền cao. CHỈ dùng phía máy chủ — không bao giờ import vào component client,
 * vì service role key bỏ qua mọi kiểm soát truy cập.
 */
export function taoSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Thiếu biến môi trường Supabase')
  return createClient(url, key, { auth: { persistSession: false } })
}
