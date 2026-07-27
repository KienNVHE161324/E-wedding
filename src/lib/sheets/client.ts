import { google } from 'googleapis'
import type { SheetsApi } from './dongBo'

function xacThuc() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
  // Khóa trong .env lưu \n dạng hai ký tự, phải khôi phục thành xuống dòng thật.
  const key = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n')
  if (!email || !key) throw new Error('Thiếu thông tin service account Google')

  return new google.auth.JWT({
    email,
    key,
    scopes: [
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/drive',
    ],
  })
}

export function taoSheetsApi(): SheetsApi {
  const auth = xacThuc()
  const sheets = google.sheets({ version: 'v4', auth })
  const drive = google.drive({ version: 'v3', auth })

  return {
    async taoBangTinh(tieuDe, tenTab) {
      const res = await sheets.spreadsheets.create({
        requestBody: {
          properties: { title: tieuDe },
          sheets: tenTab.map((title) => ({ properties: { title } })),
        },
      })
      const id = res.data.spreadsheetId
      if (!id) throw new Error('Google không trả về spreadsheetId')
      return id
    },

    async themDong(spreadsheetId, tab, dong) {
      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: `'${tab}'!A:F`,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: [dong] },
      })
    },

    async moQuyenTruyCap(spreadsheetId) {
      await drive.permissions.create({
        fileId: spreadsheetId,
        requestBody: { role: 'writer', type: 'anyone' },
      })
    },
  }
}
