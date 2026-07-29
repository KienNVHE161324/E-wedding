import { NextResponse } from 'next/server'
import { z } from 'zod'
import { huyUrl } from '@/lib/db/invitations'

const dauVaoSchema = z.object({
  invitationId: z.string().uuid(),
})

export async function POST(req: Request) {
  const kiemTra = dauVaoSchema.safeParse(await req.json())
  if (!kiemTra.success) {
    return NextResponse.json({ loi: 'Dữ liệu không hợp lệ' }, { status: 400 })
  }

  try {
    await huyUrl(kiemTra.data.invitationId)
    return NextResponse.json({ ok: true })
  } catch (loi) {
    console.error('Lỗi hủy URL thiệp:', loi)
    return NextResponse.json({ loi: 'Không hủy được đường dẫn' }, { status: 500 })
  }
}
