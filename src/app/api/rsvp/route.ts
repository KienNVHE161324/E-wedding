import { NextResponse, after } from 'next/server'
import { rsvpDauVaoSchema } from '@/lib/rsvp/types'
import { luuRsvp, dongBoMotRsvp, type PhuThuoc } from '@/lib/rsvp/xuLy'
import { taoRsvp, danhDauDaDongBo } from '@/lib/db/rsvps'
import { layThiepTheoSlug, laySpreadsheetId } from '@/lib/db/invitations'
import { taoSheetsApi } from '@/lib/sheets/client'
import { dongBoLenSheet } from '@/lib/sheets/dongBo'
import { tinhTrangThai } from '@/lib/vongDoi/tinhTrangThai'

function phuThuoc(): PhuThuoc {
  const sheets = taoSheetsApi()
  return {
    taoRsvp,
    laySpreadsheetId,
    danhDauDaDongBo,
    dongBoLenSheet: (id, rsvp) => dongBoLenSheet(id, rsvp, sheets),
  }
}

export async function POST(req: Request) {
  const body = await req.json()
  const slug = typeof body.slug === 'string' ? body.slug : ''
  if (!slug) return NextResponse.json({ loi: 'Thiếu mã thiệp' }, { status: 400 })

  const ban = await layThiepTheoSlug(slug)
  if (!ban) return NextResponse.json({ loi: 'Không tìm thấy thiệp' }, { status: 404 })

  // Thiệp chưa mở hoặc đã đóng thì không nhận thêm xác nhận.
  if (tinhTrangThai(ban.vongDoi, new Date()) !== 'da-xuat-ban') {
    return NextResponse.json(
      { loi: 'Thiệp này đã đóng, không nhận thêm xác nhận.' },
      { status: 410 },
    )
  }

  const kiemTra = rsvpDauVaoSchema.safeParse(body)
  if (!kiemTra.success) {
    return NextResponse.json(
      { loi: kiemTra.error.issues[0]?.message ?? 'Dữ liệu không hợp lệ' },
      { status: 400 },
    )
  }

  try {
    const deps = phuThuoc()
    const rsvp = await luuRsvp(deps, { ...kiemTra.data, slug })

    // Đẩy sang Google Sheet sau khi đã trả lời khách: một vòng gọi Google mất
    // vài giây, không được để khách ngồi chờ. Thất bại thì cron đẩy lại sau.
    after(() => dongBoMotRsvp(deps, rsvp))

    return NextResponse.json({ ok: true, id: rsvp.id })
  } catch (loi) {
    console.error('Lỗi lưu RSVP:', loi)
    return NextResponse.json({ loi: 'Không lưu được xác nhận. Vui lòng thử lại.' }, { status: 500 })
  }
}
