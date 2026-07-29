import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { QuanLyXuatBan } from '../QuanLyXuatBan'

const refresh = vi.fn()
vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh }) }))

const invitationId = '4dc32a02-4321-4ef1-a23a-54fd115329a2'

describe('QuanLyXuatBan', () => {
  beforeEach(() => {
    refresh.mockReset()
    vi.restoreAllMocks()
  })

  it('gửi hai mốc local datetime và invitation id', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )

    render(
      <QuanLyXuatBan
        invitationId={invitationId}
        vongDoi={{ trangThaiLuu: 'nhap', ngayXuatBan: null, ngayDong: null }}
      />,
    )
    await userEvent.type(screen.getByLabelText('Ngày giờ xuất bản'), '2026-08-01T08:00')
    await userEvent.type(screen.getByLabelText('Ngày giờ đóng'), '2026-08-20T23:00')
    await userEvent.click(screen.getByRole('button', { name: 'Lưu lịch xuất bản' }))

    await waitFor(() => expect(fetchMock).toHaveBeenCalled())
    const body = JSON.parse(String((fetchMock.mock.calls[0][1] as RequestInit).body))
    expect(body).toEqual({
      invitationId,
      ngayXuatBan: '2026-08-01T08:00',
      ngayDong: '2026-08-20T23:00',
    })
    expect(body).not.toHaveProperty('soNgay')
  })
})
