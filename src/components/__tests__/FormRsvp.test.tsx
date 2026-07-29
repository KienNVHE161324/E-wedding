import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormRsvp } from '../FormRsvp'
import { thiepMau } from '@/lib/invitation/mau'

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ ok: true }))))
})

async function dienForm() {
  await userEvent.type(screen.getByLabelText('Họ và tên'), 'Lê Văn Toàn')
  await userEvent.selectOptions(screen.getByLabelText('Bạn là khách của'), 'nha-trai')
  await userEvent.type(screen.getByLabelText('Quan hệ với cô dâu/chú rể'), 'Bạn học chú rể')
  await userEvent.selectOptions(screen.getByLabelText('Đến tham dự ngày'), '14/11/2026')
}

describe('Form xác nhận tham dự', () => {
  it('chỉ đăng ký tiêu đề popup, không đăng ký nhãn, option hay nút form', () => {
    const { container } = render(
      <FormRsvp
        thiep={{
          ...thiepMau,
          cauHinhRsvp: {
            truongChuan: [
              'hoTen',
              'ben',
              'quanHe',
              'phuongTien',
              'ngayAn',
              'loiChuc',
            ],
            truongTuyChinh: [
              {
                id: 'bua-an',
                nhan: 'Lựa chọn bữa ăn',
                kieu: 'select',
                luaChon: ['Món chay', 'Món mặn'],
              },
            ],
          },
        }}
      />,
    )

    expect(
      container.querySelector('[data-text-region="popup-rsvp.tieu-de"]'),
    ).toBeInTheDocument()
    for (const nhan of [
      'Họ và tên',
      'Bạn là khách của',
      'Quan hệ với cô dâu/chú rể',
      'Phương tiện di chuyển',
      'Đến tham dự ngày',
      'Lời chúc (không bắt buộc)',
      'Lựa chọn bữa ăn',
    ]) {
      expect(screen.getByText(nhan).closest('[data-text-region]')).toBeNull()
    }
    for (const option of screen.getAllByRole('option')) {
      expect(option).not.toHaveAttribute('data-text-region')
    }
    expect(
      screen.getByRole('button', { name: 'Gửi xác nhận' }).querySelector(
        '[data-text-region]',
      ),
    ).not.toBeInTheDocument()
  })

  it('chỉ hiện các trường cần thiết', () => {
    render(<FormRsvp thiep={thiepMau} />)
    for (const nhan of [
      'Họ và tên',
      'Bạn là khách của',
      'Quan hệ với cô dâu/chú rể',
      'Đến tham dự ngày',
    ]) {
      expect(screen.getByLabelText(nhan)).toBeInTheDocument()
    }
    expect(screen.queryByLabelText('Phương tiện di chuyển')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Lời chúc (không bắt buộc)')).not.toBeInTheDocument()
  })

  it('gửi đúng dữ liệu kèm slug lên API', async () => {
    render(<FormRsvp thiep={thiepMau} />)
    await dienForm()
    await userEvent.click(screen.getByRole('button', { name: 'Gửi xác nhận' }))

    const [url, opts] = (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0]
    expect(url).toBe('/api/rsvp')
    expect(JSON.parse((opts as RequestInit).body as string)).toEqual({
      slug: 'nam-linh',
      hoTen: 'Lê Văn Toàn',
      ben: 'nha-trai',
      quanHe: 'Bạn học chú rể',
      ngayAn: '14/11/2026',
      tuyChinh: {},
    })
  })

  it('hiện và gửi trường tùy chỉnh theo cấu hình thiệp', async () => {
    const thiep = {
      ...thiepMau,
      cauHinhRsvp: {
        ...thiepMau.cauHinhRsvp!,
        truongTuyChinh: [{ id: 'so-nguoi', nhan: 'Số người đi cùng', kieu: 'text' as const, batBuoc: true }],
      },
    }
    render(<FormRsvp thiep={thiep} />)
    await dienForm()
    await userEvent.type(screen.getByLabelText('Số người đi cùng'), '2')
    await userEvent.click(screen.getByRole('button', { name: 'Gửi xác nhận' }))
    const [, opts] = (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0]
    expect(JSON.parse((opts as RequestInit).body as string).tuyChinh).toEqual({ 'so-nguoi': '2' })
  })

  it('hiện lời cảm ơn sau khi gửi thành công', async () => {
    render(<FormRsvp thiep={thiepMau} />)
    await dienForm()
    await userEvent.click(screen.getByRole('button', { name: 'Gửi xác nhận' }))
    expect(await screen.findByText(/Cảm ơn bạn/)).toBeInTheDocument()
  })

  it('báo lỗi thân thiện khi API trả về lỗi', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(JSON.stringify({ loi: 'Thiệp này đã đóng' }), { status: 410 })),
    )
    render(<FormRsvp thiep={thiepMau} />)
    await dienForm()
    await userEvent.click(screen.getByRole('button', { name: 'Gửi xác nhận' }))
    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent('Thiệp này đã đóng')
    expect(alert).not.toHaveAttribute('data-text-region')
  })
})
