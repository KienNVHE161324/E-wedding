import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MungCuoi } from '../MungCuoi'
import { thiepMau } from '@/lib/invitation/mau'
import { layTheme } from '@/lib/themes'

const theme = layTheme('mac-dinh')

function ve(kieuHopQua: boolean) {
  return render(
    <MungCuoi thiep={{ ...thiepMau, mungCuoiKieuHopQua: kieuHopQua }} theme={theme} />,
  )
}

describe('Mừng cưới — kiểu hiện thẳng', () => {
  it('hiện luôn QR và số tài khoản của cả hai bên', () => {
    ve(false)
    expect(screen.getByAltText('QR nhà trai')).toBeInTheDocument()
    expect(screen.getByText('0123456789')).toBeInTheDocument()
    expect(screen.getByText('9876543210')).toBeInTheDocument()
  })

  it('không hiện hộp quà', () => {
    ve(false)
    expect(screen.queryByRole('button', { name: /Mở hộp quà/ })).not.toBeInTheDocument()
  })
})

describe('Mừng cưới — kiểu hộp quà', () => {
  it('ban đầu giấu QR và số tài khoản', () => {
    ve(true)
    expect(screen.queryByAltText('QR nhà trai')).not.toBeInTheDocument()
    expect(screen.queryByText('0123456789')).not.toBeInTheDocument()
  })

  it('có một hộp quà cho mỗi bên', () => {
    ve(true)
    expect(screen.getByRole('button', { name: 'Mở hộp quà Nhà trai' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Mở hộp quà Nhà gái' })).toBeInTheDocument()
  })

  it('chạm vào hộp quà thì hiện QR và số tài khoản', async () => {
    ve(true)
    await userEvent.click(screen.getByRole('button', { name: 'Mở hộp quà Nhà trai' }))
    expect(screen.getByAltText('QR nhà trai')).toBeInTheDocument()
    expect(screen.getByText('0123456789')).toBeInTheDocument()
  })

  it('mở bên này không làm lộ bên kia', async () => {
    ve(true)
    await userEvent.click(screen.getByRole('button', { name: 'Mở hộp quà Nhà trai' }))
    expect(screen.queryByText('9876543210')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Mở hộp quà Nhà gái' })).toBeInTheDocument()
  })

  it('luôn hiện tên bên để khách biết chọn hộp nào', () => {
    ve(true)
    expect(screen.getByText('Nhà trai')).toBeInTheDocument()
    expect(screen.getByText('Nhà gái')).toBeInTheDocument()
  })
})
