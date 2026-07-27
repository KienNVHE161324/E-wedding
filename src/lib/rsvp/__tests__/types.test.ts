import { describe, it, expect } from 'vitest'
import { rsvpDauVaoSchema } from '../types'

const hopLe = {
  hoTen: 'Lê Văn Toàn',
  ben: 'nha-trai',
  quanHe: 'Bạn học chú rể',
  phuongTien: 'Xe máy',
  ngayAn: '14/11/2026',
  loiChuc: 'Chúc hai bạn trăm năm hạnh phúc.',
}

describe('rsvpDauVaoSchema', () => {
  it('chấp nhận dữ liệu hợp lệ', () => {
    expect(() => rsvpDauVaoSchema.parse(hopLe)).not.toThrow()
  })

  it('chấp nhận form mới không có phương tiện và lời chúc', () => {
    const formDonGian = {
      hoTen: hopLe.hoTen,
      ben: hopLe.ben,
      quanHe: hopLe.quanHe,
      ngayAn: hopLe.ngayAn,
    }
    expect(rsvpDauVaoSchema.parse(formDonGian)).toMatchObject({
      ...formDonGian,
      phuongTien: '',
    })
  })

  it('từ chối họ tên rỗng', () => {
    expect(() => rsvpDauVaoSchema.parse({ ...hopLe, hoTen: '  ' })).toThrow()
  })

  it('từ chối bên không hợp lệ', () => {
    expect(() => rsvpDauVaoSchema.parse({ ...hopLe, ben: 'nha-hang-xom' })).toThrow()
  })

  it('cắt khoảng trắng thừa ở họ tên', () => {
    expect(rsvpDauVaoSchema.parse({ ...hopLe, hoTen: '  Lê Văn Toàn  ' }).hoTen).toBe('Lê Văn Toàn')
  })
})
