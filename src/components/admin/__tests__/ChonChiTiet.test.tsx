import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ChonChiTiet } from '../ChonChiTiet'
import { DANH_SACH_HOA_TIET } from '@/lib/motifs/danhSach'

const ID_D1_2 =
  'primary-decor/wedding-ritual/thiep-phong-bi-giay-do-trien-doi-chim-01'

describe('ChonChiTiet', () => {
  it('thêm chi tiết D1 vào section đang chọn mà không giới hạn ở bìa', async () => {
    const d1 = DANH_SACH_HOA_TIET.find((muc) => muc.id === ID_D1_2)
    expect(d1).toBeDefined()

    const onDoi = vi.fn()
    render(<ChonChiTiet giaTri={[]} section="album" onDoi={onDoi} />)

    await userEvent.click(screen.getByRole('button', { name: 'Thêm chi tiết' }))
    await userEvent.selectOptions(screen.getByLabelText('Nhóm chi tiết'), d1!.nhom)
    await userEvent.click(screen.getByRole('button', { name: `Thêm ${d1!.nhan}` }))

    expect(onDoi).toHaveBeenCalledWith([
      expect.objectContaining({
        id: ID_D1_2,
        section: 'album',
      }),
    ])
  })

  it('khởi tạo cấu hình chữ mặc định khi thêm D1', async () => {
    const d1 = DANH_SACH_HOA_TIET.find((muc) => muc.id === ID_D1_2)!
    const onDoi = vi.fn()
    render(<ChonChiTiet giaTri={[]} section="album" onDoi={onDoi} />)

    await userEvent.click(screen.getByRole('button', { name: 'Thêm chi tiết' }))
    await userEvent.selectOptions(screen.getByLabelText('Nhóm chi tiết'), d1.nhom)
    await userEvent.click(screen.getByRole('button', { name: `Thêm ${d1.nhan}` }))

    expect(onDoi).toHaveBeenCalledWith([
      expect.objectContaining({
        id: ID_D1_2,
        section: 'album',
        chu: expect.objectContaining({ noiDung: '', canLe: 'center' }),
      }),
    ])
  })

  it('cho nhập chữ trên D1', () => {
    const d1 = DANH_SACH_HOA_TIET.find((muc) => muc.id === ID_D1_2)!
    const banDau = {
      id: d1.id,
      section: 'album' as const,
      x: 50,
      y: 50,
      mau: '#8B2F20',
      doDam: 1,
      kichThuoc: 60,
      raSauChu: true,
      chu: {
        noiDung: '',
        font: 'serif-co-dien' as const,
        coChu: 27,
        mauChu: '#6B2F24',
        canLe: 'center' as const,
      },
    }
    const onDoi = vi.fn()
    render(<ChonChiTiet giaTri={[banDau]} section="album" onDoi={onDoi} />)

    fireEvent.change(screen.getByLabelText('Chữ trên thiệp'), {
      target: { value: 'Kính mời' },
    })

    expect(onDoi).toHaveBeenCalledWith([
      expect.objectContaining({
        chu: expect.objectContaining({ noiDung: 'Kính mời' }),
      }),
    ])
  })

  it('lưu font viet-tay cho chữ trên D1', async () => {
    const d1 = DANH_SACH_HOA_TIET.find((muc) => muc.id === ID_D1_2)!
    const banDau = {
      id: d1.id,
      section: 'album' as const,
      x: 50,
      y: 50,
      mau: '#8B2F20',
      doDam: 1,
      kichThuoc: 60,
      raSauChu: true,
      chu: {
        noiDung: '',
        font: 'serif-co-dien' as const,
        coChu: 27,
        mauChu: '#6B2F24',
        canLe: 'center' as const,
      },
    }
    const onDoi = vi.fn()
    render(<ChonChiTiet giaTri={[banDau]} section="album" onDoi={onDoi} />)

    await userEvent.selectOptions(screen.getByLabelText('Phông chữ trên thiệp'), 'viet-tay')

    expect(onDoi).toHaveBeenLastCalledWith([
      expect.objectContaining({
        chu: expect.objectContaining({ font: 'viet-tay' }),
      }),
    ])
  })

  it('không hiện ô chữ cho họa tiết thường', () => {
    const thuong = DANH_SACH_HOA_TIET.find((muc) => muc.id !== ID_D1_2)!
    render(
      <ChonChiTiet
        giaTri={[
          {
            id: thuong.id,
            section: 'bia',
            x: 50,
            y: 50,
            mau: '#8B2F20',
            doDam: 1,
            kichThuoc: 25,
          },
        ]}
        section="bia"
        onDoi={() => undefined}
      />,
    )

    expect(screen.queryByLabelText('Chữ trên thiệp')).not.toBeInTheDocument()
  })
})
