import { readFileSync } from 'node:fs'
import { defineConfig, devices } from '@playwright/test'

// Playwright chạy ngoài Next nên không tự đọc .env.local. Nạp thủ công để
// các spec lấy được tài khoản kiểm thử.
try {
  for (const dong of readFileSync('.env.local', 'utf8').split(/\r?\n/)) {
    if (!dong.trim() || dong.startsWith('#')) continue
    const i = dong.indexOf('=')
    if (i < 0) continue
    const ten = dong.slice(0, i).trim()
    if (process.env[ten]) continue
    process.env[ten] = dong.slice(i + 1).trim().replace(/^"|"$/g, '')
  }
} catch {
  // Không có .env.local thì để spec tự báo thiếu biến.
}

export default defineConfig({
  testDir: './e2e',
  use: { baseURL: 'http://localhost:3000' },
  projects: [
    { name: 'mobile', use: { ...devices['iPhone 13'] } },
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    command: 'npm run build && npm run start',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
})
