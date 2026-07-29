import { NextResponse } from 'next/server'
import { layRsvpChuaDongBo, danhDauDaDongBo } from '@/lib/db/rsvps'
import { laySpreadsheetId } from '@/lib/db/invitations'
import { taoSheetsApi } from '@/lib/sheets/client'
import { dongBoLenSheet } from '@/lib/sheets/dongBo'

/**
 * Đẩy lại các RSVP chưa lên được Google Sheet. Chạy theo lịch mỗi 15 phút.
 * Cũng là cách các RSVP cũ được đẩy lên khi admin mới gắn ID bảng tính.
 */
export async function GET() {
  const sheets = taoSheetsApi()
  const danhSach = await layRsvpChuaDongBo()

  let thanhCong = 0
  let thatBai = 0
  let chuaGanSheet = 0
  const idTheoThiep = new Map<string, string | null>()

  for (const rsvp of danhSach) {
    try {
      if (!idTheoThiep.has(rsvp.invitationId)) {
        idTheoThiep.set(rsvp.invitationId, await laySpreadsheetId(rsvp.invitationId))
      }
      const spreadsheetId = idTheoThiep.get(rsvp.invitationId)

      if (!spreadsheetId) {
        chuaGanSheet++
        continue
      }

      await dongBoLenSheet(spreadsheetId, rsvp, sheets)
      await danhDauDaDongBo(rsvp.id)
      thanhCong++
    } catch (loi) {
      console.error(`Vẫn chưa đẩy được RSVP ${rsvp.id}:`, loi)
      thatBai++
    }
  }

  return NextResponse.json({ tong: danhSach.length, thanhCong, thatBai, chuaGanSheet })
}
