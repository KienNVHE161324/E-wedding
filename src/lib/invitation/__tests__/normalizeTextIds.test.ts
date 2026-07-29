import { describe, expect, it } from 'vitest'
import { thiepMau } from '../mau'
import { damBaoIdVungChu } from '../normalizeTextIds'
import type { Invitation } from '../types'

describe('damBaoIdVungChu', () => {
  it('bổ sung ID ổn định cho vùng chữ lặp lại và không thay đổi đầu vào', () => {
    const ids = [
      '00000000-0000-4000-8000-000000000001',
      '00000000-0000-4000-8000-000000000002',
    ]
    let i = 0
    const thiep: Invitation = {
      ...thiepMau,
      suKien: [{ ngay: '2026-09-29', gio: '09:00', ten: 'Đón khách' }],
      chuyenChungMinh: [{ anh: thiepMau.album[0], tieuDe: 'Gặp nhau', noiDung: '...' }],
    }

    const ketQua = damBaoIdVungChu(thiep, () => ids[i++])

    expect(ketQua.suKien[0].id).toBe(ids[0])
    expect(ketQua.chuyenChungMinh[0].id).toBe(ids[1])
    expect(damBaoIdVungChu(ketQua, () => crypto.randomUUID())).toEqual(ketQua)
    expect(ketQua).not.toBe(thiep)
    expect(thiep.suKien[0].id).toBeUndefined()
    expect(thiep.chuyenChungMinh[0].id).toBeUndefined()
  })
})
