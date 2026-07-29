import { beforeEach, describe, expect, it, vi } from 'vitest'

const { datLich, huyUrl } = vi.hoisted(() => ({
  datLich: vi.fn(),
  huyUrl: vi.fn(),
}))

vi.mock('@/lib/db/invitations', () => ({ datLich, huyUrl }))

import { POST as datLichPOST } from '../xuat-ban/route'
import { POST as huyUrlPOST } from '../huy-url/route'

function post(body: unknown) {
  return new Request('http://localhost/api/admin/test', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

const invitationId = '4dc32a02-4321-4ef1-a23a-54fd115329a2'

describe('API vòng đời thiệp', () => {
  beforeEach(() => {
    datLich.mockReset().mockResolvedValue(undefined)
    huyUrl.mockReset().mockResolvedValue(undefined)
  })

  it('đổi giờ Việt Nam sang UTC trước khi lưu lịch', async () => {
    const res = await datLichPOST(
      post({
        invitationId,
        ngayXuatBan: '2026-08-01T08:00',
        ngayDong: '2026-08-20T23:00',
      }),
    )

    expect(res.status).toBe(200)
    expect(datLich).toHaveBeenCalledWith(
      invitationId,
      '2026-08-01T01:00:00.000Z',
      '2026-08-20T16:00:00.000Z',
    )
  })

  it('từ chối giờ đóng không sau giờ mở', async () => {
    const res = await datLichPOST(
      post({
        invitationId,
        ngayXuatBan: '2026-08-20T23:00',
        ngayDong: '2026-08-20T23:00',
      }),
    )

    expect(res.status).toBe(400)
    expect(datLich).not.toHaveBeenCalled()
  })

  it('hủy URL theo invitation id', async () => {
    const res = await huyUrlPOST(post({ invitationId }))
    expect(res.status).toBe(200)
    expect(huyUrl).toHaveBeenCalledWith(invitationId)
  })
})
