import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { HuyUrl } from '../HuyUrl'

const push = vi.fn()
vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }))

describe('HuyUrl', () => {
  beforeEach(() => {
    push.mockReset()
    vi.restoreAllMocks()
  })

  it('giải thích dữ liệu được giữ và chỉ hủy sau xác nhận', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )
    render(
      <HuyUrl
        invitationId="4dc32a02-4321-4ef1-a23a-54fd115329a2"
        publicSlug="nam-linh"
      />,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Hủy thiệp và gỡ đường dẫn' }))
    expect(screen.getByText(/giữ nguyên nội dung, RSVP và lời chúc/i)).toBeInTheDocument()
    expect(fetchMock).not.toHaveBeenCalled()

    await userEvent.click(screen.getByRole('button', { name: 'Xác nhận hủy' }))
    await waitFor(() => expect(fetchMock).toHaveBeenCalled())
    expect(push).toHaveBeenCalledWith('/admin')
  })
})
