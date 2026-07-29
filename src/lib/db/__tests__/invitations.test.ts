import { beforeEach, describe, expect, it, vi } from 'vitest'
import { thiepMau } from '@/lib/invitation/mau'

const from = vi.fn()

vi.mock('../client', () => ({
  taoSupabase: () => ({ from }),
}))

import { datLich, huyUrl, taoThiepTrongDb } from '../invitations'

describe('repository thiệp theo id nội bộ', () => {
  beforeEach(() => from.mockReset())

  it('báo đúng khi public URL đã tồn tại', async () => {
    from.mockReturnValue({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn().mockResolvedValue({ data: null, error: { code: '23505' } }),
        })),
      })),
    })

    await expect(taoThiepTrongDb(thiepMau, 'user-1')).rejects.toThrow(
      'Đường dẫn đã tồn tại',
    )
  })

  it('lưu hai mốc lịch theo invitation id', async () => {
    const eq = vi.fn().mockResolvedValue({ error: null })
    const update = vi.fn(() => ({ eq }))
    from.mockReturnValue({ update })

    await datLich(
      '4dc32a02-4321-4ef1-a23a-54fd115329a2',
      '2026-08-01T01:00:00.000Z',
      '2026-08-20T16:00:00.000Z',
    )

    expect(update).toHaveBeenCalledWith({
      trang_thai: 'da-xuat-ban',
      ngay_xuat_ban: '2026-08-01T01:00:00.000Z',
      ngay_dong: '2026-08-20T16:00:00.000Z',
    })
    expect(eq).toHaveBeenCalledWith('id', '4dc32a02-4321-4ef1-a23a-54fd115329a2')
  })

  it('hủy bằng cách gỡ URL nhưng không xóa bản ghi', async () => {
    const eq = vi.fn().mockResolvedValue({ error: null })
    const update = vi.fn(() => ({ eq }))
    from.mockReturnValue({ update })

    await huyUrl('4dc32a02-4321-4ef1-a23a-54fd115329a2')

    expect(update).toHaveBeenCalledWith({
      trang_thai: 'da-huy',
      public_slug: null,
    })
  })
})
