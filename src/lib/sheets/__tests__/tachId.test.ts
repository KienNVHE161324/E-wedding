import { describe, it, expect } from 'vitest'
import { tachSpreadsheetId } from '../tachId'

const ID = '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms'

describe('tachSpreadsheetId', () => {
  it('lấy được ID từ đường dẫn đầy đủ', () => {
    expect(tachSpreadsheetId(`https://docs.google.com/spreadsheets/d/${ID}/edit#gid=0`)).toBe(ID)
  })

  it('lấy được ID từ đường dẫn không có phần đuôi', () => {
    expect(tachSpreadsheetId(`https://docs.google.com/spreadsheets/d/${ID}`)).toBe(ID)
  })

  it('chấp nhận ID trần', () => {
    expect(tachSpreadsheetId(ID)).toBe(ID)
  })

  it('bỏ khoảng trắng thừa hai đầu', () => {
    expect(tachSpreadsheetId(`  ${ID}  `)).toBe(ID)
  })

  it('từ chối chuỗi quá ngắn, tránh nhận nhầm chữ gõ tay', () => {
    expect(tachSpreadsheetId('abc123')).toBeNull()
  })

  it('từ chối đường dẫn Google Docs không phải bảng tính', () => {
    expect(tachSpreadsheetId(`https://docs.google.com/document/d/${ID}/edit`)).toBeNull()
  })

  it('từ chối chuỗi rỗng', () => {
    expect(tachSpreadsheetId('   ')).toBeNull()
  })
})
