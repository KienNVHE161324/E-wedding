import { describe, it, expect } from 'vitest'

describe('bộ test', () => {
  it('chạy được và giữ nguyên dấu tiếng Việt', () => {
    expect('Xác nhận tham dự').toContain('ậ')
  })
})
