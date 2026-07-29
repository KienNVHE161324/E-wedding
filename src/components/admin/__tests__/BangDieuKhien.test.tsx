import { describe, it, expect } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BangDieuKhien } from '../BangDieuKhien'
import type { ThiepTomTat } from '@/lib/vongDoi/types'

const danhSach: ThiepTomTat[] = [
  {
    id: '4dc32a02-4321-4ef1-a23a-54fd115329a2',
    publicSlug: 'nam-linh',
    tenChuRe: 'Nguyễn Hoài Nam',
    tenCoDau: 'Trần Thùy Linh',
    ngayCuoi: '2026-11-14',
    themeId: 'mac-dinh',
    trangThai: 'da-xuat-ban',
    ngayXuatBan: '2026-11-01T00:00:00Z',
    ngayDong: '2026-11-20T00:00:00Z',
    soLuotXacNhan: 12,
    spreadsheetId: 'sheet-1',
  },
  {
    id: '9e405ce0-c2bb-4b6f-a46a-a3cf1780bb6f',
    publicSlug: 'tuan-mai',
    tenChuRe: 'Đỗ Anh Tuấn',
    tenCoDau: 'Vũ Thị Mai',
    ngayCuoi: '2026-12-05',
    themeId: 'mac-dinh',
    trangThai: 'nhap',
    ngayXuatBan: null,
    ngayDong: null,
    soLuotXacNhan: 0,
    spreadsheetId: null,
  },
  {
    id: '5a75d83b-b8ee-4215-90d9-3049bd17fc65',
    publicSlug: 'hung-hoa',
    tenChuRe: 'Lê Việt Hưng',
    tenCoDau: 'Phạm Thu Hoa',
    ngayCuoi: '2026-05-02',
    themeId: 'mac-dinh',
    trangThai: 'het-han',
    ngayXuatBan: '2026-05-01T00:00:00Z',
    ngayDong: '2026-05-16T00:00:00Z',
    soLuotXacNhan: 87,
    spreadsheetId: 'sheet-3',
  },
  {
    id: 'b11148cb-1c0e-4da3-9a85-dcbf8a2818ef',
    publicSlug: null,
    tenChuRe: 'Đã',
    tenCoDau: 'Hủy',
    ngayCuoi: '2026-09-01',
    themeId: 'mac-dinh',
    trangThai: 'da-huy',
    ngayXuatBan: '2026-08-01T00:00:00Z',
    ngayDong: '2026-09-02T00:00:00Z',
    soLuotXacNhan: 3,
    spreadsheetId: null,
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
    expect(within(dong[2]).getByText('Đã đóng')).toBeInTheDocument()
  })

  it('hiện số lượt xác nhận', () => {
    render(<BangDieuKhien danhSach={danhSach} />)
    expect(screen.getByText('12')).toBeInTheDocument()
  })

  it('thiệp đã hủy vẫn sửa được bằng id nhưng không còn link công khai', () => {
    render(<BangDieuKhien danhSach={danhSach} />)
    const dong = screen.getAllByRole('listitem')[3]
    expect(within(dong).getByText('Đã hủy')).toBeInTheDocument()
    expect(within(dong).queryByRole('link', { name: 'Xem thiệp' })).not.toBeInTheDocument()
    expect(within(dong).getByRole('link', { name: 'Sửa thiệp' })).toHaveAttribute(
      'href',
      '/admin/thiep/b11148cb-1c0e-4da3-9a85-dcbf8a2818ef',
    )
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
      '/admin/thiep/4dc32a02-4321-4ef1-a23a-54fd115329a2/loi-chuc',
    )
  })
})
