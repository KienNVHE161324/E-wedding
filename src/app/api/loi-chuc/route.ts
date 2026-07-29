import { NextResponse } from 'next/server'
import { loiChucDauVaoSchema, taoLoiChuc } from '@/lib/db/loiChuc'
import { layThiepTheoSlug } from '@/lib/db/invitations'
import { tinhTrangThai } from '@/lib/vongDoi/tinhTrangThai'

/** Khách gửi lời chúc vào sổ lưu bút. Đăng luôn, không qua duyệt. */
export async function POST(req: Request) {
  const body = await req.json()
  const slug = typeof body.slug === 'string' ? body.slug : ''
  if (!slug) return NextResponse.json({ loi: 'Thiếu mã thiệp' }, { status: 400 })

  const ban = await layThiepTheoSlug(slug)
  if (!ban) return NextResponse.json({ loi: 'Không tìm thấy thiệp' }, { status: 404 })

  if (tinhTrangThai(ban.vongDoi, new Date()) !== 'da-xuat-ban') {
    return NextResponse.json({ loi: 'Thiệp này đã đóng.' }, { status: 410 })
  }

  const kiemTra = loiChucDauVaoSchema.safeParse(body)
  if (!kiemTra.success) {
    return NextResponse.json(
      { loi: kiemTra.error.issues[0]?.message ?? 'Dữ liệu không hợp lệ' },
      { status: 400 },
    )
  }

  try {
    return NextResponse.json({ ok: true, loiChuc: await taoLoiChuc(ban.id, kiemTra.data) })
  } catch (loi) {
    console.error('Lỗi lưu lời chúc:', loi)
    return NextResponse.json({ loi: 'Không gửi được. Vui lòng thử lại.' }, { status: 500 })
  }
}
