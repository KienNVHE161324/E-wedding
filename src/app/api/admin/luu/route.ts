import { NextResponse } from 'next/server'
import { invitationSchema } from '@/lib/invitation/schema'
import { luuThiep } from '@/lib/db/invitations'
import { z } from 'zod'

const dauVaoSchema = z.object({
  invitationId: z.string().uuid(),
  thiep: invitationSchema,
})

export async function POST(req: Request) {
  const kiemTra = dauVaoSchema.safeParse(await req.json())
  if (!kiemTra.success) {
    return NextResponse.json(
      { loi: kiemTra.error.issues[0]?.message ?? 'Dữ liệu thiệp không hợp lệ' },
      { status: 400 },
    )
  }

  try {
    await luuThiep(kiemTra.data.invitationId, kiemTra.data.thiep)
    return NextResponse.json({ ok: true })
  } catch (loi) {
    console.error('Lỗi lưu thiệp:', loi)
    return NextResponse.json({ loi: 'Không lưu được thiệp' }, { status: 500 })
  }
}
