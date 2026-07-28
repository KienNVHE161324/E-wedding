import { useState } from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { OMungCuoi } from '../OMungCuoi'
import { thiepMau } from '@/lib/invitation/mau'
import type { OMungCuoi as OMungCuoiData } from '@/lib/invitation/types'

const themeQr = {
  kieuKhung: 'hoa-mem',
  mauQr: '#8B2F20',
  mauNen: '#FFF8EF',
} as const

function Harness({ onDoi = vi.fn() }: { onDoi?: (v: OMungCuoiData[]) => void }) {
  const [giaTri, setGiaTri] = useState(thiepMau.mungCuoi)
  return (
    <OMungCuoi
      giaTri={giaTri}
      slug="nam-linh"
      themeQr={themeQr}
      kieuKhungThiep="hoa-mem"
      onDoi={(v) => {
        setGiaTri(v)
        onDoi(v)
      }}
    />
  )
}

describe('OMungCuoi custom QR', () => {
  it('đổi preset riêng nhà trai mà không đổi nhà gái', async () => {
    const onDoi = vi.fn()
    render(<Harness onDoi={onDoi} />)

    expect(screen.getAllByDisplayValue('Theo giao diện')).toHaveLength(2)
    await userEvent.selectOptions(
      screen.getByLabelText('Kiểu QR Nhà trai'),
      'phong-bao',
    )

    const moiNhat = onDoi.mock.calls.at(-1)?.[0] as OMungCuoiData[]
    expect(moiNhat[0].tuyChinhQr?.kieuKhung).toBe('phong-bao')
    expect(moiNhat[1].tuyChinhQr).toBeUndefined()
  })

  it('cảnh báo màu có độ tương phản thấp và khôi phục theo giao diện', async () => {
    render(<Harness />)

    const mauQr = screen.getByLabelText('Màu QR Nhà trai') as HTMLInputElement
    const mauNen = screen.getByLabelText('Màu nền QR Nhà trai') as HTMLInputElement
    fireEvent.change(mauQr, { target: { value: '#FFFFFF' } })
    fireEvent.change(mauNen, { target: { value: '#FFFFFF' } })

    expect(screen.getByRole('alert')).toHaveTextContent('Độ tương phản')
    await userEvent.click(
      screen.getByRole('button', { name: 'Khôi phục QR Nhà trai theo giao diện' }),
    )
    expect(screen.getByLabelText('Kiểu QR Nhà trai')).toHaveValue('')
  })
})
