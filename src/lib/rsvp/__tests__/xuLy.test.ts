import { describe, it, expect, vi } from 'vitest'
import { luuRsvp, dongBoMotRsvp, type PhuThuoc } from '../xuLy'
import type { Rsvp } from '../types'

const dauVao = {
  slug: 'nam-linh',
  hoTen: 'Lê Văn Toàn',
  ben: 'nha-trai' as const,
  quanHe: 'Bạn học chú rể',
  phuongTien: 'Xe máy',
  ngayAn: '14/11/2026',
  tuyChinh: {},
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
    laySpreadsheetId: vi.fn(async () => 'sheet-123' as string | null),
    danhDauDaDongBo: vi.fn(async () => {}),
    dongBoLenSheet: vi.fn(async () => {}),
    ...ghiDe,
  }
}

describe('luuRsvp', () => {
  it('ghi vào DB và trả về bản ghi', async () => {
    const d = deps()
    expect(await luuRsvp(d, dauVao)).toMatchObject({ id: 'r1', hoTen: 'Lê Văn Toàn' })
  })

  it('KHÔNG gọi Google, để khách mời không phải chờ', async () => {
    const d = deps()
    await luuRsvp(d, dauVao)
    expect(d.dongBoLenSheet).not.toHaveBeenCalled()
    expect(d.laySpreadsheetId).not.toHaveBeenCalled()
  })

  it('ném lỗi khi ghi DB thất bại, vì đó là mất dữ liệu thật', async () => {
    const d = deps({
      taoRsvp: vi.fn(async () => {
        throw new Error('DB down')
      }),
    })
    await expect(luuRsvp(d, dauVao)).rejects.toThrow('DB down')
  })
})

describe('dongBoMotRsvp', () => {
  it('đẩy sang Sheet rồi đánh dấu đã đồng bộ', async () => {
    const d = deps()
    expect(await dongBoMotRsvp(d, rsvpTao())).toBe(true)
    expect(d.dongBoLenSheet).toHaveBeenCalledWith('sheet-123', expect.objectContaining({ id: 'r1' }))
    expect(d.danhDauDaDongBo).toHaveBeenCalledWith('r1')
  })

  it('thiệp chưa gắn bảng tính thì bỏ qua, chờ đẩy sau', async () => {
    const d = deps({ laySpreadsheetId: vi.fn(async () => null) })
    expect(await dongBoMotRsvp(d, rsvpTao())).toBe(false)
    expect(d.dongBoLenSheet).not.toHaveBeenCalled()
    expect(d.danhDauDaDongBo).not.toHaveBeenCalled()
  })

  it('nuốt lỗi Google và không đánh dấu đã đồng bộ', async () => {
    const d = deps({
      dongBoLenSheet: vi.fn(async () => {
        throw new Error('Google 503')
      }),
    })
    expect(await dongBoMotRsvp(d, rsvpTao())).toBe(false)
    expect(d.danhDauDaDongBo).not.toHaveBeenCalled()
  })

  it('nuốt cả lỗi khi không đọc được cấu hình bảng tính', async () => {
    const d = deps({
      laySpreadsheetId: vi.fn(async () => {
        throw new Error('DB timeout')
      }),
    })
    expect(await dongBoMotRsvp(d, rsvpTao())).toBe(false)
  })
})
