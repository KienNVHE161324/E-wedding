import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createServerClient } from '@supabase/ssr'

export async function taoSupabaseMayChu() {
  const kho = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => kho.getAll(),
        setAll: (danhSach) => {
          try {
            for (const { name, value, options } of danhSach) {
              kho.set(name, value, options)
            }
          } catch {
            // Server Component không ghi được cookie. Middleware đã lo việc làm mới phiên.
          }
        },
      },
    },
  )
}

export async function layPhien(): Promise<{ userId: string; email: string } | null> {
  const supabase = await taoSupabaseMayChu()
  const { data } = await supabase.auth.getUser()
  if (!data.user?.email) return null
  return { userId: data.user.id, email: data.user.email }
}

export async function batBuocDangNhap(): Promise<{ userId: string; email: string }> {
  const phien = await layPhien()
  if (!phien) redirect('/dang-nhap')
  return phien
}
