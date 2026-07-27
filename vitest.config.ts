import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'node:path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    // Test gõ phím mô phỏng chạy chậm khi cả bộ chạy song song; 5 giây mặc định
    // gây báo hỏng giả trên máy đang tải nặng.
    testTimeout: 20_000,
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
})
