import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SuKien } from '../SuKien'
import { DemNguoc } from '../DemNguoc'
import { thiepMau } from '@/lib/invitation/mau'
import { layTheme } from '@/lib/themes'
import type { SuKien as MocLichTrinh } from '@/lib/invitation/types'

const theme = layTheme('mac-dinh')

const moc = (ngay: string, gio: string, ten: string, id?: string): MocLichTrinh => ({
  ...(id ? { id } : {}),
  ngay,
  gio,
  ten,
  diaDiem: '',
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

  it('giữ style theo ID đã lưu sau khi sắp xếp lại lịch trình', () => {
    const eventA = {
      ...moc('2026-11-14', '11:00', 'Tiệc bên A', 'event-a'),
      diaDiem: 'Sảnh A',
    }
    const eventB = {
      ...moc('2026-11-14', '06:30', 'Lễ bên B', 'event-b'),
      diaDiem: 'Sảnh B',
    }
    const { container } = render(
      <SuKien
        thiep={{
          ...thiepMau,
          suKien: [eventA, eventB],
          tuyChinhChu: {
            'su-kien.event-a.ten': { mauChu: '#123456', x: 3 },
            'su-kien.event-b.ten': { mauChu: '#654321', x: -2 },
          },
        }}
        theme={theme}
      />,
    )

    const tenTheoThuTu = Array.from(
      container.querySelectorAll('[data-text-region$=".ten"]'),
    ).map((vung) => vung.getAttribute('data-text-region'))
    expect(tenTheoThuTu).toEqual([
      'su-kien.event-b.ten',
      'su-kien.event-a.ten',
    ])

    const tenA = container.querySelector(
      '[data-text-region="su-kien.event-a.ten"]',
    ) as HTMLElement
    const tenB = container.querySelector(
      '[data-text-region="su-kien.event-b.ten"]',
    ) as HTMLElement
    expect(tenA).toHaveTextContent('Tiệc bên A')
    expect(tenA.style.color).toBe('rgb(18, 52, 86)')
    expect(tenA.style.transform).toBe('translate(3cqw, 0cqw)')
    expect(tenB).toHaveTextContent('Lễ bên B')
    expect(tenB.style.color).toBe('rgb(101, 67, 33)')
    expect(tenB.style.transform).toBe('translate(-2cqw, 0cqw)')

    expect(
      container.querySelector('[data-text-region="su-kien.tieu-de"]'),
    ).toBeInTheDocument()
    expect(
      container.querySelector('[data-text-region="su-kien.ngay.2026-11-14"]'),
    ).toBeInTheDocument()
    for (const id of ['event-a', 'event-b']) {
      for (const truong of ['gio', 'ten', 'dia-diem', 'nut-them-lich']) {
        expect(
          container.querySelector(`[data-text-region="su-kien.${id}.${truong}"]`),
        ).toBeInTheDocument()
      }
    }
  })

  it('không tạo ID theo chỉ số cho sự kiện dữ liệu cũ thiếu ID', () => {
    const { container } = ve([
      {
        ...moc('2026-11-14', '09:00', 'Mốc dữ liệu cũ'),
        diaDiem: 'Địa điểm cũ',
      },
    ])

    expect(screen.getByText('Mốc dữ liệu cũ')).not.toHaveAttribute(
      'data-text-region',
    )
    expect(screen.getByText('Địa điểm cũ')).not.toHaveAttribute(
      'data-text-region',
    )
    expect(
      container.querySelector('[data-text-region^="su-kien.undefined."]'),
    ).not.toBeInTheDocument()
    expect(
      container.querySelector('[data-text-region^="su-kien.0."]'),
    ).not.toBeInTheDocument()
  })

  it('giữ các sự kiện có ID trùng là chữ thường thay vì tạo vùng mơ hồ', () => {
    const { container } = ve([
      {
        ...moc('2026-11-14', '07:00', 'Mốc trùng đầu', 'event-duplicate'),
        diaDiem: 'Địa điểm đầu',
      },
      {
        ...moc('2026-11-14', '10:00', 'Mốc trùng sau', 'event-duplicate'),
        diaDiem: 'Địa điểm sau',
      },
    ])

    expect(
      container.querySelectorAll(
        '[data-text-region^="su-kien.event-duplicate."]',
      ),
    ).toHaveLength(0)
    for (const noiDung of [
      'Mốc trùng đầu',
      'Địa điểm đầu',
      'Mốc trùng sau',
      'Địa điểm sau',
    ]) {
      expect(screen.getByText(noiDung)).not.toHaveAttribute('data-text-region')
    }
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

  it('hiện lịch trình dạng mục lục một trục có node', () => {
    const { container } = ve(thiepMau.suKien)
    expect(screen.getAllByTestId('timeline-truc')).toHaveLength(2)
    expect(screen.getAllByTestId('timeline-node')).toHaveLength(thiepMau.suKien.length)
    expect(container.querySelectorAll('svg')).toHaveLength(thiepMau.suKien.length)
  })

  it('có nút thêm từng mốc vào lịch', () => {
    ve(thiepMau.suKien)
    const nut = screen.getAllByRole('link', { name: 'Thêm vào lịch' })
    expect(nut).toHaveLength(thiepMau.suKien.length)
    expect(nut[0]).toHaveAttribute('href', expect.stringMatching(/^data:text\/calendar/))
    expect(nut[0]).toHaveAttribute('download', expect.stringMatching(/\.ics$/))
    expect(nut[0]).not.toHaveAttribute('target')
    expect(nut[0].className).toContain('px-3')
    expect(nut[0].className).toContain('py-1.5')
    expect(nut[0].querySelector('svg')).toBeInTheDocument()
    expect(nut[0].getAttribute('href')).not.toContain('calendar.google.com')
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
