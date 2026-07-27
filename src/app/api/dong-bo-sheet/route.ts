import { NextResponse } from 'next/server'
import { layRsvpChuaDongBo, danhDauDaDongBo } from '@/lib/db/rsvps'
import { layThiepTheoSlug, laySpreadsheetId, luuSpreadsheetId } from '@/lib/db/invitations'
import { taoSheetsApi } from '@/lib/sheets/client'
import { taoBangTinh, themeDongRsvp } from '@/lib/sheets/dongBo'

/** Đẩy lại các RSVP chưa lên được Google Sheet. Chạy theo lịch mỗi 15 phút. */
export async function GET() {
  const sheets = taoSheetsApi()
  const danhSach = await layRsvpChuaDongBo()
  let thanhCong = 0
  let thatBai = 0

  for (const rsvp of danhSach) {
    try {
      let spreadsheetId = await laySpreadsheetId(rsvp.slug)
      if (!spreadsheetId) {
        const ban = await layThiepTheoSlug(rsvp.slug)
        if (!ban) throw new Error(`Không tìm thấy thiệp ${rsvp.slug}`)
        spreadsheetId = await taoBangTinh(ban.thiep, sheets)
        await luuSpreadsheetId(rsvp.slug, spreadsheetId)
      }
      await themeDongRsvp(spreadsheetId, rsvp, sheets)
      await danhDauDaDongBo(rsvp.id)
      thanhCong++
    } catch (loi) {
      console.error(`Vẫn chưa đẩy được RSVP ${rsvp.id}:`, loi)
      thatBai++
    }
  }

  return NextResponse.json({ tong: danhSach.length, thanhCong, thatBai })
}
