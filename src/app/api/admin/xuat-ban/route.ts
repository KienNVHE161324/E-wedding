import { NextResponse } from 'next/server'
import { z } from 'zod'
import { datLich } from '@/lib/db/invitations'
import { tuNgayGioVietNam } from '@/lib/vongDoi/thoiGian'

const dauVaoSchema = z.object({
  invitationId: z.string().uuid(),
  ngayXuatBan: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/),
  ngayDong: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/),
})

export async function POST(req: Request) {
  const kiemTra = dauVaoSchema.safeParse(await req.json())
  if (!kiemTra.success) {
    return NextResponse.json({ loi: 'Dữ liệu không hợp lệ' }, { status: 400 })
  }

  try {
    const ngayXuatBan = tuNgayGioVietNam(kiemTra.data.ngayXuatBan)
    const ngayDong = tuNgayGioVietNam(kiemTra.data.ngayDong)
    if (Date.parse(ngayDong) <= Date.parse(ngayXuatBan)) {
      return NextResponse.json(
        { loi: 'Ngày giờ đóng phải sau ngày giờ xuất bản' },
        { status: 400 },
      )
    }

    await datLich(kiemTra.data.invitationId, ngayXuatBan, ngayDong)
    return NextResponse.json({ ok: true, ngayXuatBan, ngayDong })
  } catch (loi) {
    console.error('Lỗi đặt lịch thiệp:', loi)
    return NextResponse.json({ loi: 'Không lưu được lịch xuất bản' }, { status: 500 })
  }
}
