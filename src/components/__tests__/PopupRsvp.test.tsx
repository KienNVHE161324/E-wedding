import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { InvitationRenderer } from '../InvitationRenderer'
import { thiepMau } from '@/lib/invitation/mau'
import { layTheme } from '@/lib/themes'

const theme = layTheme('mac-dinh')

async function moThiep() {
  render(<InvitationRenderer thiep={thiepMau} theme={theme} />)
  await userEvent.click(screen.getByRole('button', { name: 'Mở thiệp' }))
}

describe('Popup xác nhận tham dự', () => {
  it('form không hiện sẵn trên thiệp, phải bấm mới ra', async () => {
    await moThiep()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Họ và tên')).not.toBeInTheDocument()
  })

  it('bấm nút nổi thì mở popup có form', async () => {
    await moThiep()
    await userEvent.click(screen.getAllByRole('button', { name: 'Xác nhận tham dự' })[0])
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByLabelText('Họ và tên')).toBeInTheDocument()
  })

  it('bấm nút trong phần xác nhận cũng mở đúng popup đó', async () => {
    await moThiep()
    await userEvent.click(screen.getByRole('button', { name: 'Điền xác nhận' }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('đóng được bằng nút đóng', async () => {
    await moThiep()
    await userEvent.click(screen.getByRole('button', { name: 'Điền xác nhận' }))
    await userEvent.click(screen.getByRole('button', { name: 'Đóng' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('đóng được bằng phím Esc', async () => {
    await moThiep()
    await userEvent.click(screen.getByRole('button', { name: 'Điền xác nhận' }))
    await userEvent.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('khóa cuộn nền khi popup đang mở, trả lại khi đóng', async () => {
    await moThiep()
    await userEvent.click(screen.getByRole('button', { name: 'Điền xác nhận' }))
    expect(document.body.style.overflow).toBe('hidden')
    await userEvent.click(screen.getByRole('button', { name: 'Đóng' }))
    expect(document.body.style.overflow).not.toBe('hidden')
  })

  it('gửi xong hiện lời cảm ơn ngay trong popup', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ ok: true }))))
    await moThiep()
    await userEvent.click(screen.getByRole('button', { name: 'Điền xác nhận' }))

    await userEvent.type(screen.getByLabelText('Họ và tên'), 'Lê Văn Toàn')
    await userEvent.selectOptions(screen.getByLabelText('Bạn là khách của'), 'nha-trai')
    await userEvent.type(screen.getByLabelText('Quan hệ với cô dâu/chú rể'), 'Bạn học')
    await userEvent.selectOptions(screen.getByLabelText('Đến tham dự ngày'), '14/11/2026')
    await userEvent.click(screen.getByRole('button', { name: 'Gửi xác nhận' }))

    expect(await screen.findByText(/Cảm ơn bạn/)).toBeInTheDocument()
    vi.unstubAllGlobals()
  })
})
