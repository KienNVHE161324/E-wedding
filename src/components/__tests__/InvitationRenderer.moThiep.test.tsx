import { beforeEach, describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { InvitationRenderer } from '../InvitationRenderer'
import { thiepMau } from '@/lib/invitation/mau'
import { layTheme } from '@/lib/themes'

const theme = layTheme('mac-dinh')

const play = vi.fn(async () => {})

beforeEach(() => {
  play.mockClear()
  vi.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(play)
  vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {})
})

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
    expect(screen.queryByRole('button', { name: 'Xác nhận tham dự' })).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Mở thiệp' }))
    expect(screen.getAllByRole('button', { name: 'Xác nhận tham dự' })[0]).toBeInTheDocument()
  })

  it('không hiện nút xác nhận nổi khi admin đã tắt phần xác nhận', async () => {
    const thiep = {
      ...thiepMau,
      sections: [{ id: 'bia' as const }, { id: 'rsvp' as const, enabled: false }],
    }
    render(<InvitationRenderer thiep={thiep} theme={theme} />)
    await userEvent.click(screen.getByRole('button', { name: 'Mở thiệp' }))
    expect(screen.queryByRole('button', { name: 'Xác nhận tham dự' })).not.toBeInTheDocument()
  })

  it('phát nhạc ngay trong thao tác bấm mở thiệp', async () => {
    render(<InvitationRenderer thiep={thiepMau} theme={theme} />)
    await userEvent.click(screen.getByRole('button', { name: 'Mở thiệp' }))
    expect(play).toHaveBeenCalledOnce()
    expect(screen.getByRole('button', { name: 'Tắt nhạc' })).toBeInTheDocument()
  })
})
