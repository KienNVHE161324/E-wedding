import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Rsvp } from '../Rsvp'
import { thiepMau } from '@/lib/invitation/mau'
import { layTheme } from '@/lib/themes'

const theme = layTheme('mac-dinh')

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ ok: true }))))
})

async function dienForm() {
  await userEvent.type(screen.getByLabelText('Họ và tên'), 'Lê Văn Toàn')
  await userEvent.selectOptions(screen.getByLabelText('Bạn là khách của'), 'nha-trai')
  await userEvent.type(screen.getByLabelText('Quan hệ với cô dâu/chú rể'), 'Bạn học chú rể')
  await userEvent.selectOptions(screen.getByLabelText('Phương tiện di chuyển'), 'Xe máy')
  await userEvent.selectOptions(screen.getByLabelText('Đến ăn ngày'), '14/11/2026')
}

describe('Form xác nhận tham dự', () => {
  it('có đủ các trường theo yêu cầu', () => {
    render(<Rsvp thiep={thiepMau} theme={theme} />)
    for (const nhan of [
      'Họ và tên',
      'Bạn là khách của',
      'Quan hệ với cô dâu/chú rể',
      'Phương tiện di chuyển',
      'Đến ăn ngày',
      'Lời chúc (không bắt buộc)',
    ]) {
      expect(screen.getByLabelText(nhan)).toBeInTheDocument()
    }
  })

  it('gửi đúng dữ liệu kèm slug lên API', async () => {
    render(<Rsvp thiep={thiepMau} theme={theme} />)
    await dienForm()
    await userEvent.click(screen.getByRole('button', { name: 'Gửi xác nhận' }))

    const [url, opts] = (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0]
    expect(url).toBe('/api/rsvp')
    expect(JSON.parse((opts as RequestInit).body as string)).toMatchObject({
      slug: 'nam-linh',
      hoTen: 'Lê Văn Toàn',
      ben: 'nha-trai',
    })
  })

  it('hiện lời cảm ơn sau khi gửi thành công', async () => {
    render(<Rsvp thiep={thiepMau} theme={theme} />)
    await dienForm()
    await userEvent.click(screen.getByRole('button', { name: 'Gửi xác nhận' }))
    expect(await screen.findByText(/Cảm ơn bạn/)).toBeInTheDocument()
  })

  it('báo lỗi thân thiện khi API trả về lỗi', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(JSON.stringify({ loi: 'Thiệp này đã đóng' }), { status: 410 })),
    )
    render(<Rsvp thiep={thiepMau} theme={theme} />)
    await dienForm()
    await userEvent.click(screen.getByRole('button', { name: 'Gửi xác nhận' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Thiệp này đã đóng')
  })
})
