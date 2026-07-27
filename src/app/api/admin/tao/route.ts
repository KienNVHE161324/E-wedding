import { NextResponse } from 'next/server'
import { z } from 'zod'
import { taoThiepMoi } from '@/lib/invitation/taoMoi'
import { taoThiepTrongDb } from '@/lib/db/invitations'
import { layPhien } from '@/lib/auth/server'
import { THEMES } from '@/lib/themes'

const dauVaoSchema = z.object({
  slug: z.string().trim().min(1, 'Vui lòng nhập đường dẫn'),
  tenChuRe: z.string().trim().min(1, 'Vui lòng nhập tên chú rể'),
  tenCoDau: z.string().trim().min(1, 'Vui lòng nhập tên cô dâu'),
  ngayCuoi: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Ngày cưới không hợp lệ'),
  themeId: z.string().refine((id) => id in THEMES, 'Giao diện không tồn tại'),
})

export async function POST(req: Request) {
  const phien = await layPhien()
  if (!phien) return NextResponse.json({ loi: 'Cần đăng nhập' }, { status: 401 })

  const kiemTra = dauVaoSchema.safeParse(await req.json())
  if (!kiemTra.success) {
    return NextResponse.json(
      { loi: kiemTra.error.issues[0]?.message ?? 'Dữ liệu không hợp lệ' },
      { status: 400 },
    )
  }

  try {
    const thiep = taoThiepMoi(kiemTra.data)
    await taoThiepTrongDb(thiep, phien.userId)
    return NextResponse.json({ ok: true, slug: thiep.slug })
  } catch (loi) {
    const thongBao = loi instanceof Error ? loi.message : 'Không tạo được thiệp'
    return NextResponse.json({ loi: thongBao }, { status: 400 })
  }
}
