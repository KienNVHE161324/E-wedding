import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { canDangNhap } from '@/lib/auth/duongDanCanDangNhap'

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}

export async function middleware(req: NextRequest) {
  const res = NextResponse.next({ request: req })

  if (!canDangNhap(req.nextUrl.pathname)) return res

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (danhSach) => {
          for (const { name, value, options } of danhSach) {
            res.cookies.set(name, value, options)
          }
        },
      },
    },
  )

  const { data } = await supabase.auth.getUser()
  if (data.user) return res

  // API trả lỗi để phía gọi xử lý; trang thì chuyển về đăng nhập.
  if (req.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.json({ loi: 'Cần đăng nhập' }, { status: 401 })
  }

  const url = req.nextUrl.clone()
  url.pathname = '/dang-nhap'
  url.searchParams.set('tiep', req.nextUrl.pathname)
  return NextResponse.redirect(url)
}
