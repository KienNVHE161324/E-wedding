import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'

// jsdom không phát media; mô phỏng để các test giao diện có nhạc không in cảnh báo giả.
Object.defineProperty(HTMLMediaElement.prototype, 'play', {
  configurable: true,
  value: vi.fn(async () => {}),
})
Object.defineProperty(HTMLMediaElement.prototype, 'pause', {
  configurable: true,
  value: vi.fn(),
})
