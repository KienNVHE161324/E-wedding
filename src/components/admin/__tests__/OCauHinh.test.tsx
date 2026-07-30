import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { taoGoiCauHinh } from '@/lib/invitation/cauHinh'
import { thiepMau } from '@/lib/invitation/mau'
import { OCauHinh } from '../OCauHinh'

describe('OCauHinh', () => {
  it('bổ sung ID deterministic khi nhập cấu hình legacy', async () => {
    const onNhap = vi.fn()
    const legacy = {
      ...thiepMau,
      suKien: thiepMau.suKien.map((item) => ({ ...item, id: undefined })),
      chuyenChungMinh: thiepMau.chuyenChungMinh.map((item) => ({ ...item, id: undefined })),
    }
    const file = new File(
      [JSON.stringify(taoGoiCauHinh(legacy, new Date('2026-07-30T00:00:00Z')))],
      'legacy.json',
      { type: 'application/json' },
    )

    render(<OCauHinh thiep={thiepMau} onNhap={onNhap} />)
    await userEvent.upload(screen.getByLabelText('Tệp cấu hình'), file)

    await waitFor(() => expect(onNhap).toHaveBeenCalledOnce())
    const imported = onNhap.mock.calls[0][0]
    expect(imported.suKien[0].id).toBe('legacy-su-kien-0')
    expect(imported.chuyenChungMinh[0].id).toBe('legacy-chuyen-chung-minh-0')
  })
})
