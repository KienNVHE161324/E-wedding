import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { TextEditorBridge } from '@/components/text/TextEditorBridge'
import { thiepMau } from '@/lib/invitation/mau'
import { layTheme } from '@/lib/themes'
import { Album } from '../Album'
import { Bia } from '../Bia'
import { CoDauChuRe } from '../CoDauChuRe'
import { DemNguoc } from '../DemNguoc'
import { DressCode } from '../DressCode'
import { Rsvp } from '../Rsvp'

const theme = layTheme('mac-dinh')

function ids(container: HTMLElement): string[] {
  return Array.from(container.querySelectorAll('[data-text-region]')).map((element) =>
    element.getAttribute('data-text-region'),
  ).filter((id): id is string => id !== null)
}

describe('các vùng chữ tĩnh', () => {
  it('đăng ký đầy đủ vùng bìa và áp dụng ghi đè trong các phần tử ngữ nghĩa', () => {
    const { container } = render(
      <Bia
        thiep={{
          ...thiepMau,
          tuyChinhChu: {
            'bia.loi-mo-dau': { noiDung: 'Trân trọng kính mời', mauChu: '#123456' },
          },
        }}
        theme={theme}
        onMoThiep={() => undefined}
      />,
    )

    expect(ids(container)).toEqual(expect.arrayContaining([
      'bia.loi-mo-dau',
      'bia.chu-re.ten',
      'bia.ky-hieu-noi',
      'bia.co-dau.ten',
      'bia.nut-mo',
    ]))
    const loiMoDau = screen.getByText('Trân trọng kính mời')
    expect(loiMoDau).toHaveStyle({ color: 'rgb(18, 52, 86)' })
    expect(loiMoDau.closest('p')).not.toBeNull()
    expect(container.querySelector('[data-text-region="bia.chu-re.ten"]')?.closest('h1')).not.toBeNull()
  })

  it('đăng ký vùng đếm ngược theo nhóm và không đăng ký từng ô lịch', () => {
    const { container } = render(
      <DemNguoc
        thiep={{
          ...thiepMau,
          tuyChinhChu: {
            'dem-nguoc.tieu-de': { noiDung: 'Lưu ngày này', mauChu: '#123456' },
          },
        }}
        theme={theme}
      />,
    )

    expect(ids(container)).toEqual(expect.arrayContaining([
      'dem-nguoc.tieu-de',
      'dem-nguoc.thang',
      'dem-nguoc.thu',
      'dem-nguoc.ngay',
    ]))
    const tieuDe = screen.getByText('Lưu ngày này')
    expect(tieuDe).toHaveStyle({ color: 'rgb(18, 52, 86)' })
    expect(tieuDe.closest('h2')).not.toBeNull()
    expect(container.querySelectorAll('[data-text-region^="dem-nguoc.ngay."]')).toHaveLength(0)
  })

  it('đăng ký đầy đủ vùng cô dâu chú rể và áp dụng ghi đè', () => {
    const { container } = render(
      <CoDauChuRe
        thiep={{
          ...thiepMau,
          tuyChinhChu: {
            'co-dau-chu-re.tieu-de': { noiDung: 'Chúng mình', mauChu: '#123456' },
          },
        }}
        theme={theme}
      />,
    )

    expect(ids(container)).toEqual(expect.arrayContaining([
      'co-dau-chu-re.tieu-de',
      'co-dau-chu-re.ky-hieu-noi',
      'co-dau-chu-re.chu-re.vai-tro',
      'co-dau-chu-re.chu-re.ten',
      'co-dau-chu-re.chu-re.gioi-thieu',
      'co-dau-chu-re.chu-re.ten-bo',
      'co-dau-chu-re.chu-re.ten-me',
      'co-dau-chu-re.co-dau.vai-tro',
      'co-dau-chu-re.co-dau.ten',
      'co-dau-chu-re.co-dau.gioi-thieu',
      'co-dau-chu-re.co-dau.ten-bo',
      'co-dau-chu-re.co-dau.ten-me',
    ]))
    expect(screen.getByText('Chúng mình')).toHaveStyle({ color: 'rgb(18, 52, 86)' })
  })

  it('đăng ký tiêu đề album và áp dụng ghi đè', () => {
    const { container } = render(
      <Album
        thiep={{
          ...thiepMau,
          tuyChinhChu: { 'album.tieu-de': { noiDung: 'Khoảnh khắc', mauChu: '#123456' } },
        }}
        theme={theme}
      />,
    )

    expect(ids(container)).toEqual(expect.arrayContaining(['album.tieu-de']))
    expect(screen.getByText('Khoảnh khắc')).toHaveStyle({ color: 'rgb(18, 52, 86)' })
  })

  it('đăng ký các vùng dress code và áp dụng ghi đè', () => {
    const { container } = render(
      <DressCode
        thiep={{
          ...thiepMau,
          tuyChinhChu: { 'dress-code.tieu-de': { noiDung: 'Trang phục', mauChu: '#123456' } },
        }}
        theme={theme}
      />,
    )

    expect(ids(container)).toEqual(expect.arrayContaining([
      'dress-code.tieu-de',
      'dress-code.mo-ta',
      'dress-code.huong-dan',
    ]))
    expect(screen.getByText('Trang phục')).toHaveStyle({ color: 'rgb(18, 52, 86)' })
  })

  it('cho phép chọn nút RSVP khi chỉnh sửa nhưng vẫn mở RSVP ở chế độ thường', async () => {
    const onMoRsvp = vi.fn()
    const onChon = vi.fn()
    const thiep = {
      ...thiepMau,
      tuyChinhChu: { 'rsvp.nut-mo': { noiDung: 'Mở biểu mẫu', mauChu: '#123456' } },
    }
    const { container, rerender } = render(<Rsvp thiep={thiep} theme={theme} onMoRsvp={onMoRsvp} />)

    expect(ids(container)).toEqual(expect.arrayContaining([
      'rsvp.tieu-de',
      'rsvp.loi-moi',
      'rsvp.nut-mo',
    ]))
    const button = screen.getByRole('button', { name: 'Mở biểu mẫu' })
    expect(screen.getByText('Mở biểu mẫu')).toHaveStyle({ color: 'rgb(18, 52, 86)' })
    await userEvent.click(button)
    expect(onMoRsvp).toHaveBeenCalledOnce()

    rerender(
      <TextEditorBridge.Provider
        value={{
          dangChinh: true,
          dangChon: null,
          chon: onChon,
          batDauKeo: vi.fn(),
          dichBangPhim: vi.fn(),
        }}
      >
        <Rsvp thiep={thiep} theme={theme} onMoRsvp={onMoRsvp} />
      </TextEditorBridge.Provider>,
    )

    await userEvent.click(screen.getByText('Mở biểu mẫu'))
    expect(onChon).toHaveBeenCalledWith('rsvp.nut-mo')
    expect(onMoRsvp).toHaveBeenCalledOnce()
  })
})
