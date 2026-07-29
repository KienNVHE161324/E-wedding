import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Bia } from '../Bia'
import { thiepMau } from '@/lib/invitation/mau'
import { layTheme } from '@/lib/themes'

const theme = layTheme('mac-dinh')

describe('Bìa', () => {
  it('bỏ qua dữ liệu mẫu bìa cũ và vẫn dựng nội dung chính', () => {
    const thiepVoiDuLieuBiaCu = {
      ...thiepMau,
      bia: {
        mauId: 'd1-2-giay-do',
        noiDung: 'Nội dung thay thế không được hiển thị',
        font: 'sans-sach',
        coChu: 28,
        mauChu: '#123456',
        canLe: 'left',
      },
    } as typeof thiepMau

    render(
      <Bia
        thiep={thiepVoiDuLieuBiaCu}
        theme={theme}
        onMoThiep={() => undefined}
      />,
    )

    const tenHaiNguoi = screen.getByRole('heading', { level: 1 })
    expect(tenHaiNguoi).toHaveTextContent(thiepMau.chuRe.ten)
    expect(tenHaiNguoi).toHaveTextContent(thiepMau.coDau.ten)
    expect(screen.getByRole('button', { name: 'Mở thiệp' })).toBeInTheDocument()
    expect(screen.queryByText('Nội dung thay thế không được hiển thị')).not.toBeInTheDocument()
  })
})
