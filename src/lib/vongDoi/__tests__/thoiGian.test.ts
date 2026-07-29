import { describe, expect, it } from 'vitest'
import { sangNgayGioVietNam, tuNgayGioVietNam } from '../thoiGian'

describe('chuyển đổi ngày giờ Việt Nam', () => {
  it('đổi giờ Việt Nam sang UTC để lưu', () => {
    expect(tuNgayGioVietNam('2026-08-01T08:00')).toBe('2026-08-01T01:00:00.000Z')
  })

  it('đổi UTC về giá trị cho ô datetime-local', () => {
    expect(sangNgayGioVietNam('2026-08-01T01:00:00.000Z')).toBe('2026-08-01T08:00')
    expect(sangNgayGioVietNam(null)).toBe('')
  })

  it('từ chối chuỗi ngày giờ không hợp lệ', () => {
    expect(() => tuNgayGioVietNam('')).toThrow('Ngày giờ không hợp lệ')
    expect(() => tuNgayGioVietNam('2026-02-30T08:00')).toThrow('Ngày giờ không hợp lệ')
  })
})
