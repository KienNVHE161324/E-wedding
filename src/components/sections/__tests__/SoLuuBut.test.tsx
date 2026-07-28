import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SoLuuBut } from '../SoLuuBut'
import { thiepMau } from '@/lib/invitation/mau'
import { layTheme } from '@/lib/themes'
import type { LoiChucDayDu } from '@/lib/db/loiChuc'

const theme = layTheme('mac-dinh')

const lc = (id: string, hoTen: string, noiDung: string): LoiChucDayDu => ({
  id,
  hoTen,
  noiDung,
  ngayGui: '2026-10-01T03:00:00.000Z',
})

function ve(loiChuc: LoiChucDayDu[] = []) {
  return render(<SoLuuBut thiep={thiepMau} theme={theme} loiChuc={loiChuc} />)
}

beforeEach(() => {
  vi.stubGlobal(
    'fetch',
    vi.fn(
      async () =>
        new Response(
          JSON.stringify({ ok: true, loiChuc: lc('moi', 'Lê Văn Toàn', 'Chúc trăm năm hạnh phúc') }),
        ),
    ),
  )
})

async function vietLoiChuc() {
  await userEvent.click(screen.getByRole('button', { name: 'Gửi lời chúc' }))
  await userEvent.type(screen.getByLabelText('Tên của bạn'), 'Lê Văn Toàn')
  await userEvent.type(screen.getByLabelText('Lời chúc'), 'Chúc trăm năm hạnh phúc')
  await userEvent.click(screen.getByRole('button', { name: 'Gửi lời chúc ngay' }))
}

describe('Sổ lưu bút', () => {
  it('mặc định chỉ hiện lịch sử và nút mở popup', () => {
    ve([lc('1', 'Nguyễn A', 'Chúc mừng hạnh phúc')])
    expect(screen.queryByLabelText('Tên của bạn')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Gửi lời chúc' })).toBeInTheDocument()
    expect(screen.getByTestId('lich-su-loi-chuc')).toHaveClass('overflow-y-auto')
  })

  it('mở popup và đóng bằng phím Escape', async () => {
    ve()
    await userEvent.click(screen.getByRole('button', { name: 'Gửi lời chúc' }))
    expect(screen.getByRole('dialog', { name: 'Gửi lời chúc' })).toBeInTheDocument()
    expect(screen.getByLabelText('Tên của bạn')).toBeInTheDocument()
    await userEvent.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('đóng popup bằng nút đóng', async () => {
    ve()
    await userEvent.click(screen.getByRole('button', { name: 'Gửi lời chúc' }))
    await userEvent.click(screen.getByRole('button', { name: 'Đóng' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('hiện các lời chúc đã có', () => {
    ve([lc('1', 'Nguyễn A', 'Chúc mừng hạnh phúc'), lc('2', 'Trần B', 'Trăm năm bền chặt')])
    expect(screen.getByText('Chúc mừng hạnh phúc')).toBeInTheDocument()
    expect(screen.getByText('— Trần B')).toBeInTheDocument()
  })

  it('báo khi chưa có lời chúc nào', () => {
    ve()
    expect(screen.getByText(/Chưa có lời chúc nào/)).toBeInTheDocument()
  })

  it('gửi đúng dữ liệu kèm mã thiệp', async () => {
    ve()
    await vietLoiChuc()

    const [url, opts] = (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0]
    expect(url).toBe('/api/loi-chuc')
    expect(JSON.parse((opts as RequestInit).body as string)).toEqual({
      slug: 'nam-linh',
      hoTen: 'Lê Văn Toàn',
      noiDung: 'Chúc trăm năm hạnh phúc',
    })
  })

  it('lời vừa viết hiện lên ngay, không chờ tải lại trang', async () => {
    ve()
    await vietLoiChuc()
    expect(await screen.findByText('Chúc trăm năm hạnh phúc')).toBeInTheDocument()
    expect(screen.getByText('— Lê Văn Toàn')).toBeInTheDocument()
  })

  it('cảm ơn sau khi gửi thành công', async () => {
    ve()
    await vietLoiChuc()
    expect(await screen.findByText(/Cảm ơn lời chúc/)).toBeInTheDocument()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('báo lỗi thân thiện khi thiệp đã đóng', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(JSON.stringify({ loi: 'Thiệp này đã đóng.' }), { status: 410 })),
    )
    ve()
    await vietLoiChuc()
    expect(await screen.findByRole('alert')).toHaveTextContent('Thiệp này đã đóng.')
  })
})
