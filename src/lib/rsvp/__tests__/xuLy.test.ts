import { describe, it, expect, vi } from 'vitest'
import { guiRsvp, type PhuThuoc } from '../xuLy'
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
    laySpreadsheetId: vi.fn(async () => 'sheet-123' as string | null),
    danhDauDaDongBo: vi.fn(async () => {}),
    dongBoLenSheet: vi.fn(async () => {}),
    ...ghiDe,
  }
}

describe('guiRsvp', () => {
  it('ghi DB rồi đẩy sang Sheet và đánh dấu đã đồng bộ', async () => {
    const d = deps()
    expect(await guiRsvp(d, dauVao)).toEqual({ id: 'r1', daDongBoSheet: true })
    expect(d.dongBoLenSheet).toHaveBeenCalledWith('sheet-123', expect.objectContaining({ id: 'r1' }))
    expect(d.danhDauDaDongBo).toHaveBeenCalledWith('r1')
  })

  it('thiệp chưa gắn bảng tính thì vẫn lưu thành công, chờ đẩy sau', async () => {
    const d = deps({ laySpreadsheetId: vi.fn(async () => null) })
    expect(await guiRsvp(d, dauVao)).toEqual({ id: 'r1', daDongBoSheet: false })
    expect(d.dongBoLenSheet).not.toHaveBeenCalled()
    expect(d.danhDauDaDongBo).not.toHaveBeenCalled()
  })

  it('vẫn báo thành công khi Google hỏng, và không đánh dấu đã đồng bộ', async () => {
    const d = deps({
      dongBoLenSheet: vi.fn(async () => {
        throw new Error('Google 503')
      }),
    })
    expect(await guiRsvp(d, dauVao)).toEqual({ id: 'r1', daDongBoSheet: false })
    expect(d.danhDauDaDongBo).not.toHaveBeenCalled()
  })

  it('vẫn báo thành công khi không đọc được cấu hình bảng tính', async () => {
    const d = deps({
      laySpreadsheetId: vi.fn(async () => {
        throw new Error('DB timeout')
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
