import { describe, expect, it } from 'vitest'
import { dinhDangThoiGian, gioiHanBatDau, layKetThucDoan } from '../doanNhac'

describe('đoạn nhạc', () => {
  it('giới hạn điểm bắt đầu để đoạn không vượt cuối bài', () => {
    expect(gioiHanBatDau(190, 30, 200)).toBe(170)
    expect(gioiHanBatDau(-5, 30, 200)).toBe(0)
  })

  it('dùng toàn bộ bài nếu bài ngắn hơn đoạn đã chọn', () => {
    expect(gioiHanBatDau(10, 60, 40)).toBe(0)
    expect(layKetThucDoan(0, 60, 40)).toBe(40)
  })

  it('định dạng số giây thành phút và giây', () => {
    expect(dinhDangThoiGian(80)).toBe('01:20')
  })
})
