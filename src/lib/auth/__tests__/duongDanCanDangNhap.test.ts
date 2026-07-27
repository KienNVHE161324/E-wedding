import { describe, it, expect } from 'vitest'
import { canDangNhap } from '../duongDanCanDangNhap'

describe('canDangNhap', () => {
  it('chặn khu quản trị', () => {
    expect(canDangNhap('/admin')).toBe(true)
    expect(canDangNhap('/admin/nam-linh')).toBe(true)
    expect(canDangNhap('/api/admin/luu')).toBe(true)
  })

  it('không chặn thiệp công khai', () => {
    expect(canDangNhap('/nam-linh')).toBe(false)
    expect(canDangNhap('/')).toBe(false)
  })

  it('không chặn API dành cho khách mời', () => {
    expect(canDangNhap('/api/rsvp')).toBe(false)
    expect(canDangNhap('/api/dong-bo-sheet')).toBe(false)
  })

  it('không chặn trang đăng nhập, tránh vòng lặp chuyển hướng', () => {
    expect(canDangNhap('/dang-nhap')).toBe(false)
  })

  it('không nhầm slug bắt đầu bằng chữ admin là khu quản trị', () => {
    expect(canDangNhap('/administrator-cuoi')).toBe(false)
  })
})
