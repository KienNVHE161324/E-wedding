import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { OLichTrinh } from '../OLichTrinh'
import type { SuKien } from '@/lib/invitation/types'

describe('OLichTrinh', () => {
  it('gán UUID cho mốc mới và giữ ID khi sửa mốc có sẵn', () => {
    const onDoi = vi.fn()
    const id = '00000000-0000-4000-8000-000000000001'
    const giaTri: SuKien[] = [{ id, ngay: '2026-09-29', gio: '09:00', ten: 'Đón khách' }]

    render(<OLichTrinh giaTri={giaTri} ngayCuoi="2026-09-29" slug="nam-linh" onDoi={onDoi} />)

    fireEvent.change(screen.getByLabelText('Tên mốc 1'), { target: { value: 'Lễ vu quy' } })
    expect(onDoi.mock.calls.at(-1)?.[0][0]).toMatchObject({ id, ten: 'Lễ vu quy' })

    fireEvent.click(screen.getByRole('button', { name: 'Thêm mốc lịch trình' }))
    expect(onDoi.mock.calls.at(-1)?.[0][1]).toMatchObject({
      ngay: '2026-09-29',
      gio: '09:00',
      ten: '',
      id: expect.stringMatching(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      ),
    })
  })
})
