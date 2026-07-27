import { describe, it, expect } from 'vitest'
import { ghepDiaChi } from '../r2'

describe('ghepDiaChi', () => {
  it('ghép địa chỉ công khai với khóa tệp', () => {
    expect(ghepDiaChi('https://anh.example.com', 'nam-linh/abc.jpg')).toBe(
      'https://anh.example.com/nam-linh/abc.jpg',
    )
  })

  it('bỏ dấu gạch chéo thừa ở cuối địa chỉ gốc', () => {
    expect(ghepDiaChi('https://anh.example.com///', 'nam-linh/abc.jpg')).toBe(
      'https://anh.example.com/nam-linh/abc.jpg',
    )
  })

  it('bỏ dấu gạch chéo thừa ở đầu khóa tệp', () => {
    expect(ghepDiaChi('https://anh.example.com', '/nam-linh/abc.jpg')).toBe(
      'https://anh.example.com/nam-linh/abc.jpg',
    )
  })

  it('giữ nguyên đường dẫn con nhiều cấp', () => {
    expect(ghepDiaChi('https://anh.example.com/anh', 'a/b/c.png')).toBe(
      'https://anh.example.com/anh/a/b/c.png',
    )
  })
})
