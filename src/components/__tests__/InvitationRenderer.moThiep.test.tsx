import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { InvitationRenderer } from '../InvitationRenderer'
import { thiepMau } from '@/lib/invitation/mau'
import { layTheme } from '@/lib/themes'

const theme = layTheme('mac-dinh')

describe('InvitationRenderer — mở thiệp', () => {
  it('khóa cuộn trang trước khi bấm Mở thiệp', () => {
    render(<InvitationRenderer thiep={thiepMau} theme={theme} />)
    expect(document.body).toHaveClass('khoa-cuon')
  })

  it('mở khóa cuộn sau khi bấm Mở thiệp', async () => {
    render(<InvitationRenderer thiep={thiepMau} theme={theme} />)
    await userEvent.click(screen.getByRole('button', { name: 'Mở thiệp' }))
    expect(document.body).not.toHaveClass('khoa-cuon')
  })

  it('chỉ hiện nút xác nhận nổi sau khi mở thiệp', async () => {
    render(<InvitationRenderer thiep={thiepMau} theme={theme} />)
    expect(screen.queryByRole('link', { name: 'Xác nhận tham dự' })).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Mở thiệp' }))
    expect(screen.getByRole('link', { name: 'Xác nhận tham dự' })).toBeInTheDocument()
  })

  it('không hiện nút xác nhận nổi khi admin đã tắt phần xác nhận', async () => {
    const thiep = {
      ...thiepMau,
      sections: [{ id: 'bia' as const }, { id: 'rsvp' as const, enabled: false }],
    }
    render(<InvitationRenderer thiep={thiep} theme={theme} />)
    await userEvent.click(screen.getByRole('button', { name: 'Mở thiệp' }))
    expect(screen.queryByRole('link', { name: 'Xác nhận tham dự' })).not.toBeInTheDocument()
  })
})
