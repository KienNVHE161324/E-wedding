import { NextResponse } from 'next/server'
import { z } from 'zod'
import { taoThiepMoi, deXuatSlug } from '@/lib/invitation/taoMoi'
import { taoThiepTrongDb, laySlugDaCo } from '@/lib/db/invitations'
import { layPhien } from '@/lib/auth/server'
import { THEMES } from '@/lib/themes'
import { KIEU_KHUNG_QR } from '@/lib/qr/types'

const dauVaoSchema = z.object({
  slug: z.string().trim().min(1, 'Vui lòng nhập đường dẫn'),
  tenChuRe: z.string().trim().min(1, 'Vui lòng nhập tên chú rể'),
  tenCoDau: z.string().trim().min(1, 'Vui lòng nhập tên cô dâu'),
  ngayCuoi: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Ngày cưới không hợp lệ'),
  ngayPhu: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Ngày đầu không hợp lệ')
    .optional(),
  themeId: z.string().refine((id) => id in THEMES, 'Giao diện không tồn tại'),
  kieuKhungQr: z.enum(KIEU_KHUNG_QR).optional(),
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
    const invitationId = await taoThiepTrongDb(thiep, phien.userId)
    return NextResponse.json({ ok: true, invitationId, publicSlug: thiep.slug })
  } catch (loi) {
    const thongBao = loi instanceof Error ? loi.message : 'Không tạo được thiệp'

    // Trùng đường dẫn là chuyện thường khi hai đám cưới trùng tên cô dâu chú rể.
    // Gợi ý sẵn tên thay thế thay vì bắt nhân viên tự nghĩ.
    if (thongBao.includes('Đường dẫn đã tồn tại')) {
      const goiY = deXuatSlug(kiemTra.data.slug, await laySlugDaCo())
      return NextResponse.json({ loi: thongBao, goiY }, { status: 409 })
    }

    return NextResponse.json({ loi: thongBao }, { status: 400 })
  }
}
