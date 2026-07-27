import type { Ben } from '@/lib/invitation/types'
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
  'Đến tham dự ngày',
  'Lời chúc',
]

/**
 * Cổng trừu tượng tới Google Sheets.
 *
 * Không có thao tác tạo file: service account của Google có hạn mức Drive bằng 0
 * nên không tạo được file mới. Bảng tính do người dùng tự tạo và chia sẻ, app chỉ
 * dựng tab và ghi thêm dòng — đều là sửa file đã tồn tại nên không vướng hạn mức.
 */
export interface SheetsApi {
  layTenTab(spreadsheetId: string): Promise<string[]>
  themTab(spreadsheetId: string, ten: string): Promise<void>
  themDong(spreadsheetId: string, tab: string, dong: string[]): Promise<void>
}

function ngayVn(iso: string): string {
  const d = new Date(iso)
  const p = (n: number) => String(n).padStart(2, '0')
  return `${p(d.getUTCDate())}/${p(d.getUTCMonth() + 1)}/${d.getUTCFullYear()}`
}

/**
 * Bảo đảm bảng tính có đủ hai tab kèm hàng tiêu đề.
 * Gọi được nhiều lần: tab đã có thì bỏ qua, không ghi đè dữ liệu cũ.
 */
export async function chuanBiBangTinh(spreadsheetId: string, sheets: SheetsApi): Promise<void> {
  const dangCo = new Set(await sheets.layTenTab(spreadsheetId))

  for (const tab of [TEN_TAB['nha-trai'], TEN_TAB['nha-gai']]) {
    if (dangCo.has(tab)) continue
    await sheets.themTab(spreadsheetId, tab)
    await sheets.themDong(spreadsheetId, tab, COT)
  }
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

/** Dựng tab nếu thiếu rồi ghi một dòng RSVP. Đây là điểm vào duy nhất khi đồng bộ. */
export async function dongBoLenSheet(
  spreadsheetId: string,
  rsvp: Rsvp,
  sheets: SheetsApi,
): Promise<void> {
  await chuanBiBangTinh(spreadsheetId, sheets)
  await themeDongRsvp(spreadsheetId, rsvp, sheets)
}
