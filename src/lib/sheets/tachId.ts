/**
 * Tách spreadsheetId từ chuỗi người dùng dán vào — chấp nhận cả URL đầy đủ
 * lẫn ID trần, vì nhân viên thường copy nguyên thanh địa chỉ.
 * Trả về null nếu không nhận ra.
 */
export function tachSpreadsheetId(idHoacUrl: string): string | null {
  const chuoi = idHoacUrl.trim()

  const tuUrl = chuoi.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/)
  if (tuUrl) return tuUrl[1]

  // ID của Google dài, chỉ gồm chữ, số, gạch ngang và gạch dưới.
  if (/^[a-zA-Z0-9-_]{20,}$/.test(chuoi)) return chuoi

  return null
}
