import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SuKien } from '../SuKien'
import { DemNguoc } from '../DemNguoc'
import { thiepMau } from '@/lib/invitation/mau'
import { layTheme } from '@/lib/themes'
import type { SuKien as MocLichTrinh } from '@/lib/invitation/types'

const theme = layTheme('mac-dinh')

const moc = (ngay: string, gio: string, ten: string): MocLichTrinh => ({
  ngay,
  gio,
  ten,
  diaDiem: '',
  diaChi: '',
})

function ve(suKien: MocLichTrinh[]) {
  return render(<SuKien thiep={{ ...thiepMau, suKien }} theme={theme} />)
}

describe('Lịch trình đám cưới', () => {
  it('hiện đủ các mốc kèm giờ', () => {
    ve(thiepMau.suKien)
    expect(screen.getByText(/Đón dâu/)).toBeInTheDocument()
    expect(screen.getByText(/Lễ Vu Quy/)).toBeInTheDocument()
    expect(screen.getByText(/Tiệc cưới/)).toBeInTheDocument()
    expect(screen.getByText('06:30')).toBeInTheDocument()
  })

  it('xếp mốc theo giờ dù nhập lộn xộn', () => {
    const { container } = ve([
      moc('2026-11-14', '11:00', 'Tiệc'),
      moc('2026-11-14', '06:30', 'Đón dâu'),
      moc('2026-11-14', '09:00', 'Lễ'),
    ])
    const thuTu = Array.from(container.querySelectorAll('li')).map((li) => li.textContent ?? '')
    expect(thuTu[0]).toContain('Đón dâu')
    expect(thuTu[1]).toContain('Lễ')
    expect(thuTu[2]).toContain('Tiệc')
  })

  it('ghi nhãn ngày một lần cho mỗi ngày, không lặp lại', () => {
    ve([
      moc('2026-11-14', '06:30', 'Đón dâu'),
      moc('2026-11-14', '09:00', 'Lễ'),
      moc('2026-11-15', '11:00', 'Tiệc'),
    ])
    expect(screen.getAllByText(/14\/11\/2026/)).toHaveLength(1)
    expect(screen.getAllByText(/15\/11\/2026/)).toHaveLength(1)
  })

  it('ghi đúng thứ trong tuần', () => {
    ve([moc('2026-11-14', '09:00', 'Lễ')])
    // 14/11/2026 là Thứ Bảy.
    expect(screen.getByText(/THỨ BẢY/)).toBeInTheDocument()
  })

  it('chỉ hiện nút chỉ đường ở mốc có link', () => {
    ve([
      { ...moc('2026-11-14', '09:00', 'Lễ'), linkChiDuong: 'https://maps.google.com/?q=x' },
      moc('2026-11-14', '11:00', 'Tiệc'),
    ])
    expect(screen.getAllByRole('link', { name: 'Chỉ đường' })).toHaveLength(1)
  })

  it('không dùng iframe bản đồ', () => {
    const { container } = ve(thiepMau.suKien)
    expect(container.querySelector('iframe')).toBeNull()
  })

  it('tự ẩn khi chưa nhập mốc nào', () => {
    const { container } = ve([])
    expect(container.querySelector('[data-section="su-kien"]')).toBeNull()
  })
})

describe('Lịch tháng', () => {
  it('hiện đúng tên tháng của ngày cưới', () => {
    render(<DemNguoc thiep={thiepMau} theme={theme} />)
    expect(screen.getByText('THÁNG 11 NĂM 2026')).toBeInTheDocument()
  })

  it('có đủ bảy cột thứ, bắt đầu từ Thứ Hai', () => {
    render(<DemNguoc thiep={thiepMau} theme={theme} />)
    const cot = screen.getAllByRole('columnheader')
    expect(cot).toHaveLength(7)
    expect(cot[0]).toHaveTextContent('T2')
    expect(cot[6]).toHaveTextContent('CN')
  })

  it('khoanh đúng một ngày cưới', () => {
    const { container } = render(<DemNguoc thiep={thiepMau} theme={theme} />)
    const daKhoanh = container.querySelectorAll('[aria-current="date"]')
    expect(daKhoanh).toHaveLength(1)
    expect(daKhoanh[0]).toHaveTextContent('14')
  })

  it('khoanh lại đúng khi đổi ngày cưới', () => {
    const { container } = render(
      <DemNguoc thiep={{ ...thiepMau, ngayCuoi: '2026-11-02' }} theme={theme} />,
    )
    expect(container.querySelector('[aria-current="date"]')).toHaveTextContent('2')
  })
})
