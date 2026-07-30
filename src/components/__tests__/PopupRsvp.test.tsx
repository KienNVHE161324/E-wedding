import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { InvitationRenderer } from '../InvitationRenderer'
import { thiepMau } from '@/lib/invitation/mau'
import { layTheme } from '@/lib/themes'
import type { Invitation } from '@/lib/invitation/types'

const theme = layTheme('mac-dinh')

async function moThiep(thiep: Invitation = thiepMau) {
  render(<InvitationRenderer thiep={thiep} theme={theme} />)
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

  it('áp dụng override cho nút nổi và tiêu đề popup trong production renderer', async () => {
    await moThiep({
      ...thiepMau,
      tuyChinhChu: {
        'nut-rsvp-noi': {
          noiDung: 'Phản hồi ngay',
          mauChu: '#123456',
        },
        'popup-rsvp.tieu-de': {
          noiDung: 'Bạn sẽ tham dự chứ?',
          mauChu: '#654321',
        },
      },
    })

    const nutNoi = screen.getByText('Phản hồi ngay')
    expect(nutNoi).toHaveAttribute('data-text-region', 'nut-rsvp-noi')
    expect(nutNoi.style.color).toBe('rgb(18, 52, 86)')
    await userEvent.click(nutNoi)

    const tieuDe = screen.getByText('Bạn sẽ tham dự chứ?')
    expect(tieuDe).toHaveAttribute('data-text-region', 'popup-rsvp.tieu-de')
    expect(tieuDe.style.color).toBe('rgb(101, 67, 33)')
    const nutDong = screen.getByRole('button', { name: 'Đóng' })
    expect(nutDong).not.toHaveAttribute('data-text-region')
    expect(nutDong.querySelector('[data-text-region]')).not.toBeInTheDocument()
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
