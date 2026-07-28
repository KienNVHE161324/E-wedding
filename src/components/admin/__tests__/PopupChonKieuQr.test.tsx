import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { PopupChonKieuQr } from '../PopupChonKieuQr'

describe('PopupChonKieuQr', () => {
  it('hiện đủ ba kiểu và chọn đúng giá trị', async () => {
    const onChon = vi.fn()
    const onDong = vi.fn()
    render(<PopupChonKieuQr giaTri="hoa-mem" onChon={onChon} onDong={onDong} />)

    expect(screen.getByRole('dialog', { name: 'Chọn kiểu QR' })).toBeInTheDocument()
    expect(screen.getAllByRole('radio')).toHaveLength(3)

    await userEvent.click(screen.getByRole('radio', { name: 'Phong bao' }))
    expect(onChon).toHaveBeenCalledWith('phong-bao')
  })

  it('đóng bằng Escape', async () => {
    const onDong = vi.fn()
    render(<PopupChonKieuQr giaTri="hoa-mem" onChon={vi.fn()} onDong={onDong} />)

    await userEvent.keyboard('{Escape}')
    expect(onDong).toHaveBeenCalled()
  })
})
