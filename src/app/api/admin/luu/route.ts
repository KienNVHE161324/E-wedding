import { NextResponse } from 'next/server'
import { invitationSchema } from '@/lib/invitation/schema'
import { luuThiep } from '@/lib/db/invitations'

export async function POST(req: Request) {
  const kiemTra = invitationSchema.safeParse(await req.json())
  if (!kiemTra.success) {
    return NextResponse.json(
      { loi: kiemTra.error.issues[0]?.message ?? 'Dữ liệu thiệp không hợp lệ' },
      { status: 400 },
    )
  }

  try {
    await luuThiep(kiemTra.data)
    return NextResponse.json({ ok: true })
  } catch (loi) {
    console.error('Lỗi lưu thiệp:', loi)
    return NextResponse.json({ loi: 'Không lưu được thiệp' }, { status: 500 })
  }
}
