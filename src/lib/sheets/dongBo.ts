import type { Ben, Invitation } from '@/lib/invitation/types'
import type { Rsvp } from '@/lib/rsvp/types'

export const TEN_TAB: Record<Ben, string> = {
  'nha-trai': 'Nhà trai',
  'nha-gai': 'Nhà gái',
}

export const COT = [
  'Ngày đăng ký',
  'Họ tên',
  'Quan hệ với cô dâu/chú rể',
  'Phương tiện',
  'Đến ăn ngày',
  'Lời chúc',
]

/**
 * Cổng trừu tượng tới Google Sheets.
 * Nhờ nó mà toàn bộ logic đồng bộ test được không cần mạng, và giả lập được lỗi Google.
 */
export interface SheetsApi {
  taoBangTinh(tieuDe: string, tenTab: string[]): Promise<string>
  themDong(spreadsheetId: string, tab: string, dong: string[]): Promise<void>
  moQuyenTruyCap(spreadsheetId: string): Promise<void>
}

function ngayVn(iso: string): string {
  const d = new Date(iso)
  const p = (n: number) => String(n).padStart(2, '0')
  return `${p(d.getUTCDate())}/${p(d.getUTCMonth() + 1)}/${d.getUTCFullYear()}`
}

export async function taoBangTinh(thiep: Invitation, sheets: SheetsApi): Promise<string> {
  const tieuDe = `RSVP - ${thiep.chuRe.ten} & ${thiep.coDau.ten}`
  const tenTab = [TEN_TAB['nha-trai'], TEN_TAB['nha-gai']]
  const spreadsheetId = await sheets.taoBangTinh(tieuDe, tenTab)

  for (const tab of tenTab) {
    await sheets.themDong(spreadsheetId, tab, COT)
  }
  await sheets.moQuyenTruyCap(spreadsheetId)

  return spreadsheetId
}

export async function themeDongRsvp(
  spreadsheetId: string,
  rsvp: Rsvp,
  sheets: SheetsApi,
): Promise<void> {
  await sheets.themDong(spreadsheetId, TEN_TAB[rsvp.ben], [
    ngayVn(rsvp.ngayDangKy),
    rsvp.hoTen,
    rsvp.quanHe,
    rsvp.phuongTien,
    rsvp.ngayAn,
    rsvp.loiChuc ?? '',
  ])
}
