import { describe, it, expect } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BangDieuKhien } from '../BangDieuKhien'
import type { ThiepTomTat } from '@/lib/vongDoi/types'

const danhSach: ThiepTomTat[] = [
  {
    slug: 'nam-linh',
    tenChuRe: 'Nguyễn Hoài Nam',
    tenCoDau: 'Trần Thùy Linh',
    ngayCuoi: '2026-11-14',
    themeId: 'mac-dinh',
    trangThai: 'da-xuat-ban',
    ngayHetHan: '2026-11-20T00:00:00Z',
    soNgayConLai: 6,
    soLuotXacNhan: 12,
    spreadsheetId: 'sheet-1',
  },
  {
    slug: 'tuan-mai',
    tenChuRe: 'Đỗ Anh Tuấn',
    tenCoDau: 'Vũ Thị Mai',
    ngayCuoi: '2026-12-05',
    themeId: 'mac-dinh',
    trangThai: 'nhap',
    ngayHetHan: null,
    soNgayConLai: null,
    soLuotXacNhan: 0,
    spreadsheetId: null,
  },
  {
    slug: 'hung-hoa',
    tenChuRe: 'Lê Việt Hưng',
    tenCoDau: 'Phạm Thu Hoa',
    ngayCuoi: '2026-05-02',
    themeId: 'mac-dinh',
    trangThai: 'het-han',
    ngayHetHan: '2026-05-16T00:00:00Z',
    soNgayConLai: 0,
    soLuotXacNhan: 87,
    spreadsheetId: 'sheet-3',
  },
]

describe('BangDieuKhien', () => {
  it('hiện đủ các đám cưới', () => {
    render(<BangDieuKhien danhSach={danhSach} />)
    expect(screen.getByText(/Nguyễn Hoài Nam/)).toBeInTheDocument()
    expect(screen.getByText(/Đỗ Anh Tuấn/)).toBeInTheDocument()
    expect(screen.getByText(/Lê Việt Hưng/)).toBeInTheDocument()
  })

  it('hiện nhãn trạng thái bằng tiếng Việt trên từng dòng', () => {
    render(<BangDieuKhien danhSach={danhSach} />)
    const dong = screen.getAllByRole('listitem')
    expect(within(dong[0]).getByText('Đang mở')).toBeInTheDocument()
    expect(within(dong[1]).getByText('Nháp')).toBeInTheDocument()
    expect(within(dong[2]).getByText('Hết hạn')).toBeInTheDocument()
  })

  it('hiện số ngày còn lại và số lượt xác nhận', () => {
    render(<BangDieuKhien danhSach={danhSach} />)
    expect(screen.getByText('Còn 6 ngày')).toBeInTheDocument()
    expect(screen.getByText('12')).toBeInTheDocument()
  })

  it('lọc theo tên khi gõ vào ô tìm kiếm', async () => {
    render(<BangDieuKhien danhSach={danhSach} />)
    await userEvent.type(screen.getByLabelText('Tìm kiếm'), 'Mai')
    expect(screen.getByText(/Đỗ Anh Tuấn/)).toBeInTheDocument()
    expect(screen.queryByText(/Nguyễn Hoài Nam/)).not.toBeInTheDocument()
  })

  it('lọc theo trạng thái', async () => {
    render(<BangDieuKhien danhSach={danhSach} />)
    await userEvent.selectOptions(screen.getByLabelText('Trạng thái'), 'het-han')
    expect(screen.getByText(/Lê Việt Hưng/)).toBeInTheDocument()
    expect(screen.queryByText(/Nguyễn Hoài Nam/)).not.toBeInTheDocument()
  })

  it('báo khi không có kết quả nào khớp', async () => {
    render(<BangDieuKhien danhSach={danhSach} />)
    await userEvent.type(screen.getByLabelText('Tìm kiếm'), 'khong-co-ai')
    expect(screen.getByText('Không tìm thấy đám cưới nào.')).toBeInTheDocument()
  })

  it('chỉ hiện liên kết Google Sheet khi đã có bảng tính', () => {
    render(<BangDieuKhien danhSach={danhSach} />)
    expect(screen.getAllByRole('link', { name: 'Google Sheet' })).toHaveLength(2)
  })

  it('có lối vào danh sách lời chúc riêng trên mỗi thẻ', () => {
    render(<BangDieuKhien danhSach={danhSach} />)
    expect(screen.getAllByRole('link', { name: 'Xem lời chúc' })).toHaveLength(danhSach.length)
    expect(screen.getAllByRole('link', { name: 'Xem lời chúc' })[0]).toHaveAttribute(
      'href',
      '/admin/nam-linh/loi-chuc',
    )
  })
})
