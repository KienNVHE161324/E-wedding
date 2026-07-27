import { NextResponse } from 'next/server'
import { xoaLoiChuc } from '@/lib/db/loiChuc'

/** Xóa một lời chúc phản cảm. Chỉ nhân viên đã đăng nhập gọi được (xem proxy.ts). */
export async function DELETE(req: Request) {
  const { id } = await req.json().catch(() => ({ id: null }))
  if (typeof id !== 'string' || !id) {
    return NextResponse.json({ loi: 'Thiếu mã lời chúc' }, { status: 400 })
  }

  try {
    await xoaLoiChuc(id)
    return NextResponse.json({ ok: true })
  } catch (loi) {
    console.error('Lỗi xóa lời chúc:', loi)
    return NextResponse.json({ loi: 'Không xóa được' }, { status: 500 })
  }
}
