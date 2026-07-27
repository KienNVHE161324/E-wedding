import { describe, it, expect, afterEach, vi } from 'vitest'
import { layKhoLuuTru } from '../index'

const BIEN_R2 = {
  R2_ACCOUNT_ID: 'acc',
  R2_ACCESS_KEY_ID: 'key',
  R2_SECRET_ACCESS_KEY: 'secret',
  R2_BUCKET: 'thiep',
  R2_PUBLIC_URL: 'https://anh.example.com',
}

function datBien(bien: Record<string, string>) {
  for (const [k, v] of Object.entries(bien)) vi.stubEnv(k, v)
}

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('layKhoLuuTru', () => {
  it('mặc định dùng Cloudflare R2', () => {
    datBien(BIEN_R2)
    expect(layKhoLuuTru().ten).toBe('Cloudflare R2')
  })

  it('chọn được ổ đĩa máy chủ', () => {
    vi.stubEnv('NOI_LUU_ANH', 'o-dia')
    expect(layKhoLuuTru().ten).toBe('ổ đĩa máy chủ')
  })

  it('chọn được Supabase Storage', () => {
    vi.stubEnv('NOI_LUU_ANH', 'supabase')
    expect(layKhoLuuTru().ten).toBe('Supabase Storage')
  })

  it('báo lỗi rõ ràng khi cấu hình sai tên', () => {
    vi.stubEnv('NOI_LUU_ANH', 'dropbox')
    expect(() => layKhoLuuTru()).toThrow('NOI_LUU_ANH không hợp lệ: dropbox')
  })

  it('báo rõ biến R2 nào bị thiếu thay vì hỏng lúc chạy', () => {
    datBien(BIEN_R2)
    vi.stubEnv('R2_BUCKET', '')
    expect(() => layKhoLuuTru()).toThrow('Thiếu biến môi trường R2_BUCKET')
  })
})
