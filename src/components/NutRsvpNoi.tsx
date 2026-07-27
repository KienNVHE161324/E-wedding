'use client'

/** Nút bám màn hình, hiện suốt lúc cuộn để khách không phải đi tìm form. */
export function NutRsvpNoi() {
  return (
    <a
      href="#rsvp"
      className="fixed bottom-5 left-1/2 z-40 -translate-x-1/2 rounded-full px-7 py-3 text-white shadow-lg"
      style={{ backgroundColor: 'var(--mau-chinh)' }}
    >
      Xác nhận tham dự
    </a>
  )
}
