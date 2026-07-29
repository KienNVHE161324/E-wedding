import { useState } from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { thiepMau } from '@/lib/invitation/mau'
import type { TextRegionId } from '@/lib/invitation/textTypes'
import type { Invitation } from '@/lib/invitation/types'
import { BangChinhChu } from '../BangChinhChu'
import { parseSoNhap } from '../numberInput'

const ID_CO_DAU = 'bia.co-dau.ten'
const ID_LOI_MO_DAU = 'bia.loi-mo-dau'
const ID_TIEU_DE_RSVP = 'rsvp.tieu-de'
const ID_GIOI_THIEU_CO_DAU = 'co-dau-chu-re.co-dau.gioi-thieu'

function KhungBangChinhChu({
  banDau = thiepMau,
  chonBanDau = null,
  onDoi = vi.fn(),
}: {
  banDau?: Invitation
  chonBanDau?: TextRegionId | null
  onDoi?: (thiep: Invitation) => void
}) {
  const [thiep, setThiep] = useState(banDau)
  const [dangChon, setDangChon] = useState<TextRegionId | null>(chonBanDau)

  return (
    <>
      <BangChinhChu
        thiep={thiep}
        dangChon={dangChon}
        onChon={setDangChon}
        onDoi={(giaTri) => {
          setThiep(giaTri)
          onDoi(giaTri)
        }}
      />
      <output data-testid="invitation-state">{JSON.stringify(thiep)}</output>
    </>
  )
}

function docThiep(): Invitation {
  return JSON.parse(screen.getByTestId('invitation-state').textContent ?? '{}')
}

async function chonVung(id: TextRegionId) {
  await userEvent.click(
    screen.getByRole('button', { name: `Chọn vùng chữ ${id}` }),
  )
}

describe('parseSoNhap', () => {
  it.each(['', '-', '.', 'Infinity', 'NaN', '121', '-101'])(
    'trả null cho giá trị dở dang hoặc ngoài giới hạn: %s',
    (raw) => {
      expect(parseSoNhap(raw, -100, 120)).toBeNull()
    },
  )

  it('giữ số thập phân hợp lệ kể cả 0', () => {
    expect(parseSoNhap('8.5', -100, 100)).toBe(8.5)
    expect(parseSoNhap('0', -100, 100)).toBe(0)
  })
})

describe('BangChinhChu', () => {
  it('nhóm danh sách theo section và chỉ hiện controls sau khi chọn', async () => {
    render(<KhungBangChinhChu />)

    expect(
      screen.getByRole('group', { name: 'Bìa' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('group', { name: 'Popup' }),
    ).toBeInTheDocument()
    expect(
      screen.queryByLabelText('Nội dung vùng chữ'),
    ).not.toBeInTheDocument()

    await chonVung(ID_CO_DAU)

    expect(screen.getByLabelText('Nội dung vùng chữ')).toHaveValue(
      thiepMau.coDau.ten,
    )
    expect(
      screen.getByRole('button', { name: `Chọn vùng chữ ${ID_CO_DAU}` }),
    ).toHaveAttribute('aria-pressed', 'true')
  })

  it('dùng setter registry cho nội dung canonical và override cho style', async () => {
    const onDoi = vi.fn()
    render(<KhungBangChinhChu onDoi={onDoi} />)
    await chonVung(ID_CO_DAU)

    await userEvent.clear(screen.getByLabelText('Nội dung vùng chữ'))
    await userEvent.type(
      screen.getByLabelText('Nội dung vùng chữ'),
      'Thu Hà',
    )
    await userEvent.selectOptions(
      screen.getByLabelText('Phông chữ vùng chữ'),
      'viet-tay',
    )
    fireEvent.change(screen.getByLabelText('Cỡ chữ vùng chữ'), {
      target: { value: '42' },
    })
    fireEvent.change(screen.getByLabelText('Màu chữ vùng chữ'), {
      target: { value: '#123456' },
    })
    fireEvent.change(screen.getByLabelText('Tọa độ X vùng chữ'), {
      target: { value: '8.5' },
    })

    const thiep = docThiep()
    expect(onDoi).toHaveBeenCalled()
    expect(thiep.coDau.ten).toBe('Thu Hà')
    expect(thiep.tuyChinhChu?.[ID_CO_DAU]).toEqual({
      font: 'viet-tay',
      coChu: 42,
      mauChu: '#123456',
      x: 8.5,
    })
    expect(thiep.tuyChinhChu?.[ID_CO_DAU]?.noiDung).toBeUndefined()
  })

  it('xóa noiDung override cũ khi sửa nội dung canonical', async () => {
    render(
      <KhungBangChinhChu
        banDau={{
          ...thiepMau,
          tuyChinhChu: {
            [ID_CO_DAU]: {
              noiDung: 'Nội dung override cũ',
              font: 'viet-tay',
            },
          },
        }}
        chonBanDau={ID_CO_DAU}
      />,
    )

    await userEvent.clear(screen.getByLabelText('Nội dung vùng chữ'))
    await userEvent.type(
      screen.getByLabelText('Nội dung vùng chữ'),
      'Tên canonical mới',
    )

    expect(docThiep().coDau.ten).toBe('Tên canonical mới')
    expect(docThiep().tuyChinhChu?.[ID_CO_DAU]).toEqual({
      font: 'viet-tay',
    })
  })

  it('ghi nội dung copy hệ thống vào override thay vì dữ liệu canonical', async () => {
    render(<KhungBangChinhChu />)
    await chonVung(ID_LOI_MO_DAU)

    await userEvent.clear(screen.getByLabelText('Nội dung vùng chữ'))
    await userEvent.type(
      screen.getByLabelText('Nội dung vùng chữ'),
      'Trân trọng kính mời',
    )

    const thiep = docThiep()
    expect(thiep.tuyChinhChu?.[ID_LOI_MO_DAU]?.noiDung).toBe(
      'Trân trọng kính mời',
    )
    expect(thiep.coDau).toEqual(thiepMau.coDau)
  })

  it('giữ bản nhập nhưng không commit tiêu đề hệ thống chỉ có khoảng trắng', async () => {
    const onDoi = vi.fn()
    render(
      <KhungBangChinhChu
        chonBanDau={ID_TIEU_DE_RSVP}
        onDoi={onDoi}
      />,
    )
    const noiDung = screen.getByLabelText('Nội dung vùng chữ')

    await userEvent.clear(noiDung)
    await userEvent.type(noiDung, '   ')

    expect(noiDung).toHaveValue('   ')
    expect(noiDung).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Nội dung tiêu đề hoặc nút không được để trống',
    )
    expect(onDoi).not.toHaveBeenCalled()
    expect(docThiep().tuyChinhChu?.[ID_TIEU_DE_RSVP]).toBeUndefined()
  })

  it('vẫn cho phép xóa nội dung canonical vốn là tùy chọn', async () => {
    const onDoi = vi.fn()
    render(
      <KhungBangChinhChu
        banDau={{
          ...thiepMau,
          coDau: { ...thiepMau.coDau, gioiThieu: 'Giới thiệu cô dâu' },
        }}
        chonBanDau={ID_GIOI_THIEU_CO_DAU}
        onDoi={onDoi}
      />,
    )

    await userEvent.clear(screen.getByLabelText('Nội dung vùng chữ'))

    expect(docThiep().coDau.gioiThieu).toBeUndefined()
    expect(onDoi).toHaveBeenCalled()
    expect(screen.getByLabelText('Nội dung vùng chữ')).not.toHaveAttribute(
      'aria-invalid',
    )
  })

  it('giữ raw input số dở dang và không làm hỏng invitation state', async () => {
    const onDoi = vi.fn()
    render(
      <KhungBangChinhChu
        banDau={{
          ...thiepMau,
          tuyChinhChu: { [ID_CO_DAU]: { coChu: 30, x: 5, y: -4 } },
        }}
        onDoi={onDoi}
      />,
    )
    await chonVung(ID_CO_DAU)
    onDoi.mockClear()

    fireEvent.change(screen.getByLabelText('Cỡ chữ vùng chữ'), {
      target: { value: '-' },
    })
    fireEvent.change(screen.getByLabelText('Tọa độ X vùng chữ'), {
      target: { value: '.' },
    })
    fireEvent.change(screen.getByLabelText('Tọa độ Y vùng chữ'), {
      target: { value: '101' },
    })

    expect(screen.getByLabelText('Cỡ chữ vùng chữ')).toHaveValue('-')
    expect(screen.getByLabelText('Tọa độ X vùng chữ')).toHaveValue('.')
    expect(screen.getByLabelText('Tọa độ Y vùng chữ')).toHaveValue('101')
    expect(onDoi).not.toHaveBeenCalled()
    expect(docThiep().tuyChinhChu?.[ID_CO_DAU]).toEqual({
      coChu: 30,
      x: 5,
      y: -4,
    })
  })

  it('gõ số nhiều chữ số và thập phân không làm remount mất focus', async () => {
    render(
      <KhungBangChinhChu chonBanDau={ID_CO_DAU} />,
    )
    const toaDoX = screen.getByLabelText('Tọa độ X vùng chữ')
    const user = userEvent.setup()

    await user.type(toaDoX, '42.5')

    expect(toaDoX).toHaveValue('42.5')
    expect(toaDoX).toHaveFocus()
    expect(docThiep().tuyChinhChu?.[ID_CO_DAU]?.x).toBe(42.5)
  })

  it('không làm raw số dở dang sống lại khi source đổi đi rồi quay lại', () => {
    const onDoi = vi.fn()
    const thiepX5 = {
      ...thiepMau,
      tuyChinhChu: { [ID_CO_DAU]: { x: 5 } },
    }
    const { rerender } = render(
      <BangChinhChu
        thiep={thiepX5}
        dangChon={ID_CO_DAU}
        onChon={vi.fn()}
        onDoi={onDoi}
      />,
    )

    fireEvent.change(screen.getByLabelText('Tọa độ X vùng chữ'), {
      target: { value: '.' },
    })
    rerender(
      <BangChinhChu
        thiep={{
          ...thiepX5,
          tuyChinhChu: { [ID_CO_DAU]: { x: 10 } },
        }}
        dangChon={ID_CO_DAU}
        onChon={vi.fn()}
        onDoi={onDoi}
      />,
    )
    expect(screen.getByLabelText('Tọa độ X vùng chữ')).toHaveValue('10')

    rerender(
      <BangChinhChu
        thiep={thiepX5}
        dangChon={ID_CO_DAU}
        onChon={vi.fn()}
        onDoi={onDoi}
      />,
    )
    expect(screen.getByLabelText('Tọa độ X vùng chữ')).toHaveValue('5')
  })

  it('giữ mã màu sai ở local state, báo lỗi và chỉ commit mã hợp lệ', async () => {
    const onDoi = vi.fn()
    render(<KhungBangChinhChu onDoi={onDoi} />)
    await chonVung(ID_CO_DAU)
    onDoi.mockClear()

    fireEvent.change(screen.getByLabelText('Màu chữ vùng chữ'), {
      target: { value: '#12' },
    })

    expect(screen.getByLabelText('Màu chữ vùng chữ')).toHaveValue('#12')
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Mã màu phải có dạng #RRGGBB',
    )
    expect(onDoi).not.toHaveBeenCalled()

    fireEvent.change(screen.getByLabelText('Màu chữ vùng chữ'), {
      target: { value: '#abcdef' },
    })

    expect(docThiep().tuyChinhChu?.[ID_CO_DAU]?.mauChu).toBe('#abcdef')
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('không làm raw màu sai sống lại khi source đổi đi rồi quay lại', () => {
    const onDoi = vi.fn()
    const thiepMauCu = {
      ...thiepMau,
      tuyChinhChu: { [ID_CO_DAU]: { mauChu: '#111111' } },
    }
    const { rerender } = render(
      <BangChinhChu
        thiep={thiepMauCu}
        dangChon={ID_CO_DAU}
        onChon={vi.fn()}
        onDoi={onDoi}
      />,
    )

    fireEvent.change(screen.getByLabelText('Màu chữ vùng chữ'), {
      target: { value: '#12' },
    })
    rerender(
      <BangChinhChu
        thiep={{
          ...thiepMauCu,
          tuyChinhChu: { [ID_CO_DAU]: { mauChu: '#222222' } },
        }}
        dangChon={ID_CO_DAU}
        onChon={vi.fn()}
        onDoi={onDoi}
      />,
    )
    expect(screen.getByLabelText('Màu chữ vùng chữ')).toHaveValue('#222222')

    rerender(
      <BangChinhChu
        thiep={thiepMauCu}
        dangChon={ID_CO_DAU}
        onChon={vi.fn()}
        onDoi={onDoi}
      />,
    )
    expect(screen.getByLabelText('Màu chữ vùng chữ')).toHaveValue('#111111')
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('reset vị trí và style chỉ xóa đúng các khóa tương ứng', async () => {
    render(
      <KhungBangChinhChu
        banDau={{
          ...thiepMau,
          tuyChinhChu: {
            [ID_LOI_MO_DAU]: {
              noiDung: 'Kính mời',
              font: 'viet-tay',
              coChu: 36,
              mauChu: '#123456',
              x: 12,
              y: -8,
            },
          },
        }}
      />,
    )
    await chonVung(ID_LOI_MO_DAU)

    await userEvent.click(
      screen.getByRole('button', { name: 'Đặt lại vị trí vùng chữ' }),
    )
    expect(docThiep().tuyChinhChu?.[ID_LOI_MO_DAU]).toEqual({
      noiDung: 'Kính mời',
      font: 'viet-tay',
      coChu: 36,
      mauChu: '#123456',
    })

    await userEvent.click(
      screen.getByRole('button', { name: 'Đặt lại kiểu chữ vùng chữ' }),
    )
    expect(docThiep().tuyChinhChu?.[ID_LOI_MO_DAU]).toEqual({
      noiDung: 'Kính mời',
    })
  })

  it('không cho sửa nội dung sinh từ dữ liệu', async () => {
    render(<KhungBangChinhChu />)
    await chonVung('dem-nguoc.thang')

    expect(screen.getByLabelText('Nội dung vùng chữ')).toBeDisabled()
  })

  it('color picker và ô mã màu dùng chung giá trị hợp lệ', async () => {
    render(<KhungBangChinhChu />)
    await chonVung(ID_CO_DAU)

    fireEvent.change(screen.getByLabelText('Bộ chọn màu chữ vùng chữ'), {
      target: { value: '#654321' },
    })

    expect(screen.getByLabelText('Màu chữ vùng chữ')).toHaveValue('#654321')
    expect(docThiep().tuyChinhChu?.[ID_CO_DAU]?.mauChu).toBe('#654321')
  })
})
