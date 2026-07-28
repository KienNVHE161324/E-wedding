import { useState } from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ONhac } from '../ONhac'
import type { Invitation } from '@/lib/invitation/types'

function Harness({
  onDoi = vi.fn(),
  giaTriBanDau = {
    url: '/nhac/em-dong-y-i-do.mp3',
    ten: 'Em Đồng Ý (I Do)',
  },
}: {
  onDoi?: (v: Invitation['nhac']) => void
  giaTriBanDau?: NonNullable<Invitation['nhac']>
}) {
  const [nhac, setNhac] = useState<Invitation['nhac']>(giaTriBanDau)
  return (
    <ONhac
      giaTri={nhac}
      slug="nam-linh"
      onDoi={(moi) => {
        setNhac(moi)
        onDoi(moi)
      }}
    />
  )
}

describe('ONhac', () => {
  it('chọn đoạn 30 giây và lưu điểm bắt đầu từ thanh thời gian', async () => {
    const onDoi = vi.fn()
    render(<Harness onDoi={onDoi} />)
    const audio = screen.getByTestId('nghe-thu-nhac')
    Object.defineProperty(audio, 'duration', { configurable: true, value: 200 })
    fireEvent.loadedMetadata(audio)

    await userEvent.click(screen.getByRole('radio', { name: '30 giây' }))
    fireEvent.change(screen.getByRole('slider', { name: 'Điểm bắt đầu đoạn nhạc' }), {
      target: { value: '80' },
    })

    expect(screen.getByText('Đoạn phát: 01:20 – 01:50')).toBeInTheDocument()
    expect(onDoi.mock.calls.at(-1)?.[0]).toMatchObject({ batDau: 80, thoiLuong: 30 })
  })

  it('chọn cả bài thì xóa cấu hình đoạn', async () => {
    const onDoi = vi.fn()
    render(
      <Harness
        onDoi={onDoi}
        giaTriBanDau={{
          url: '/nhac/em-dong-y-i-do.mp3',
          ten: 'Em Đồng Ý (I Do)',
          batDau: 80,
          thoiLuong: 30,
        }}
      />,
    )

    await userEvent.click(screen.getByRole('radio', { name: 'Cả bài' }))
    expect(onDoi.mock.calls.at(-1)?.[0]).toEqual({
      url: '/nhac/em-dong-y-i-do.mp3',
      ten: 'Em Đồng Ý (I Do)',
    })
  })

  it('hiển thị bốn bài nhạc mặc định đã thêm', () => {
    render(<Harness />)

    const danhSach = screen.getByRole('combobox', { name: 'Bản nhạc gợi ý' })
    expect(danhSach).toHaveTextContent('Em Đồng Ý (I Do)')
    expect(danhSach).toHaveTextContent('Lễ Đường')
    expect(danhSach).toHaveTextContent('Một Đời')
    expect(danhSach).toHaveTextContent('Ngày Này, Người Con Gái Này')
  })

  it('nghe thử quay về đầu đoạn khi phát đến cuối đoạn', () => {
    render(
      <Harness
        giaTriBanDau={{
          url: '/nhac/em-dong-y-i-do.mp3',
          ten: 'Em Đồng Ý (I Do)',
          batDau: 80,
          thoiLuong: 30,
        }}
      />,
    )
    const audio = screen.getByTestId('nghe-thu-nhac') as HTMLAudioElement
    Object.defineProperty(audio, 'duration', { configurable: true, value: 200 })
    fireEvent.loadedMetadata(audio)

    audio.currentTime = 110
    fireEvent.timeUpdate(audio)

    expect(audio.currentTime).toBe(80)
  })
})
