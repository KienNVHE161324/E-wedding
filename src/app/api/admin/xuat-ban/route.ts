import { NextResponse } from 'next/server'
import { z } from 'zod'
import { xuatBan, giaHan } from '@/lib/db/invitations'
import { tinhNgayHetHan, SO_NGAY_MAC_DINH } from '@/lib/vongDoi/tinhTrangThai'

const dauVaoSchema = z.object({
  slug: z.string().min(1),
  hanhDong: z.enum(['xuat-ban', 'gia-han']),
  soNgay: z.number().int().min(1).max(365).optional(),
})

export async function POST(req: Request) {
  const kiemTra = dauVaoSchema.safeParse(await req.json())
  if (!kiemTra.success) {
    return NextResponse.json({ loi: 'Dữ liệu không hợp lệ' }, { status: 400 })
  }

  const { slug, hanhDong, soNgay = SO_NGAY_MAC_DINH } = kiemTra.data
  // Gia hạn tính lại từ hôm nay, không cộng dồn vào hạn cũ đã trôi qua.
  const ngayHetHan = tinhNgayHetHan(new Date(), soNgay)

  try {
    if (hanhDong === 'xuat-ban') await xuatBan(slug, ngayHetHan)
    else await giaHan(slug, ngayHetHan)
    return NextResponse.json({ ok: true, ngayHetHan })
  } catch (loi) {
    console.error('Lỗi đổi vòng đời thiệp:', loi)
    return NextResponse.json({ loi: 'Không thực hiện được' }, { status: 500 })
  }
}
