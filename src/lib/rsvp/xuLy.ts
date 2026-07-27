import type { Rsvp, RsvpDauVao } from './types'

export interface PhuThuoc {
  taoRsvp(dauVao: RsvpDauVao & { slug: string }): Promise<Rsvp>
  laySpreadsheetId(slug: string): Promise<string | null>
  danhDauDaDongBo(id: string): Promise<void>
  dongBoLenSheet(spreadsheetId: string, rsvp: Rsvp): Promise<void>
}

/**
 * Ghi RSVP vào DB (bắt buộc thành công), rồi cố đẩy sang Google Sheet.
 *
 * Hai trường hợp không đẩy được đều KHÔNG làm hỏng trải nghiệm khách mời:
 * thiệp chưa gắn ID bảng tính, hoặc Google lỗi. Bản ghi vẫn nguyên trong DB,
 * được đánh dấu chưa đồng bộ và đẩy lại sau bởi /api/dong-bo-sheet.
 */
export async function guiRsvp(
  deps: PhuThuoc,
  dauVao: RsvpDauVao & { slug: string },
): Promise<{ id: string; daDongBoSheet: boolean }> {
  const rsvp = await deps.taoRsvp(dauVao)

  try {
    const spreadsheetId = await deps.laySpreadsheetId(dauVao.slug)
    if (!spreadsheetId) {
      console.warn(`Thiệp ${dauVao.slug} chưa gắn ID bảng tính, RSVP sẽ được đẩy sau.`)
      return { id: rsvp.id, daDongBoSheet: false }
    }

    await deps.dongBoLenSheet(spreadsheetId, rsvp)
    await deps.danhDauDaDongBo(rsvp.id)
    return { id: rsvp.id, daDongBoSheet: true }
  } catch (loi) {
    console.error('Không đẩy được RSVP sang Google Sheet, sẽ thử lại sau:', loi)
    return { id: rsvp.id, daDongBoSheet: false }
  }
}
