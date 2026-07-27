import type { Invitation } from '@/lib/invitation/types'
import type { Rsvp, RsvpDauVao } from './types'

export interface PhuThuoc {
  taoRsvp(dauVao: RsvpDauVao & { slug: string }): Promise<Rsvp>
  layThiep(slug: string): Promise<Invitation | null>
  laySpreadsheetId(slug: string): Promise<string | null>
  luuSpreadsheetId(slug: string, id: string): Promise<void>
  danhDauDaDongBo(id: string): Promise<void>
  taoBangTinh(thiep: Invitation): Promise<string>
  themeDongRsvp(spreadsheetId: string, rsvp: Rsvp): Promise<void>
}

/**
 * Ghi RSVP vào DB (bắt buộc thành công), rồi cố đẩy sang Google Sheet.
 *
 * Lỗi phía Google được nuốt có chủ đích: bản ghi vẫn nguyên trong DB và sẽ được
 * đẩy lại bởi /api/dong-bo-sheet. Khách mời không bao giờ thấy lỗi Google.
 */
export async function guiRsvp(
  deps: PhuThuoc,
  dauVao: RsvpDauVao & { slug: string },
): Promise<{ id: string; daDongBoSheet: boolean }> {
  const rsvp = await deps.taoRsvp(dauVao)

  try {
    let spreadsheetId = await deps.laySpreadsheetId(dauVao.slug)
    if (!spreadsheetId) {
      const thiep = await deps.layThiep(dauVao.slug)
      if (!thiep) throw new Error(`Không tìm thấy thiệp ${dauVao.slug}`)
      spreadsheetId = await deps.taoBangTinh(thiep)
      await deps.luuSpreadsheetId(dauVao.slug, spreadsheetId)
    }

    await deps.themeDongRsvp(spreadsheetId, rsvp)
    await deps.danhDauDaDongBo(rsvp.id)
    return { id: rsvp.id, daDongBoSheet: true }
  } catch (loi) {
    console.error('Không đẩy được RSVP sang Google Sheet, sẽ thử lại sau:', loi)
    return { id: rsvp.id, daDongBoSheet: false }
  }
}
