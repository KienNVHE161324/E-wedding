import type { Rsvp, RsvpDauVao } from './types'

export interface PhuThuoc {
  taoRsvp(dauVao: RsvpDauVao & { invitationId: string }): Promise<Rsvp>
  laySpreadsheetId(invitationId: string): Promise<string | null>
  danhDauDaDongBo(id: string): Promise<void>
  dongBoLenSheet(spreadsheetId: string, rsvp: Rsvp): Promise<void>
}

/**
 * Lưu RSVP vào DB. Đây là bước duy nhất khách mời phải chờ.
 * Lỗi ở đây được ném lên vì đó là mất dữ liệu thật.
 */
export async function luuRsvp(
  deps: PhuThuoc,
  dauVao: RsvpDauVao & { invitationId: string },
): Promise<Rsvp> {
  return deps.taoRsvp(dauVao)
}

/**
 * Đẩy một RSVP sang Google Sheet rồi đánh dấu đã đồng bộ.
 *
 * Chạy SAU khi đã trả lời khách mời, vì một vòng gọi Google mất vài giây —
 * bắt khách ngồi chờ là không chấp nhận được. Mọi lỗi đều được nuốt: bản ghi
 * vẫn nguyên trong DB và sẽ được đẩy lại bởi /api/dong-bo-sheet.
 */
export async function dongBoMotRsvp(deps: PhuThuoc, rsvp: Rsvp): Promise<boolean> {
  try {
    const spreadsheetId = await deps.laySpreadsheetId(rsvp.invitationId)
    if (!spreadsheetId) {
      console.warn(`Thiệp ${rsvp.invitationId} chưa gắn ID bảng tính, RSVP sẽ được đẩy sau.`)
      return false
    }

    await deps.dongBoLenSheet(spreadsheetId, rsvp)
    await deps.danhDauDaDongBo(rsvp.id)
    return true
  } catch (loi) {
    console.error('Không đẩy được RSVP sang Google Sheet, sẽ thử lại sau:', loi)
    return false
  }
}
