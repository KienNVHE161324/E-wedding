import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { FormTaoMoi } from '../FormTaoMoi'

const push = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}))

describe('FormTaoMoi', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    push.mockReset()
  })

  it('gửi kiểu QR đã chọn khi tạo thiệp', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ ok: true, slug: 'nam-linh' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )
    render(<FormTaoMoi />)

    await userEvent.type(screen.getByLabelText('Tên chú rể'), 'Nam')
    await userEvent.type(screen.getByLabelText('Tên cô dâu'), 'Linh')
    await userEvent.type(screen.getByLabelText('Ngày cưới'), '2026-11-14')
    await userEvent.type(screen.getByLabelText('Đường dẫn thiệp'), 'nam-linh')
    await userEvent.selectOptions(screen.getByLabelText('Giao diện'), 'mac-dinh')
    await userEvent.click(screen.getByRole('button', { name: 'Chọn kiểu QR' }))
    await userEvent.click(screen.getByRole('radio', { name: 'Tối giản' }))
    await userEvent.click(screen.getByRole('button', { name: 'Dùng kiểu này' }))
    await userEvent.click(screen.getByRole('button', { name: 'Tạo và bắt đầu sửa' }))

    await waitFor(() => expect(fetchMock).toHaveBeenCalled())
    const init = fetchMock.mock.calls[0][1] as RequestInit
    expect(JSON.parse(String(init.body))).toMatchObject({ kieuKhungQr: 'toi-gian' })
  })
})
