import { describe, it, expect, vi } from 'vitest'
import { guiRsvp, type PhuThuoc } from '../xuLy'
import { thiepMau } from '@/lib/invitation/mau'
import type { Rsvp } from '../types'

const dauVao = {
  slug: 'nam-linh',
  hoTen: 'Lê Văn Toàn',
  ben: 'nha-trai' as const,
  quanHe: 'Bạn học chú rể',
  phuongTien: 'Xe máy',
  ngayAn: '14/11/2026',
}

const rsvpTao = (): Rsvp => ({
  ...dauVao,
  id: 'r1',
  ngayDangKy: '2026-10-01T03:00:00.000Z',
  daDongBoSheet: false,
})

function deps(ghiDe: Partial<PhuThuoc> = {}): PhuThuoc {
  return {
    taoRsvp: vi.fn(async () => rsvpTao()),
    layThiep: vi.fn(async () => thiepMau),
    laySpreadsheetId: vi.fn(async () => 'sheet-123' as string | null),
    luuSpreadsheetId: vi.fn(async () => {}),
    danhDauDaDongBo: vi.fn(async () => {}),
    taoBangTinh: vi.fn(async () => 'sheet-moi'),
    themeDongRsvp: vi.fn(async () => {}),
    ...ghiDe,
  }
}

describe('guiRsvp', () => {
  it('ghi DB rồi đẩy sang Sheet và đánh dấu đã đồng bộ', async () => {
    const d = deps()
    expect(await guiRsvp(d, dauVao)).toEqual({ id: 'r1', daDongBoSheet: true })
    expect(d.danhDauDaDongBo).toHaveBeenCalledWith('r1')
  })

  it('tự tạo bảng tính khi thiệp chưa có', async () => {
    const d = deps({ laySpreadsheetId: vi.fn(async () => null) })
    await guiRsvp(d, dauVao)
    expect(d.taoBangTinh).toHaveBeenCalled()
    expect(d.luuSpreadsheetId).toHaveBeenCalledWith('nam-linh', 'sheet-moi')
  })

  it('vẫn báo thành công khi Google hỏng, và không đánh dấu đã đồng bộ', async () => {
    const d = deps({
      themeDongRsvp: vi.fn(async () => {
        throw new Error('Google 503')
      }),
    })
    expect(await guiRsvp(d, dauVao)).toEqual({ id: 'r1', daDongBoSheet: false })
    expect(d.danhDauDaDongBo).not.toHaveBeenCalled()
  })

  it('vẫn báo thành công khi không tạo được bảng tính', async () => {
    const d = deps({
      laySpreadsheetId: vi.fn(async () => null),
      taoBangTinh: vi.fn(async () => {
        throw new Error('Google 403')
      }),
    })
    expect((await guiRsvp(d, dauVao)).daDongBoSheet).toBe(false)
  })

  it('ném lỗi khi ghi DB thất bại, vì đó là mất dữ liệu thật', async () => {
    const d = deps({
      taoRsvp: vi.fn(async () => {
        throw new Error('DB down')
      }),
    })
    await expect(guiRsvp(d, dauVao)).rejects.toThrow('DB down')
  })
})
