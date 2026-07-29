import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ThongBaoTrangThai } from '../ThongBaoTrangThai'

describe('ThongBaoTrangThai', () => {
  it('thiệp chưa xuất bản báo chưa mở', () => {
    render(<ThongBaoTrangThai trangThai="nhap" />)
    expect(screen.getByText('Thiệp chưa được mở')).toBeInTheDocument()
  })

  it('thiệp đã lên lịch nhưng chưa đến giờ cũng báo chưa mở', () => {
    render(<ThongBaoTrangThai trangThai="da-len-lich" />)
    expect(screen.getByRole('heading', { name: 'Thiệp chưa được mở' })).toBeInTheDocument()
  })

  it('thiệp hết hạn báo đã đóng và mời liên hệ gia đình', () => {
    render(<ThongBaoTrangThai trangThai="het-han" />)
    expect(screen.getByRole('heading', { name: 'Thiệp đã đóng' })).toBeInTheDocument()
    expect(screen.getByText(/liên hệ gia đình/)).toBeInTheDocument()
  })

  it('không hiện liên kết vào khu quản trị', () => {
    render(<ThongBaoTrangThai trangThai="het-han" />)
    expect(screen.queryByRole('link')).toBeNull()
  })
})
