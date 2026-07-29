import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
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
})
