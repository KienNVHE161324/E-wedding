import { describe, it, expect } from 'vitest'
import { chuanBiBangTinh, themeDongRsvp, dongBoLenSheet, type SheetsApi } from '../dongBo'
import type { Rsvp } from '@/lib/rsvp/types'

function sheetsGia(tabCoSan: string[] = []) {
  const ghiNhan = {
    tabMoi: [] as string[],
    them: [] as { tab: string; dong: string[] }[],
  }
  const dangCo = [...tabCoSan]

  const api: SheetsApi = {
    async layTenTab() {
      return dangCo
    },
    async themTab(_id, ten) {
      dangCo.push(ten)
      ghiNhan.tabMoi.push(ten)
    },
    async themDong(_id, tab, dong) {
      ghiNhan.them.push({ tab, dong })
    },
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

describe('chuanBiBangTinh', () => {
  it('tạo đủ hai tab nhà trai và nhà gái trong file trống', async () => {
    const { api, ghiNhan } = sheetsGia(['Trang tính1'])
    await chuanBiBangTinh('sheet-123', api)
    expect(ghiNhan.tabMoi).toEqual(['Nhà trai', 'Nhà gái'])
  })

  it('ghi hàng tiêu đề cột vào tab vừa tạo', async () => {
    const { api, ghiNhan } = sheetsGia()
    await chuanBiBangTinh('sheet-123', api)
    expect(ghiNhan.them[0]).toEqual({
      tab: 'Nhà trai',
      dong: [
        'Ngày đăng ký', 'Họ tên', 'Quan hệ với cô dâu/chú rể',
        'Phương tiện', 'Đến ăn ngày', 'Lời chúc',
      ],
    })
    expect(ghiNhan.them[1].tab).toBe('Nhà gái')
  })

  it('không đụng vào tab đã có, tránh ghi đè dữ liệu cũ', async () => {
    const { api, ghiNhan } = sheetsGia(['Nhà trai', 'Nhà gái'])
    await chuanBiBangTinh('sheet-123', api)
    expect(ghiNhan.tabMoi).toEqual([])
    expect(ghiNhan.them).toEqual([])
  })

  it('chỉ bổ sung tab còn thiếu', async () => {
    const { api, ghiNhan } = sheetsGia(['Nhà trai'])
    await chuanBiBangTinh('sheet-123', api)
    expect(ghiNhan.tabMoi).toEqual(['Nhà gái'])
  })

  it('gọi hai lần liên tiếp không tạo trùng tab', async () => {
    const { api, ghiNhan } = sheetsGia()
    await chuanBiBangTinh('sheet-123', api)
    await chuanBiBangTinh('sheet-123', api)
    expect(ghiNhan.tabMoi).toEqual(['Nhà trai', 'Nhà gái'])
  })
})

describe('themeDongRsvp', () => {
  it('ghi vào đúng tab theo bên', async () => {
    const { api, ghiNhan } = sheetsGia(['Nhà trai', 'Nhà gái'])
    await themeDongRsvp('sheet-123', rsvpMau, api)
    expect(ghiNhan.them[0].tab).toBe('Nhà trai')

    await themeDongRsvp('sheet-123', { ...rsvpMau, ben: 'nha-gai' }, api)
    expect(ghiNhan.them[1].tab).toBe('Nhà gái')
  })

  it('ghi đủ sáu cột đúng thứ tự', async () => {
    const { api, ghiNhan } = sheetsGia(['Nhà trai'])
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
    const { api, ghiNhan } = sheetsGia(['Nhà trai'])
    await themeDongRsvp('sheet-123', { ...rsvpMau, loiChuc: undefined }, api)
    expect(ghiNhan.them[0].dong[5]).toBe('')
  })
})

describe('dongBoLenSheet', () => {
  it('dựng tab rồi mới ghi dòng, để file trống vẫn nhận được RSVP đầu tiên', async () => {
    const { api, ghiNhan } = sheetsGia()
    await dongBoLenSheet('sheet-123', rsvpMau, api)
    expect(ghiNhan.tabMoi).toEqual(['Nhà trai', 'Nhà gái'])
    // Hai dòng tiêu đề, rồi tới dòng RSVP.
    expect(ghiNhan.them).toHaveLength(3)
    expect(ghiNhan.them[2].dong[1]).toBe('Lê Văn Toàn')
  })

  it('ném lỗi lên trên khi Google hỏng, để tầng gọi xử lý đẩy lại', async () => {
    const api: SheetsApi = {
      async layTenTab() { return ['Nhà trai', 'Nhà gái'] },
      async themTab() {},
      async themDong() { throw new Error('Google 503') },
    }
    await expect(dongBoLenSheet('sheet-123', rsvpMau, api)).rejects.toThrow('Google 503')
  })
})
