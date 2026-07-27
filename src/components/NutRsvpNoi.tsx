'use client'

/**
 * Nút bám màn hình, mở popup xác nhận tham dự.
 * Nhỏ và phập phồng nhẹ để hút mắt mà không che mất thiệp.
 */
export function NutRsvpNoi({ onMo }: { onMo: () => void }) {
  return (
    <button
      type="button"
      onClick={onMo}
      className="nut-rsvp-noi fixed bottom-5 left-1/2 z-40 -translate-x-1/2 rounded-full px-5 py-2 text-sm text-white shadow-lg"
      style={{ backgroundColor: 'var(--mau-chinh)' }}
    >
      Xác nhận tham dự
    </button>
  )
}
