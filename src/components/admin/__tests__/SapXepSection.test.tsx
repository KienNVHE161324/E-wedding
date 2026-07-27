import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SapXepSection, TEN_SECTION } from '../SapXepSection'
import type { SectionRef } from '@/lib/invitation/types'

const giaTri: SectionRef[] = [
  { id: 'bia' },
  { id: 'co-dau-chu-re' },
  { id: 'su-kien' },
  { id: 'so-luu-but' },
  { id: 'mung-cuoi' },
]

describe('SapXepSection', () => {
  it('hiện tên tiếng Việt của từng phần', () => {
    render(<SapXepSection giaTri={giaTri} onDoi={() => {}} />)
    expect(screen.getByText('Bìa')).toBeInTheDocument()
    expect(screen.getByText('Cô dâu & Chú rể')).toBeInTheDocument()
    expect(screen.getByText('Lịch trình đám cưới')).toBeInTheDocument()
    expect(screen.getByText('Sổ lưu bút')).toBeInTheDocument()
  })

  it('đẩy một phần lên trên khi bấm chuyển lên', async () => {
    const onDoi = vi.fn()
    render(<SapXepSection giaTri={giaTri} onDoi={onDoi} />)
    await userEvent.click(screen.getAllByRole('button', { name: 'Chuyển lên' })[4])
    expect(onDoi.mock.calls[0][0].slice(0, 5)).toEqual([
      { id: 'bia' },
      { id: 'co-dau-chu-re' },
      { id: 'su-kien' },
      { id: 'mung-cuoi' },
      { id: 'so-luu-but' },
    ])
  })

  it('tắt một phần khi bỏ chọn ô đánh dấu', async () => {
    const onDoi = vi.fn()
    render(<SapXepSection giaTri={giaTri} onDoi={onDoi} />)
    await userEvent.click(screen.getByRole('checkbox', { name: 'Hiện phần Sổ lưu bút' }))
    expect(onDoi.mock.calls[0][0].slice(0, 5)).toEqual([
      { id: 'bia' },
      { id: 'co-dau-chu-re' },
      { id: 'su-kien' },
      { id: 'so-luu-but', enabled: false },
      { id: 'mung-cuoi' },
    ])
  })

  it('bật lại một phần đã tắt', async () => {
    const onDoi = vi.fn()
    const daTat: SectionRef[] = [{ id: 'bia' }, { id: 'album', enabled: false }]
    render(<SapXepSection giaTri={daTat} onDoi={onDoi} />)
    await userEvent.click(screen.getByRole('checkbox', { name: 'Hiện phần Album ảnh' }))
    expect(onDoi.mock.calls[0][0].slice(0, 2)).toEqual([{ id: 'bia' }, { id: 'album' }])
  })

  it('vô hiệu nút chuyển lên ở mục đầu và chuyển xuống ở mục cuối', () => {
    render(<SapXepSection giaTri={giaTri} onDoi={() => {}} />)
    const len = screen.getAllByRole('button', { name: 'Chuyển lên' })
    const xuong = screen.getAllByRole('button', { name: 'Chuyển xuống' })
    expect(len[0]).toBeDisabled()
    expect(xuong[xuong.length - 1]).toBeDisabled()
  })

  it('luôn liệt kê đủ mọi phần dù danh sách truyền vào thiếu', () => {
    render(<SapXepSection giaTri={[{ id: 'bia' }]} onDoi={() => {}} />)
    expect(screen.getAllByRole('checkbox')).toHaveLength(Object.keys(TEN_SECTION).length)
  })

  it('phần bị thiếu trong danh sách được coi là đang tắt', () => {
    render(<SapXepSection giaTri={[{ id: 'bia' }]} onDoi={() => {}} />)
    expect(screen.getByRole('checkbox', { name: 'Hiện phần Album ảnh' })).not.toBeChecked()
  })
})
