import { google } from 'googleapis'
import type { SheetsApi } from './dongBo'

function xacThuc() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
  // Khóa trong .env lưu \n dạng hai ký tự, phải khôi phục thành xuống dòng thật.
  const key = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n')
  if (!email || !key) throw new Error('Thiếu thông tin service account Google')

  // Chỉ xin quyền spreadsheets: app không tạo hay tìm file trên Drive.
  return new google.auth.JWT({
    email,
    key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  })
}

export function taoSheetsApi(): SheetsApi {
  const sheets = google.sheets({ version: 'v4', auth: xacThuc() })

  return {
    async layTenTab(spreadsheetId) {
      const res = await sheets.spreadsheets.get({
        spreadsheetId,
        fields: 'sheets.properties.title',
      })
      return (res.data.sheets ?? [])
        .map((s) => s.properties?.title)
        .filter((t): t is string => Boolean(t))
    },

    async themTab(spreadsheetId, ten) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: { requests: [{ addSheet: { properties: { title: ten } } }] },
      })
    },

    async themDong(spreadsheetId, tab, dong) {
      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: `'${tab}'!A:F`,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: [dong] },
      })
    },
  }
}
