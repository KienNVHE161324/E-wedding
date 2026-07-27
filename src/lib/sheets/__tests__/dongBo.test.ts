import { describe, it, expect } from 'vitest'
import { taoBangTinh, themeDongRsvp, type SheetsApi } from '../dongBo'
import { thiepMau } from '@/lib/invitation/mau'
import type { Rsvp } from '@/lib/rsvp/types'

function sheetsGia() {
  const ghiNhan = {
    tao: [] as { tieuDe: string; tenTab: string[] }[],
    them: [] as { tab: string; dong: string[] }[],
  }
  const api: SheetsApi = {
    async taoBangTinh(tieuDe, tenTab) {
      ghiNhan.tao.push({ tieuDe, tenTab })
      return 'sheet-123'
    },
    async themDong(_spreadsheetId, tab, dong) {
      ghiNhan.them.push({ tab, dong })
    },
    async moQuyenTruyCap() {},
  }
  return { api, ghiNhan }
}

const rsvpMau: Rsvp = {
  id: 'r1',
  slug: 'nam-linh',
  hoTen: 'Lê Văn Toàn',
  ben: 'nha-trai',
  quanHe: 'Bạn học chú rể',
  phuongTien: 'Xe máy',
  ngayAn: '14/11/2026',
  loiChuc: 'Chúc hai bạn trăm năm hạnh phúc.',
  ngayDangKy: '2026-10-01T03:00:00.000Z',
  daDongBoSheet: false,
}

describe('taoBangTinh', () => {
  it('tạo bảng tính với đúng hai tab nhà trai và nhà gái', async () => {
    const { api, ghiNhan } = sheetsGia()
    const id = await taoBangTinh(thiepMau, api)
    expect(id).toBe('sheet-123')
    expect(ghiNhan.tao[0]).toEqual({
      tieuDe: 'RSVP - Nguyễn Hoài Nam & Trần Thùy Linh',
      tenTab: ['Nhà trai', 'Nhà gái'],
    })
  })

  it('ghi hàng tiêu đề cột vào cả hai tab', async () => {
    const { api, ghiNhan } = sheetsGia()
    await taoBangTinh(thiepMau, api)
    expect(ghiNhan.them).toHaveLength(2)
    expect(ghiNhan.them[0].tab).toBe('Nhà trai')
    expect(ghiNhan.them[0].dong).toEqual([
      'Ngày đăng ký', 'Họ tên', 'Quan hệ với cô dâu/chú rể', 'Phương tiện', 'Đến ăn ngày', 'Lời chúc',
    ])
    expect(ghiNhan.them[1].tab).toBe('Nhà gái')
  })
})

describe('themeDongRsvp', () => {
  it('ghi vào đúng tab theo bên', async () => {
    const { api, ghiNhan } = sheetsGia()
    await themeDongRsvp('sheet-123', rsvpMau, api)
    expect(ghiNhan.them[0].tab).toBe('Nhà trai')

    await themeDongRsvp('sheet-123', { ...rsvpMau, ben: 'nha-gai' }, api)
    expect(ghiNhan.them[1].tab).toBe('Nhà gái')
  })

  it('ghi đủ sáu cột đúng thứ tự', async () => {
    const { api, ghiNhan } = sheetsGia()
    await themeDongRsvp('sheet-123', rsvpMau, api)
    expect(ghiNhan.them[0].dong).toEqual([
      '01/10/2026',
      'Lê Văn Toàn',
      'Bạn học chú rể',
      'Xe máy',
      '14/11/2026',
      'Chúc hai bạn trăm năm hạnh phúc.',
    ])
  })

  it('để trống cột lời chúc khi khách không viết', async () => {
    const { api, ghiNhan } = sheetsGia()
    await themeDongRsvp('sheet-123', { ...rsvpMau, loiChuc: undefined }, api)
    expect(ghiNhan.them[0].dong[5]).toBe('')
  })

  it('ném lỗi lên trên khi Google hỏng, để tầng gọi xử lý đẩy lại', async () => {
    const api: SheetsApi = {
      async taoBangTinh() { return 'x' },
      async themDong() { throw new Error('Google 503') },
      async moQuyenTruyCap() {},
    }
    await expect(themeDongRsvp('sheet-123', rsvpMau, api)).rejects.toThrow('Google 503')
  })
})
